import { useState } from 'react';
import { ArrowLeft, Plus, Phone, MessageCircle, Send, Trash2, Pencil, QrCode } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import TransactionItem from './TransactionItem.jsx';
import CustomerQRModal from './CustomerQRModal.jsx';

export default function CustomerDetail({ 
  customer, 
  transactions, 
  totalDue, 
  onBack, 
  onAddTransaction, 
  onDelete,
  onEditCustomer,
  onEditTransaction,
  onShowHistory
}) {
  const { t } = useLanguage();
  const latestTransactions = transactions.slice(0, 3);
  const [showingQr, setShowingQr] = useState(false);

  const formatCurrency = (amount) => {
    if (typeof amount === 'string' && amount.startsWith('Rs.')) {
      return amount;
    }
    return `Rs. ${new Intl.NumberFormat('en-IN').format(amount)}`;
  };
  
  const getWhatsAppLink = (text = '') => {
    const phone = `977${customer.phone.slice(-10)}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const reminderText = `Namaste, ${customer.name}. This is a reminder that you have a due amount of ${formatCurrency(totalDue)}. Thank you!`;

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
        </div>
        <button onClick={() => onEditCustomer(customer)} className="p-2 text-gray-500 hover:text-blue-600">
          <Pencil className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-500">{t('phone')}</p>
            <p className="text-base text-gray-900">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('address')}</p>
            <p className="text-base text-gray-900">{customer.address}</p>
          </div>
          
          {/* QR CODE SECTION */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">QR Code</p>
              <p className="text-xs text-gray-600">Scan to view transactions</p>
            </div>
            <button 
              onClick={() => setShowingQr(true)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <QrCode className="w-8 h-8 text-gray-700" />
            </button>
          </div>
          {/* END QR CODE SECTION */}
          
          <div className="flex space-x-2 pt-2">
            <a href={`tel:${customer.phone}`} className="flex-1 flex justify-center items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg font-medium">
              <Phone className="w-5 h-5" />
              <span>{t('call')}</span>
            </a>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center space-x-2 p-3 bg-green-500 text-white rounded-lg font-medium">
              <MessageCircle className="w-5 h-5" />
              <span>{t('whatsapp')}</span>
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-sm font-medium text-gray-500">
            {totalDue > 0 ? t('remaining_dues') : totalDue < 0 ? t('we_owe') : t('balance_settled')}
          </p>
          <p className={`text-4xl font-bold mt-1 ${
            totalDue > 0 ? 'text-green-600' : totalDue < 0 ? 'text-red-600' : 'text-gray-800'
          }`}>
            {formatCurrency(Math.abs(totalDue))}
          </p>
          <button onClick={onAddTransaction} className="mt-4 w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>{t('add_new_transaction')}</span>
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {t('latest_transactions')}
          </h2>
          {latestTransactions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
              {latestTransactions.map((tx) => (
                <TransactionItem 
                  key={tx.id} 
                  tx={tx} 
                  formatCurrency={formatCurrency} 
                  onEdit={onEditTransaction}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions found.</p>
          )}

          {transactions.length > 0 && (
            <button onClick={onShowHistory} className="w-full text-center text-blue-600 font-medium py-3 mt-2">
              {t('show_all_transactions')} ({transactions.length})
            </button>
          )}
        </div>

        {totalDue > 0 && (
          <a href={getWhatsAppLink(reminderText)} target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center space-x-2 p-3 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700">
            <Send className="w-5 h-5" />
            <span>{t('send_whatsapp_reminder')}</span>
          </a>
        )}

        <button
          onClick={() => onDelete(customer.id)}
          className="w-full flex justify-center items-center space-x-2 p-3 bg-red-600 text-white rounded-lg font-medium text-center hover:bg-red-700 mt-6"
        >
          <Trash2 className="w-5 h-5" />
          <span>{t('delete_customer')}</span>
        </button>
      </div>

      {/* QR MODAL */}
      {showingQr && (
        <CustomerQRModal
          customer={customer}
          onClose={() => setShowingQr(false)}
        />
      )}
    </div>
  );
}