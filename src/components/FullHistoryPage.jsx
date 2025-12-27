import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import TransactionItem from './TransactionItem.jsx'; // Import the new component

export default function FullHistoryPage({ customer, transactions, onBack, onEditTransaction }) {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.mainType === filterType);
  }, [transactions, filterType]);

  const formatCurrency = (amount) => {
    // Check if 'amount' is a string and format, otherwise, it's already formatted
    if (typeof amount === 'string' && amount.startsWith('Rs.')) {
      return amount;
    }
    return `Rs. ${new Intl.NumberFormat('en-IN').format(amount)}`;
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">{customer.name}'s History</h1>
      </header>

      {/* --- Filter Controls --- */}
      <div className="p-4 bg-white border-b">
        <label className="block text-sm font-medium text-gray-700">{t('transaction_type')}</label>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm"
        >
          <option value="all">Show All</option>
          <option value="tractor">{t('tractor_services')}</option>
          <option value="crops">{t('crops_buy_sell')}</option>
          <option value="cash">{t('cash_transaction')}</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTransactions.length > 0 ? (
          <div className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <TransactionItem 
                key={tx.id} 
                tx={tx} 
                formatCurrency={formatCurrency} 
                onEdit={onEditTransaction} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center p-8">No transactions found for this filter.</p>
        )}
      </div>
    </div>
  );
}