import { useState, useMemo } from 'react';
import { ArrowLeft, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
// 1. Import NepaliDate
import NepaliDate from 'nepali-date-converter';

// (This is the updated ActivityItem sub-component)
function ActivityItem({ item, formatCurrency }) {
  const isOut = item.isOut;
  const Icon = isOut ? TrendingDown : TrendingUp;
  const color = isOut ? 'text-red-600' : 'text-green-600';
  const amountSign = isOut ? '-' : '+';
  
  return (
    <li className="flex justify-between items-center py-3 px-4">
      <div className="flex items-center space-x-3 overflow-hidden"> {/* Added overflow-hidden */}
        <span className={`p-2 rounded-full ${isOut ? 'bg-red-100' : 'bg-green-100'}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </span>
        <div className="flex-1 min-w-0"> {/* Added flex-1 and min-w-0 */}
          <p className="font-medium text-gray-900 truncate">{item.title}</p>
          {/* 6. Added break-words for long date strings */}
          <p className="text-sm text-gray-500 break-words">{item.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0 ml-2"> {/* Added shrink-0 and ml-2 */}
        <p className={`font-medium ${color}`}>
          {amountSign}{formatCurrency(item.amount)}
        </p>
        {item.type === 'expense' && (
          <>
            <button onClick={item.onEdit} className="p-1 text-gray-400 hover:text-blue-600">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={item.onDelete} className="p-1 text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

const PAGE_SIZE = 15; // Show 15 items at a time

// --- 2. NEW: Helper function to format just the Nepali date ---
const formatNepaliDate = (firebaseTimestamp) => {
  if (!firebaseTimestamp?.toDate) return 'No Date';
  try {
    const jsDate = firebaseTimestamp.toDate();
    const nepaliDate = new NepaliDate(jsDate);
    // Format: "Jestha 14, 2081"
    return nepaliDate.format('MMMM D');
  } catch (error) {
    return 'Date Error';
  }
};

// --- 3. NEW: Helper function to format Nepali date and time ---
const formatNepaliDateTime = (firebaseTimestamp) => {
  if (!firebaseTimestamp?.toDate) return 'No Date';
  try {
    const jsDate = firebaseTimestamp.toDate();
    const nepaliDate = new NepaliDate(jsDate);

    // Format: "Jestha 14, 2081"
    const dateString = nepaliDate.format('MMMM D');
    
    // Format: "2:30 PM"
    const timeString = jsDate.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `${dateString} • ${timeString}`;
  } catch (error) {
    return 'Date Error';
  }
};


export default function RecentActivityPage({ 
  customers, 
  transactions, 
  expenses, 
  onBack,
  onEditExpense,
  onDeleteExpense
}) {
  const { t } = useLanguage();
  
  // --- State for pagination ---
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allRecentActivity = useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c.name]));

    const formattedTxs = transactions.map(tx => {
      let isOut = false;
      if (tx.mainType === 'crops' && tx.type === 'crop_buy') isOut = true;
      if (tx.mainType === 'cash' && tx.type === 'cash_given') isOut = true;
      
      const customerName = customerMap.get(tx.customerId) || 'Unknown Customer';
      // --- 4. MODIFIED: Use new Nepali date formatter ---
      const dateStr = formatNepaliDateTime(tx.createdAt); 

      return {
        id: tx.id,
        type: 'transaction',
        title: customerName,
        subtitle: `${tx.details} • ${dateStr}`,
        amount: tx.totalAmount,
        isOut: isOut,
        createdAt: tx.createdAt,
      };
    });

    const formattedExps = expenses.map(exp => {
      const details = exp.details || 'No details';
      // --- 5. MODIFIED: Use new Nepali date/time formatter ---
      const dateTimeStr = formatNepaliDateTime(exp.createdAt); 

      return {
        id: exp.id,
        type: 'expense',
        title: exp.type,
        subtitle: `${details} • ${dateTimeStr}`,
        amount: exp.amount,
        isOut: true,
        createdAt: exp.createdAt,
        onEdit: () => onEditExpense(exp),
        onDelete: () => onDeleteExpense(exp.id),
      };
    });

    return [...formattedTxs, ...formattedExps]
      .sort((a, b) => (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0) - (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0));
      
  }, [customers, transactions, expenses, onEditExpense, onDeleteExpense]);
  
  // --- Sliced list for display ---
  const visibleActivity = allRecentActivity.slice(0, visibleCount);
  const hasMore = visibleCount < allRecentActivity.length;
  
  const formatCurrency = (amount) => `Rs. ${new Intl.NumberFormat('en-IN').format(amount.toFixed(0))}`;

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">All Recent Activity</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {visibleActivity.length > 0 ? visibleActivity.map(item => (
            <ActivityItem 
              key={item.type + item.id} 
              item={item} 
              formatCurrency={formatCurrency} 
            />
          )) : (
            <p className="p-8 text-center text-gray-500">No recent activity found.</p>
          )}
        </ul>
        
        {/* --- Show More Button --- */}
        {hasMore && (
          <div className="p-4">
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="w-full text-center text-blue-600 font-medium py-3"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}