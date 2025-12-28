import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useCollection } from './hooks/useCollection.js';
import { useLanguage } from './hooks/useLanguage.jsx';

// Import Icons
import { Plus } from 'lucide-react';

// Import Components
import CustomerList from './components/CustomerList.jsx';
import CustomerDetail from './components/CustomerDetail.jsx';
import AddCustomerForm from './components/AddCustomerForm.jsx';
import AddTransactionForm from './components/AddTransactionForm.jsx';
import AddExpenseForm from './components/AddExpenseForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import BottomNav from './components/BottomNav.jsx';
import Settings from './components/Settings.jsx';
import PinLock from './components/PinLock.jsx';
import ImportBackup from './components/ImportBackup.jsx';
import FullHistoryPage from './components/FullHistoryPage.jsx';
import RecentlyDeleted from './components/RecentlyDeleted.jsx';
import CropAnalysis from './components/CropAnalysis.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import RecentActivityPage from './components/RecentActivityPage.jsx';

export default function App() {
  
  const { t } = useLanguage();
  
  // --- HOOKS (All at top) ---
  
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Session timeout: 24 hours (reduced from 30 days for security)
  const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;
  
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const lastActive = sessionStorage.getItem('last_active_time');
    if (!lastActive) return false;
    const inactivity = Date.now() - parseInt(lastActive);
    return inactivity < SESSION_TIMEOUT_MS;
  });
  
  const { data: allCustomers } = useCollection('customers', user); 
  const { data: allTransactions } = useCollection('transactions', user);
  const { data: allExpenses } = useCollection('expenses', user);
  
  const customers = useMemo(() => 
    allCustomers.filter(c => c.isDeleted !== true), 
  [allCustomers]);
  
  const transactions = useMemo(() => 
    allTransactions.filter(tx => tx.isDeleted !== true), 
  [allTransactions]);
  
  const expenses = useMemo(() => 
    allExpenses.filter(exp => exp.isDeleted !== true),
  [allExpenses]);
  
  const deletedCustomers = useMemo(() => 
    allCustomers.filter(c => c.isDeleted === true), 
  [allCustomers]);

  const [activePage, setActivePage] = useState('customers');
  const [modal, setModal] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showingFullHistory, setShowingFullHistory] = useState(false);
  const [showingCropAnalysis, setShowingCropAnalysis] = useState(false);
  const [showingRecentActivity, setShowingRecentActivity] = useState(false);
  
  // --- THIS IS THE FIX ---
  const [loading, setLoading] = useState(false);
  // -----------------------

  const internalGoBack = useRef(false);
  const depth = (modal ? 1 : 0) + (showingFullHistory ? 1 : 0) + (selectedCustomerId ? 1 : 0) + (showingCropAnalysis ? 1 : 0) + (showingRecentActivity ? 1 : 0);
  const prevDepth = useRef(depth);
  
  
  // --- EFFECTS ---
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    const updateLastActive = () => { sessionStorage.setItem('last_active_time', Date.now().toString()); };
    updateLastActive();
    window.addEventListener('mousemove', updateLastActive);
    window.addEventListener('keydown', updateLastActive);
    window.addEventListener('touchstart', updateLastActive);
    window.addEventListener('scroll', updateLastActive);
    // Check session timeout every 5 minutes (instead of every hour)
    const interval = setInterval(() => {
      const lastActive = sessionStorage.getItem('last_active_time');
      if (lastActive) {
        const inactivity = Date.now() - parseInt(lastActive);
        if (inactivity >= SESSION_TIMEOUT_MS) {
          setIsUnlocked(false);
          sessionStorage.removeItem('last_active_time');
        }
      }
    }, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateLastActive);
      window.removeEventListener('keydown', updateLastActive);
      window.removeEventListener('touchstart', updateLastActive);
      window.removeEventListener('scroll', updateLastActive);
    };
  }, [isUnlocked]);
  
  useEffect(() => {
    if (deletedCustomers.length > 0) {
      setTimeout(() => {
        cleanupOldDeletes(deletedCustomers);
      }, 10000);
    }
  }, [deletedCustomers]);

  // --- HANDLERS ---
  
  const handleUnlock = () => {
    sessionStorage.setItem('last_active_time', Date.now().toString());
    setIsUnlocked(true);
  };
  
  // Smart back button handler
  const handleGoBack = useCallback((triggerHistoryBack = true) => {
    if (triggerHistoryBack) {
      internalGoBack.current = true;
      window.history.back();
    }
    
    if (modal) { setModal(null); setItemToEdit(null); return; }
    if (showingFullHistory) { setShowingFullHistory(false); return; }
    if (showingCropAnalysis) { setShowingCropAnalysis(false); return; }
    if (showingRecentActivity) { setShowingRecentActivity(false); return; }
    if (selectedCustomerId) { setSelectedCustomerId(null); return; }
  }, [modal, showingFullHistory, selectedCustomerId, showingCropAnalysis, showingRecentActivity]);

  // Phone back button listener
  useEffect(() => {
    const onBrowserBack = () => {
      if (internalGoBack.current) { internalGoBack.current = false; return; }
      handleGoBack(false);
    };
    window.addEventListener('popstate', onBrowserBack);
    return () => window.removeEventListener('popstate', onBrowserBack);
  }, [handleGoBack]);

  // History state pusher
  useEffect(() => {
    if (depth > prevDepth.current) {
      window.history.pushState(null, '', window.location.pathname);
    }
    prevDepth.current = depth;
  }, [depth]);


  if (!isUnlocked) {
    return <PinLock mode={localStorage.getItem('app_pin') ? 'check' : 'create'} onUnlock={handleUnlock} />;
  }

  // --- Data Helpers ---
  const getCustomerTransactions = (customerId) => {
    return allTransactions 
      .filter((tx) => tx.customerId === customerId && tx.isDeleted !== true)
      .sort((a, b) => {
        const dateComparison = (b.date || '0').localeCompare(a.date || '0');
        if (dateComparison !== 0) return dateComparison;
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
  };
  const getCustomerDues = (customerId) => {
    return getCustomerTransactions(customerId).reduce(
      (acc, tx) => acc + (tx.dueAmount || 0),
      0
    );
  };
  
  // --- Navigation ---
  const handlePageChange = (page) => {
    setActivePage(page);
    setSelectedCustomerId(null);
  };
  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
  };
  const handleOpenEditCustomer = (customer) => {
    setItemToEdit(customer);
    setModal('addCustomer');
  };
  const handleOpenEditTransaction = (tx) => {
    setItemToEdit(tx);
    setModal('addTransaction');
  };
  const handleOpenEditExpense = (exp) => {
    setItemToEdit(exp);
    setModal('addExpense');
  };
  
  // --- Save/Update Functions ---
 const handleSaveCustomer = async (customerData) => {
  if (!customerData.id) {
    const trimmedName = customerData.name.trim();
    const existingCustomer = allCustomers.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.isDeleted !== true
    );
    if (existingCustomer) {
      const confirmMsg = `A customer named "${existingCustomer.name}" already exists.\n\nAre you sure you want to create another one?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
  }
  
  handleGoBack();
  const { id, ...data } = customerData;
  try {
    if (id) {
      // For updates, preserve the existing accessKey if it exists
      const existingCustomer = allCustomers.find(c => c.id === id);
      const updatedData = {
        ...data,
        accessKey: existingCustomer?.accessKey || data.accessKey
      };
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, updatedData);
    } else {
      // For new customers, include the generated accessKey
      await addDoc(collection(db, 'customers'), { 
        ...data, 
        createdAt: new Date() 
      });
    }
  } catch (e) {
    console.error("Error saving customer: ", e);
  }
};
  const handleSaveTransaction = async (txData) => {
    handleGoBack();
    const { id, ...data } = txData;
    try {
      if (id) {
        const docRef = doc(db, 'transactions', id);
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, 'transactions'), { 
          ...data, 
          createdAt: new Date() 
        });
      }
    } catch (e) {
      console.error("Error saving transaction: ", e);
    }
  };
  
  const handleSaveExpense = async (expData) => {
    handleGoBack();
    const { id, ...data } = expData;
    try {
      if (id) {
        const docRef = doc(db, 'expenses', id);
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, 'expenses'), { 
          ...data, 
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date()
        });
      }
    } catch (e) {
      console.error("Error saving expense: ", e);
      alert("Error saving expense.");
    }
  };

  // --- Delete & Restore ---
  const _permanentlyDeleteCustomer = async (customerId) => {
    try {
      const batch = writeBatch(db);
      const q = query(collection(db, 'transactions'), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => { batch.delete(doc.ref); });
      const customerRef = doc(db, 'customers', customerId);
      batch.delete(customerRef);
      await batch.commit();
    } catch (e) {
      console.error("Error permanently deleting customer: ", e);
    }
  };
  const cleanupOldDeletes = (deletedList) => {
    const now = new Date().getTime();
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
    deletedList.forEach(customer => {
      if (customer.deletedAt?.toDate) {
        const deletedTime = customer.deletedAt.toDate().getTime();
        if (deletedTime < sixtyDaysAgo) {
          _permanentlyDeleteCustomer(customer.id);
        }
      }
    });
  };
  const handleDeleteCustomer = async (customerId) => {
    const confirmMessage = t('delete_confirm_message');
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const deleteTimestamp = new Date();
      const customerRef = doc(db, 'customers', customerId);
      batch.update(customerRef, { isDeleted: true, deletedAt: deleteTimestamp });
      const q = query(collection(db, 'transactions'), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { isDeleted: true, deletedAt: deleteTimestamp });
      });
      await batch.commit();
      setLoading(false);
      handleGoBack();
    } catch (e) {
      console.error("Error moving customer to trash: ", e);
      alert("Error moving customer to trash.");
      setLoading(false);
    }
  };
  const handleRestoreCustomer = async (customerId) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const customerRef = doc(db, 'customers', customerId);
      batch.update(customerRef, { isDeleted: false, deletedAt: null });
      const q = query(collection(db, 'transactions'), where('customerId', '==', customerId), where('isDeleted', '==', true));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { isDeleted: false, deletedAt: null });
      });
      await batch.commit();
      setLoading(false);
    } catch (e) {
      console.error("Error restoring customer: ", e);
      alert("Error restoring customer.");
      setLoading(false);
    }
  };
  const handleDeleteExpense = async (expId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteDoc(doc(db, 'expenses', expId));
    } catch (e) {
      console.error("Error deleting expense: ", e);
      alert("Error deleting expense.");
    }
  };
  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This is permanent.")) return;
    try {
      await deleteDoc(doc(db, 'transactions', txId));
      handleGoBack();
    } catch (e) {
      console.error("Error deleting transaction: ", e);
      alert("Error deleting transaction.");
    }
  };

  // --- CONDITIONAL RENDERING ---
  
  if (authLoading) {
    return <div className="h-full w-full max-w-md mx-auto flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return <LoginScreen />;
  }
  if (!isUnlocked) {
    return <PinLock mode={localStorage.getItem('app_pin') ? 'check' : 'create'} onUnlock={handleUnlock} />;
  }

  // --- RENDER LOGIC (THE "ROUTER") ---
  
  if (modal === 'importBackup') {
    return <ImportBackup onCancel={handleGoBack} />;
  }
  if (modal === 'setPin') {
    return <PinLock mode="create" onUnlock={handleGoBack} onCancel={handleGoBack} title={t('set_change_pin')} />;
  }
  if (modal === 'recentlyDeleted') {
    return <RecentlyDeleted 
             customers={deletedCustomers} 
             onBack={handleGoBack} 
             onRestore={handleRestoreCustomer} 
           />;
  }
  if (modal === 'addCustomer') {
    return <AddCustomerForm 
             onSave={handleSaveCustomer} 
             onCancel={handleGoBack} 
             initialData={itemToEdit}
           />;
  }
  if (modal === 'addTransaction') {
    const custId = itemToEdit?.customerId || selectedCustomerId;
    const customer = allCustomers.find(c => c.id === custId);
    return <AddTransactionForm 
             customer={customer} 
             onSave={handleSaveTransaction} 
             onCancel={handleGoBack} 
             initialData={itemToEdit} 
             onDelete={handleDeleteTransaction}
           />;
  }
  if (modal === 'addExpense') {
    return <AddExpenseForm onSave={handleSaveExpense} onCancel={handleGoBack} initialData={itemToEdit} />;
  }
  
  if (showingCropAnalysis) {
    return <CropAnalysis transactions={transactions} onBack={handleGoBack} />;
  }

  if (showingFullHistory && selectedCustomerId) {
    const customer = customers.find(c => c.id === selectedCustomerId);
    return (
      <FullHistoryPage
        customer={customer}
        transactions={getCustomerTransactions(selectedCustomerId)}
        onBack={handleGoBack}
        onEditTransaction={handleOpenEditTransaction}
      />
    );
  }
  
  if (showingRecentActivity) {
    return <RecentActivityPage
            customers={customers}
            transactions={transactions}
            expenses={expenses}
            onBack={handleGoBack}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={handleDeleteExpense}
           />;
  }

  if (selectedCustomerId) {
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!selectedCustomer) { 
      handleGoBack(false); 
      return null; 
    }
    return (
      <CustomerDetail
        customer={selectedCustomer}
        transactions={getCustomerTransactions(selectedCustomerId)}
        totalDue={getCustomerDues(selectedCustomerId)}
        onBack={handleGoBack}
        onAddTransaction={() => setModal('addTransaction')}
        onDelete={handleDeleteCustomer}
        onEditCustomer={handleOpenEditCustomer}
        onEditTransaction={handleOpenEditTransaction}
        onShowHistory={() => setShowingFullHistory(true)}
      />
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'customers':
        return <CustomerList 
                 customers={customers}
                 onSelectCustomer={handleSelectCustomer} 
                 getCustomerDues={getCustomerDues} 
               />;
      case 'dashboard':
        return <Dashboard 
                 customers={customers} 
                 transactions={transactions} 
                 expenses={expenses} 
                 onAddExpense={() => setModal('addExpense')} 
                 getCustomerDues={getCustomerDues}
                 onEditExpense={handleOpenEditExpense}
                 onDeleteExpense={handleDeleteExpense}
                 onShowCropAnalysis={() => setShowingCropAnalysis(true)}
                 onShowRecentActivity={() => setShowingRecentActivity(true)}
               />;
      case 'settings':
        return <Settings 
                 customers={allCustomers} 
                 transactions={allTransactions} 
                 expenses={allExpenses} 
                 onImport={() => setModal('importBackup')} 
                 onSetPin={() => setModal('setPin')}
                 onShowRecentlyDeleted={() => setModal('recentlyDeleted')}
               />;
      default:
        return <CustomerList customers={customers} onSelectCustomer={handleSelectCustomer} getCustomerDues={getCustomerDues} />;
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <p className="text-white text-lg font-medium">Processing...</p>
        </div>
      )}
      
      <main className="flex-1 overflow-hidden">
        {renderActivePage()}
      </main>
      
      <BottomNav activePage={activePage} onPageChange={handlePageChange} />
      
      {activePage === 'customers' && !selectedCustomerId && !modal && (
        <button onClick={() => setModal('addCustomer')} className="absolute bottom-20 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 z-30">
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}