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

  // Maximum file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // Allowed enum values for validation
  const ALLOWED_MAIN_TYPES = ['crops', 'tractor', 'cash'];
  const ALLOWED_CROP_TYPES = ['Wheat(गहुँ)', 'Rice(धान)', 'Maize(मकै)', 'Rice(चामल)', 'Gas(ग्यास)'];
  const ALLOWED_TX_TYPES = ['crop_buy', 'crop_sell', 'cash_given', 'cash_taken', 'Rotavator', 'Threser', 'Dhunga Trolley', 'Gitti trolley', 'Daura'];
  const ALLOWED_EXPENSE_TYPES = ['Diesel', 'Vehicle Repair', 'Staff Payment', 'Shop Rent', 'Electricity', 'Other'];

  const handleImport = async () => {
    if (!file) {
      alert('Please select a backup file first.');
      return;
    }
    
    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum allowed size is 10MB.');
      return;
    }

    if (!window.confirm('This will MERGE data from the file with your database. It will try to find matching customers. Are you sure?')) {
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      let backupData;
      
      // Safely parse JSON with explicit error handling
      try {
        const json = e.target.result;
        backupData = JSON.parse(json);
      } catch (parseError) {
        alert('Invalid JSON file. The file appears to be corrupted or is not a valid backup file.');
        setLoading(false);
        return;
      }
      
      try {
        // Validate backup data structure
        if (typeof backupData !== 'object' || backupData === null || Array.isArray(backupData)) {
          alert('Invalid backup file format. Expected a JSON object with customers, transactions, and expenses.');
          setLoading(false);
          return;
        }

        const backupCustomers = Array.isArray(backupData.customers) ? backupData.customers : [];
        const backupTransactions = Array.isArray(backupData.transactions) ? backupData.transactions : [];
        const backupExpenses = Array.isArray(backupData.expenses) ? backupData.expenses : [];

        if (backupCustomers.length === 0 && backupTransactions.length === 0 && backupExpenses.length === 0) {
          alert('The selected file does not contain any valid data.');
          setLoading(false);
          return;
        }
        
        // Validate and sanitize customer data with strict field whitelisting
        const validateCustomer = (cust) => {
          if (!cust || typeof cust !== 'object' || Array.isArray(cust)) return null;
          const name = typeof cust.name === 'string' ? cust.name.trim().slice(0, 100) : '';
          if (!name) return null;
          
          // Whitelist only allowed fields
          return {
            id: typeof cust.id === 'string' ? cust.id.slice(0, 50) : undefined,
            name,
            phone: typeof cust.phone === 'string' ? cust.phone.trim().slice(0, 20).replace(/[^0-9+\-\s()]/g, '') : '',
            address: typeof cust.address === 'string' ? cust.address.trim().slice(0, 200) : '',
            accessKey: typeof cust.accessKey === 'string' ? cust.accessKey.slice(0, 50) : undefined,
            isDeleted: cust.isDeleted === true,
            createdAt: cust.createdAt || null,
            deletedAt: cust.deletedAt || null,
          };
        };
        
        // Validate and sanitize transaction data with enum validation
        const validateTransaction = (tx) => {
          if (!tx || typeof tx !== 'object' || Array.isArray(tx)) return null;
          if (!tx.customerId || typeof tx.customerId !== 'string') return null;
          
          // Validate enums
          const mainType = ALLOWED_MAIN_TYPES.includes(tx.mainType) ? tx.mainType : null;
          const type = ALLOWED_TX_TYPES.includes(tx.type) ? tx.type : null;
          const cropType = tx.cropType && ALLOWED_CROP_TYPES.includes(tx.cropType) ? tx.cropType : null;
          
          if (!mainType) return null;
          
          // Whitelist only allowed fields
          return {
            id: typeof tx.id === 'string' ? tx.id.slice(0, 50) : undefined,
            customerId: tx.customerId.slice(0, 50),
            mainType,
            type,
            cropType,
            date: typeof tx.date === 'string' ? tx.date.slice(0, 20) : null,
            totalAmount: typeof tx.totalAmount === 'number' ? Math.min(Math.max(tx.totalAmount, -99999999), 99999999) : 0,
            amountPaid: typeof tx.amountPaid === 'number' ? Math.min(Math.max(tx.amountPaid, 0), 99999999) : 0,
            dueAmount: typeof tx.dueAmount === 'number' ? Math.min(Math.max(tx.dueAmount, -99999999), 99999999) : 0,
            details: typeof tx.details === 'string' ? tx.details.slice(0, 200) : '',
            weight: typeof tx.weight === 'number' ? Math.min(Math.max(tx.weight, 0), 9999999) : null,
            weightInput: typeof tx.weightInput === 'string' ? tx.weightInput.slice(0, 100) : null,
            rate: typeof tx.rate === 'string' || typeof tx.rate === 'number' ? String(tx.rate).slice(0, 20) : null,
            hours: typeof tx.hours === 'string' || typeof tx.hours === 'number' ? String(tx.hours).slice(0, 10) : null,
            minutes: typeof tx.minutes === 'string' || typeof tx.minutes === 'number' ? String(tx.minutes).slice(0, 10) : null,
            numTrolleys: typeof tx.numTrolleys === 'string' || typeof tx.numTrolleys === 'number' ? String(tx.numTrolleys).slice(0, 10) : null,
            billPhotoBase64: typeof tx.billPhotoBase64 === 'string' ? tx.billPhotoBase64.slice(0, 500000) : null,
            isDeleted: tx.isDeleted === true,
            createdAt: tx.createdAt || null,
            deletedAt: tx.deletedAt || null,
          };
        };
        
        // Validate and sanitize expense data with enum validation
        const validateExpense = (exp) => {
          if (!exp || typeof exp !== 'object' || Array.isArray(exp)) return null;
          const amount = typeof exp.amount === 'number' ? Math.min(Math.max(exp.amount, 0), 99999999) : 0;
          if (amount <= 0) return null;
          
          // Validate expense type enum
          const type = ALLOWED_EXPENSE_TYPES.includes(exp.type) ? exp.type : 'Other';
          
          // Whitelist only allowed fields
          return {
            id: typeof exp.id === 'string' ? exp.id.slice(0, 50) : undefined,
            amount,
            type,
            details: typeof exp.details === 'string' ? exp.details.slice(0, 200) : '',
            date: typeof exp.date === 'string' ? exp.date.slice(0, 20) : null,
            isDeleted: exp.isDeleted === true,
            createdAt: exp.createdAt || null,
          };
        };
        
        const validatedCustomers = backupCustomers.map(validateCustomer).filter(Boolean);
        const validatedTransactions = backupTransactions.map(validateTransaction).filter(Boolean);
        const validatedExpenses = backupExpenses.map(validateExpense).filter(Boolean);
        
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
        for (const backupCust of validatedCustomers) {
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
            idMap.set(backupCust.id, existingId);
            mergedCustomerCount++;
            
            const existingDocRef = doc(db, 'customers', existingId);
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
        validatedTransactions.forEach((tx) => {
          const newCustomerId = idMap.get(tx.customerId);
          
          if (newCustomerId) {
            const newTxRef = doc(collection(db, 'transactions'));
            const { id, ...txData } = tx; 
            batch.set(newTxRef, { ...txData, customerId: newCustomerId });
          }
        });

        // 5. Process Expenses
        validatedExpenses.forEach((exp) => {
          const newExpRef = doc(collection(db, 'expenses'));
          const { id, ...expData } = exp;
          batch.set(newExpRef, expData);
        });

        // 6. Commit all changes
        await batch.commit();

        alert(`Import Successful!\n\n- ${newCustomerCount} new customers added.\n- ${mergedCustomerCount} customers merged.\n- ${validatedTransactions.length} transactions imported.\n- ${validatedExpenses.length} expenses imported.`);
        setLoading(false);
        onCancel();

      } catch (error) {
        if (import.meta.env.DEV) console.error("Error importing data: ", error);
        alert('Error importing data. The file may be corrupt or invalid.');
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