import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function AddExpenseForm({ onSave, onCancel, initialData }) {
  const { t } = useLanguage();
  
  // --- MODIFIED: Pre-fill state ---
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [type, setType] = useState(initialData?.type || 'Tractor Diesel');
  const [details, setDetails] = useState(initialData?.details || '');

  const handleSubmit = () => {
    if (!amount || !type) {
      alert('Please fill in the Amount and Type.');
      return;
    }
    // --- MODIFIED: Pass ID back ---
    onSave({
      id: initialData?.id,
      amount: parseFloat(amount),
      type,
      details,
      date: initialData?.date || new Date().toISOString().split('T')[0] // Keep old date if editing
    });
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onCancel} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Edit Expense' : `${t('add')} ${t('expenses')}`}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expense Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm">
            <option>Tractor Diesel</option>
            <option>Tractor Repair</option>
            <option>Storage Rent</option>
            <option>Labor</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (Rs.)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="e.g. 5000" inputMode="decimal"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Details (Optional)</label>
          <input type="text" value={details} onChange={(e) => setDetails(e.targe.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="e.g. Diesel for 3 days" />
        </div>
      </div>

      <footer className="p-4 bg-white border-t">
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700">
          {initialData ? 'Save Changes' : 'Save Expense'}
        </button>
      </footer>
    </div>
  );
}