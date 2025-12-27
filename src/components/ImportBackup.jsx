import { useState } from 'react';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export default function ImportBackup({ onCancel }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a backup file first.');
      return;
    }

    if (!window.confirm('This will MERGE data from the file with your database. It will try to find matching customers. Are you sure?')) {
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target.result;
        const backupData = JSON.parse(json);

        const backupCustomers = backupData.customers || [];
        const backupTransactions = backupData.transactions || [];
        const backupExpenses = backupData.expenses || [];

        if (backupCustomers.length === 0 && backupTransactions.length === 0 && backupExpenses.length === 0) {
          alert('The selected file does not contain any valid data.');
          setLoading(false);
          return;
        }
        
        // --- THIS IS THE NEW MERGE LOGIC ---
        
        // 1. Fetch all existing customers from the database
        const existingCustomersSnap = await getDocs(collection(db, 'customers'));
        const existingCustomers = [];
        existingCustomersSnap.forEach(doc => {
          existingCustomers.push({ id: doc.id, ...doc.data() });
        });

        // 2. Create "lookup maps" for finding duplicates
        const existingPhoneMap = new Map();
        const existingNameMap = new Map();
        existingCustomers.forEach(cust => {
          if (cust.phone) {
            existingPhoneMap.set(cust.phone, cust.id);
          }
          if (cust.name) {
            existingNameMap.set(cust.name.toLowerCase(), cust.id);
          }
        });

        const batch = writeBatch(db);
        const idMap = new Map(); // Maps old backup IDs to new/existing DB IDs
        let newCustomerCount = 0;
        let mergedCustomerCount = 0;

        // 3. Process Customers
        for (const backupCust of backupCustomers) {
          let existingId = null;

          // Try to find a match by phone (strongest match)
          if (backupCust.phone && existingPhoneMap.has(backupCust.phone)) {
            existingId = existingPhoneMap.get(backupCust.phone);
          } 
          // Else, try to find by name (weaker match)
          else if (backupCust.name && existingNameMap.has(backupCust.name.toLowerCase())) {
            existingId = existingNameMap.get(backupCust.name.toLowerCase());
          }

          if (existingId) {
            // MERGE: This customer already exists.
            // We'll map their old ID to their existing ID.
            idMap.set(backupCust.id, existingId);
            mergedCustomerCount++;
            
            // Optional: Update existing customer's data with backup data
            const existingDocRef = doc(db, 'customers', existingId);
            // We use 'merge: true' to only update fields, not overwrite
            batch.set(existingDocRef, backupCust, { merge: true });

          } else {
            // NEW: This is a new customer.
            const newDocRef = doc(collection(db, 'customers'));
            idMap.set(backupCust.id, newDocRef.id);
            batch.set(newDocRef, backupCust);
            newCustomerCount++;
          }
        }

        // 4. Process Transactions
        backupTransactions.forEach((tx) => {
          const newCustomerId = idMap.get(tx.customerId);
          
          if (newCustomerId) {
            // This transaction belongs to a customer we've mapped
            // We create a new transaction doc and assign it to the new/merged customer
            const newTxRef = doc(collection(db, 'transactions'));
            // Remove the old 'id' and set the new customerId
            const { id, ...txData } = tx; 
            batch.set(newTxRef, { ...txData, customerId: newCustomerId });
          }
          // If newCustomerId is not found, we skip this transaction
          // as it belongs to a customer who wasn't in the backup.
        });

        // 5. Process Expenses (These are simple additions)
        backupExpenses.forEach((exp) => {
          const newExpRef = doc(collection(db, 'expenses'));
          const { id, ...expData } = exp; // Remove old ID
          batch.set(newExpRef, expData);
        });

        // 6. Commit all changes
        await batch.commit();

        alert(`Import Successful!\n\n- ${newCustomerCount} new customers added.\n- ${mergedCustomerCount} customers merged.\n- ${backupTransactions.length} transactions imported.\n- ${backupExpenses.length} expenses imported.`);
        setLoading(false);
        onCancel(); // Close the modal

      } catch (error) {
        console.error("Error importing data: ", error);
        alert('Error importing data. The file may be corrupt. ' + error.message);
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onCancel} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          Import from Backup
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <UploadCloud className="w-16 h-16 text-blue-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-700">Select Backup File</h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose the `.json` file you previously downloaded. This will **merge** with existing data.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="mt-6 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />

          {file && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              File selected: {file.name}
            </p>
          )}
        </div>
      </div>

      <footer className="p-4 bg-white border-t">
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Merging, please wait...' : 'Start Merge & Import'}
        </button>
      </footer>
    </div>
  );
}