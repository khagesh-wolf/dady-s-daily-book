import { useState, useMemo } from 'react';
import { Plus, Archive, Pencil, Trash2, ChevronRight, TrendingUp, TrendingDown, Wrench } from 'lucide-react'; // <-- Import Wrench
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function TimeFilter({ period, setPeriod }) {
  const options = [
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
    { label: 'Lifetime', value: 'lifetime' },
  ];

  return (
    <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setPeriod(opt.value)}
          className={`flex-1 py-1 px-2 text-sm font-medium rounded-md ${
            period === opt.value ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Dashboard({ 
  customers, 
  transactions, 
  expenses, 
  onAddExpense, 
  getCustomerDues,
  onEditExpense,
  onDeleteExpense,
  onShowCropAnalysis,
  onShowRecentActivity
}) {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState('lifetime');

  const { filteredTransactions, filteredExpenses } = useMemo(() => {
    // ... (logic is unchanged)
    const now = new Date();
    const cutoffDate = new Date();
    if (timePeriod === '3m') cutoffDate.setMonth(now.getMonth() - 3);
    else if (timePeriod === '6m') cutoffDate.setMonth(now.getMonth() - 6);
    else if (timePeriod === '1y') cutoffDate.setFullYear(now.getFullYear() - 1);
    else cutoffDate.setFullYear(now.getFullYear() - 100);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    const fTx = transactions.filter(tx => (tx.date || '0') >= cutoffString);
    const fExp = expenses.filter(exp => (exp.date || '0') >= cutoffString);
    return { filteredTransactions: fTx, filteredExpenses: fExp };
  }, [transactions, expenses, timePeriod]);

  // --- Analytics ---
  let totalToCollect = 0, totalToPay = 0;
  const customerDues = {};
  filteredTransactions.forEach(tx => {
    if (!customerDues[tx.customerId]) customerDues[tx.customerId] = 0;
    customerDues[tx.customerId] += (tx.dueAmount || 0);
  });
  Object.values(customerDues).forEach(due => {
    if (due > 0) totalToCollect += due;
    else if (due < 0) totalToPay += due;
  });
  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  
  // --- UPDATED: Calculate Total Tractor Income ---
  const totalTractorIncome = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.mainType === 'tractor')
      .reduce((acc, tx) => acc + tx.totalAmount, 0);
  }, [filteredTransactions]);

  const cropProfits = {};
  filteredTransactions.filter(tx => tx.mainType === 'crops').forEach(tx => {
    const crop = tx.cropType?.toLowerCase();
    if (!crop) return;
    if (!cropProfits[crop]) cropProfits[crop] = 0;
    if (tx.type === 'crop_sell') cropProfits[crop] += tx.totalAmount;
    else if (tx.type === 'crop_buy') cropProfits[crop] -= tx.totalAmount;
  });
  
  const cropProfitChartData = {
    labels: Object.keys(cropProfits).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{
      label: 'Profit/Loss (Rs.)',
      data: Object.values(cropProfits),
      backgroundColor: (context) => (context.raw || 0) >= 0 ? '#10B981' : '#EF4444',
    }],
  };

  const cropInventory = {};
  transactions.filter(tx => tx.mainType === 'crops').forEach(tx => {
    const weight = parseFloat(tx.weight) || 0;
    const crop = tx.cropType?.toLowerCase();
    if (!crop) return;
    if (!cropInventory[crop]) cropInventory[crop] = 0;
    if (tx.type === 'crop_buy') cropInventory[crop] += weight;
    else if (tx.type === 'crop_sell') cropInventory[crop] -= weight;
  });

  const recentActivity = useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c.name]));
    const formattedTxs = transactions.map(tx => {
      let isOut = false;
      if (tx.mainType === 'crops' && tx.type === 'crop_buy') isOut = true;
      if (tx.mainType === 'cash' && tx.type === 'cash_given') isOut = true;
      return { id: tx.id, type: 'transaction', title: customerMap.get(tx.customerId) || 'Unknown Customer', subtitle: tx.details, amount: tx.totalAmount, isOut: isOut, createdAt: tx.createdAt };
    });
    const formattedExps = expenses.map(exp => ({ id: exp.id, type: 'expense', title: exp.type, subtitle: exp.details, amount: exp.amount, isOut: true, createdAt: exp.createdAt, onEdit: () => onEditExpense(exp), onDelete: () => onDeleteExpense(exp.id) }));
    return [...formattedTxs, ...formattedExps]
      .sort((a, b) => (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0) - (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0))
      .slice(0, 3);
  }, [customers, transactions, expenses, onEditExpense, onDeleteExpense]);
  
  const formatCurrency = (amount) => `Rs. ${new Intl.NumberFormat('en-IN').format(amount.toFixed(0))}`;

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">{t('nav_dashboard')}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <TimeFilter period={timePeriod} setPeriod={setTimePeriod} />

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-medium text-gray-500">{t('total_to_collect')}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalToCollect)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-medium text-gray-500">{t('total_to_pay')}</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(Math.abs(totalToPay))}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-2">
             <h2 className="text-lg font-semibold text-gray-700">Recent Activity</h2>
             <button onClick={onAddExpense} className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
               <Plus className="w-4 h-4" />
               <span>{t('add')} {t('expenses')}</span>
             </button>
           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-100">
             <ul className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? recentActivity.map(item => (
                <ActivityItem 
                  key={item.type + item.id} 
                  item={item} 
                  formatCurrency={formatCurrency} 
                />
              )) : (
                <p className="text-sm text-gray-500">No recent activity.</p>
              )}
             </ul>
             <button 
                onClick={onShowRecentActivity} 
                className="w-full text-center text-blue-600 font-medium py-3 mt-2"
              >
                View All Activity
              </button>
           </div>
        </div>

        {/* --- NEW: Tractor Profit/Loss Card --- */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <Wrench className="w-6 h-6 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-700">Tractor Report (in period)</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalTractorIncome)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">Net Profit / Loss</p>
            <p className={`text-3xl font-bold ${totalTractorIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalTractorIncome - totalExpenses)}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Crop Profit/Loss (in period)</h2>
            <button onClick={onShowCropAnalysis} className="flex items-center text-sm text-blue-600 font-medium">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {Object.keys(cropProfits).length > 0 ? (
             <Bar data={cropProfitChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          ) : (
            <p className="text-sm text-gray-500">No crop profit data for this period.</p>
          )}
        </div>
        
         <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-4">
               <Archive className="w-6 h-6 text-gray-700" />
               <h2 className="text-lg font-semibold text-gray-700">Total Crop Inventory (Stock)</h2>
            </div>
            <div className="flex flex-wrap justify-around text-center gap-4">
              {Object.keys(cropInventory).length > 0 ? (
                Object.entries(cropInventory).map(([crop, weight]) => (
                  <div key={crop}>
                    <p className="text-sm text-gray-500 capitalize">{crop}</p>
                    <p className="text-xl font-bold">{weight.toFixed(1)} kg</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No crop inventory data yet.</p>
              )}
            </div>
          </div>        
      </div>
    </div>
  );
}

// (ActivityItem sub-component is unchanged)
function ActivityItem({ item, formatCurrency }) {
  const isOut = item.isOut;
  const Icon = isOut ? TrendingDown : TrendingUp;
  const color = isOut ? 'text-red-600' : 'text-green-600';
  const amountSign = isOut ? '-' : '+';
  return (
    <li className="flex justify-between items-center py-3">
      <div className="flex items-center space-x-3">
        <span className={`p-2 rounded-full ${isOut ? 'bg-red-100' : 'bg-green-100'}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </span>
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-500">{item.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
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