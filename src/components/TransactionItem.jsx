import { useLanguage } from '../hooks/useLanguage.jsx';
import { Pencil } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';

const formatNepaliDateTime = (firebaseTimestamp, fallbackDate = "No date") => {
  if (!firebaseTimestamp) {
    return fallbackDate;
  }

  try {
    let jsDate;
    if (typeof firebaseTimestamp.toDate === 'function') {
      jsDate = firebaseTimestamp.toDate();
    } else if (typeof firebaseTimestamp === 'string') {
      const parts = firebaseTimestamp.split('-');
      if (parts.length === 3) {
         const year = parseInt(parts[0]);
         const month = parseInt(parts[1]) - 1;
         const day = parseInt(parts[2]);
         const npDate = new NepaliDate(year, month, day);
         return npDate.format('MMMM D, YYYY');
      }
      return firebaseTimestamp;
    } else {
      return fallbackDate;
    }

    const nepaliDate = new NepaliDate(jsDate);
    return nepaliDate.format('MMMM D, YYYY'); 
  } catch (error) {
    console.error("Error formatting Nepali date:", error);
    return fallbackDate;
  }
};

const getTransactionDetails = (tx) => {
  if (tx.mainType === 'tractor') {
    if (['Rotavator', 'Threser'].includes(tx.type)) {
      const hours = tx.hours || 0;
      const minutes = tx.minutes || 0;
      const rate = tx.rate || 0;
      
      let timeString = '';
      if (hours > 0 && minutes > 0) {
        timeString = `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        timeString = `${hours}h`;
      } else if (minutes > 0) {
        timeString = `${minutes}m`;
      } else {
        timeString = '0h';
      }
      
      return `${timeString} @ Rs.${rate}/hr`;
    } else {
      const trolleys = tx.numTrolleys || 0;
      const rate = tx.rate || 0;
      const trolleyText = trolleys === 1 ? 'trolley' : 'trolleys';
      
      return `${trolleys} ${trolleyText} @ Rs.${rate}/trolley`;
    }
  } else if (tx.mainType === 'crops') {
    const weight = tx.weight || 0;
    const rate = tx.rate || 0;
    const displayWeight = typeof weight === 'number' ? weight.toFixed(1) : weight;
    return `${displayWeight}kg @ Rs.${rate}/kg`;
  }
  return null;
};

// --- THIS IS THE FIX ---
// We removed the `Rs.` from inside the function call in the JSX below.
// Instead, we format the number first, then add "Rs." string.
const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function TransactionItem({ tx, onEdit }) {
  const { t } = useLanguage();
  const isDebt = tx.dueAmount > 0;
  
  const displayDate = formatNepaliDateTime(tx.createdAt || tx.date, tx.date);
  const transactionDetails = getTransactionDetails(tx);

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <p className="text-base font-medium text-gray-900">{tx.details}</p>
          
          {transactionDetails && (
            <p className="text-sm text-gray-600 mt-1">
              {transactionDetails}
            </p>
          )}
          
          <div className="flex justify-between items-center text-sm mt-1">
            <p className="text-gray-500">{displayDate}</p>
          </div>
        </div>
        <div className="flex items-center">
          <p className={`text-base font-semibold pl-2 ${
            tx.dueAmount > 0 ? 'text-green-600' : tx.dueAmount < 0 ? 'text-red-600' : 'text-gray-800'
          }`}>
            {/* Correctly formatting the currency with commas */}
            Rs. {formatNumber(tx.totalAmount)}
          </p>
          {onEdit && (
            <button onClick={() => onEdit(tx)} className="ml-2 p-1 text-gray-400 hover:text-blue-600">
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}