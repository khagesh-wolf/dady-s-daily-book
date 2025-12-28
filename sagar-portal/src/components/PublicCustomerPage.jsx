import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { User, Loader2, AlertCircle, Download, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Helper function to format currency
const formatCurrency = (amount) => `Rs. ${new Intl.NumberFormat('en-IN').format(amount)}`;

// Helper function to format time
const formatTimestamp = (nepaliDate, createdAt) => {
  if (!createdAt?.toDate) return nepaliDate;
  const jsDate = createdAt.toDate();
  let hours = jsDate.getHours();
  const minutes = jsDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  return `${nepaliDate} (${formattedTime})`;
};

export default function PublicCustomerPage() {
  const { accessKey } = useParams();
  const { t } = useLanguage();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA Installation Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      
      // Show our custom install banner
      // Check if the app is already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the app installation banner
      setShowInstallBanner(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    // Optionally, you could set a flag in localStorage to not show again for a period
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  useEffect(() => {
    // Check if user recently dismissed the install prompt (within 7 days)
    const dismissedTime = localStorage.getItem('pwaInstallDismissed');
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < sevenDays) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessKey) {
        setError('No access token provided.');
        setLoading(false);
        return;
      }

      try {
        // Find the customer with this secret accessKey
        const customerQuery = query(
          collection(db, "customers"), 
          where("accessKey", "==", accessKey), 
          limit(1)
        );
        
        const customerSnapshot = await getDocs(customerQuery);

        if (customerSnapshot.empty) {
          setError('This QR Code is invalid or has expired.');
          setLoading(false);
          return;
        }

        const customerDoc = customerSnapshot.docs[0];
        const customerData = { id: customerDoc.id, ...customerDoc.data() };
        setCustomer(customerData);

        // Use client-side filtering for transactions
        const allTransactionsQuery = query(
          collection(db, "transactions"),
          where("customerId", "==", customerData.id)
        );

        const allTransactionsSnapshot = await getDocs(allTransactionsQuery);
        
        const txList = [];
        allTransactionsSnapshot.forEach(doc => {
          const data = doc.data();
          // Filter out deleted transactions client-side
          if (data.isDeleted !== true) {
            txList.push({ id: doc.id, ...data });
          }
        });
        
        // Sort by date and time
        txList.sort((a, b) => {
          const dateComparison = (b.date || '0').localeCompare(a.date || '0');
          if (dateComparison !== 0) return dateComparison;
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        });

        setTransactions(txList);
        
      } catch (err) {
        setError('Could not load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessKey]);

  // Calculate total due from customer's perspective
  const totalDue = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      // For customer perspective, positive dueAmount means they owe money
      // Negative dueAmount means they are owed money
      return acc + (tx.dueAmount || 0);
    }, 0);
  }, [transactions]);

  const getDueColor = (due) => {
    if (due > 0) return 'text-red-600';  // Customer owes money (red)
    if (due < 0) return 'text-green-600'; // Customer is owed money (green)
    return 'text-gray-800';
  };
  
  const getDueText = (due) => {
    if (due > 0) return `( You Owe )`;
    if (due < 0) return `( You Are Owed )`;
    return 'Balance Settled';
  };

  // Function to get customer-friendly transaction description
  const getCustomerFriendlyDescription = (tx) => {
    if (tx.mainType === 'crops') {
      if (tx.type === 'crop_buy') {
        // Admin bought from customer = Customer sold to admin
        return `Sold ${tx.weight || ''}kg ${tx.cropType || 'crops'} `;
      } else if (tx.type === 'crop_sell') {
        // Admin sold to customer = Customer bought from admin  
        return `Bought ${tx.weight || ''}kg ${tx.cropType || 'crops'} `;
      }
    } else if (tx.mainType === 'tractor') {
      return `Tractor service: ${tx.tractorService || 'service'} (Rate: Rs. ${tx.rate})`;
    } else if (tx.mainType === 'cash') {
      if (tx.type === 'cash_taken') {
        return `Cash payment`;
      } else if (tx.type === 'cash_given') {
        return `Cash received`;
      }
    }
    
    // Fallback to original details
    return tx.details || 'Transaction';
  };

  // Function to get customer-friendly amount display
  const getCustomerFriendlyAmount = (tx) => {
    const totalAmount = tx.totalAmount || tx.amount || 0;
    
    if (tx.mainType === 'crops') {
      if (tx.type === 'crop_buy') {
        // Customer sold crops - they should receive money
        return totalAmount;
      } else if (tx.type === 'crop_sell') {
        // Customer bought crops - they should pay money
        return totalAmount;
      }
    }
    
    return totalAmount;
  };

  // Function to get customer-friendly due amount
  const getCustomerFriendlyDue = (tx) => {
    const dueAmount = tx.dueAmount || 0;
    
    // For customer perspective:
    // Positive dueAmount = customer owes money
    // Negative dueAmount = customer is owed money
    return dueAmount;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600 mt-4">Loading Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="flex flex-col">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-blue-600 text-white p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6" />
              <div>
                <p className="font-medium">Install Sagar Bhandar App</p>
                <p className="text-sm text-blue-100">Get easy access to your transaction history</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="text-blue-100 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <span className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </span>
        <h1 className="text-xl font-bold text-gray-800 truncate">{customer.name}</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Install App Card - Only show if banner is not visible */}
        {!showInstallBanner && installPrompt && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-8 h-8" />
                <div>
                  <p className="font-bold">Install App</p>
                  <p className="text-sm text-blue-100">Get quick access to your transactions</p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className={`text-sm font-medium ${getDueColor(totalDue)}`}>
            {getDueText(totalDue)}
          </p>
          <p className={`text-4xl font-bold mt-1 ${getDueColor(totalDue)}`}>
            {formatCurrency(Math.abs(totalDue))}
          </p>
          {totalDue !== 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {totalDue > 0 
                ? 'You need to pay this amount' 
                : 'We need to pay you this amount'}
            </p>
          )}
        </div>
        
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
            {customer.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base text-gray-900">{customer.phone}</p>
              </div>
            )}
            {customer.address && (
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base text-gray-900">{customer.address}</p>
              </div>
            )}
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Transaction History</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {transactions.length > 0 ? transactions.map((tx) => {
              const description = getCustomerFriendlyDescription(tx);
              const totalAmount = getCustomerFriendlyAmount(tx);
              const dueAmount = getCustomerFriendlyDue(tx);
              const date = tx.date || 'Unknown date';

              return (
                <li key={tx.id} className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{description}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(date, tx.createdAt)}
                    </p>
                    {tx.rate && tx.weight && (
                      <p className="text-xs text-gray-400 mt-1">
                        Rate: Rs. {tx.rate}/kg × {tx.weight}kg
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className={`font-medium ${dueAmount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(totalAmount)}
                    </p>
                    <p className={`text-sm ${getDueColor(dueAmount)}`}>
                      {dueAmount > 0 
                        ? `You owe: ${formatCurrency(dueAmount)}`
                        : dueAmount < 0 
                        ? `We owe you: ${formatCurrency(Math.abs(dueAmount))}`
                        : 'Settled'}
                    </p>
                  </div>
                </li>
              );
            }) : (
              <p className="p-4 text-sm text-gray-500">No transactions yet.</p>
            )}
          </ul>
        </div>

        {/* Bottom Install Prompt for Mobile */}
        {!showInstallBanner && installPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Install App for Quick Access</p>
                <p className="text-sm text-blue-600">Add to home screen for faster loading</p>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}