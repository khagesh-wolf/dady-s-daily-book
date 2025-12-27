import { useState, useMemo } from 'react';
import { ArrowLeft, BarChart2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

function TimeFilter({ period, setPeriod }) {
  const options = [
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
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

const formatCurrency = (amount) => `Rs. ${new Intl.NumberFormat('en-IN').format(amount.toFixed(0))}`;

export default function CropAnalysis({ transactions, onBack }) {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState('lifetime');

  // 1. Filter transactions by date
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timePeriod === '1m') cutoffDate.setMonth(now.getMonth() - 1);
    else if (timePeriod === '3m') cutoffDate.setMonth(now.getMonth() - 3);
    else if (timePeriod === '6m') cutoffDate.setMonth(now.getMonth() - 6);
    else cutoffDate.setFullYear(now.getFullYear() - 100); // Lifetime
    
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    return transactions.filter(tx => 
      tx.mainType === 'crops' && (tx.date || '0') >= cutoffString
    );
  }, [transactions, timePeriod]);

  // 2. Calculate all analytics
  const analytics = useMemo(() => {
    let totalInvested = 0;
    let totalSales = 0;    
    
    // --- UPDATED: Start with an empty object ---
    const byCrop = {}; 

    for (const tx of filteredTransactions) {
      const crop = tx.cropType?.toLowerCase();
      if (!crop) continue; // Skip if no crop type

      // --- THIS IS THE FIX: Initialize if it's a new crop ---
      if (!byCrop[crop]) {
        byCrop[crop] = { bought: 0, sold: 0, profit: 0 };
      }
      
      if (tx.type === 'crop_buy') {
        totalInvested += tx.totalAmount;
        byCrop[crop].bought += tx.totalAmount;
      } else if (tx.type === 'crop_sell') {
        totalSales += tx.totalAmount;
        byCrop[crop].sold += tx.totalAmount;
      }
    }

    const totalProfit = totalSales - totalInvested;

    // Calculate profit for each crop (this part is already dynamic)
    for (const crop in byCrop) {
      byCrop[crop].profit = byCrop[crop].sold - byCrop[crop].bought;
    }

    return { totalInvested, totalSales, totalProfit, byCrop };
  }, [filteredTransactions]);

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">Crop Analysis</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <TimeFilter period={timePeriod} setPeriod={setTimePeriod} />

        {/* --- Main KPIs --- */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Money Invested"
            value={formatCurrency(analytics.totalInvested)}
            icon={<TrendingDown className="text-red-500" />}
          />
          <StatCard
            title="Total Crop Sales"
            value={formatCurrency(analytics.totalSales)}
            icon={<TrendingUp className="text-green-500" />}
          />
        </div>
        <StatCard
          title="Total Profit / Loss"
          value={formatCurrency(analytics.totalProfit)}
          isProfit={true}
          profitValue={analytics.totalProfit}
          icon={<DollarSign className={analytics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'} />}
        />
        
        {/* --- Breakdown by Crop (This part is already dynamic) --- */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Breakdown by Crop</h2>
          <ul className="space-y-4">
            {Object.entries(analytics.byCrop).length > 0 ? (
               Object.entries(analytics.byCrop).map(([crop, data]) => (
                <CropStat key={crop} name={crop} data={data} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No crop data for this period.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Local Sub-components for this page ---

function StatCard({ title, value, icon, isProfit = false, profitValue = 0 }) {
  const textColor = isProfit ? (profitValue >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-900';
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${isProfit ? 'col-span-2' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-full">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
    </div>
  );
}

function CropStat({ name, data }) {
  const profitColor = data.profit >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <li className="pb-4 border-b border-gray-100 last:border-b-0">
      <h3 className="text-lg font-semibold capitalize mb-2">{name}</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">Bought</p>
          <p className="text-sm font-medium text-red-600">{formatCurrency(data.bought)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Sold</p>
          <p className="text-sm font-medium text-green-600">{formatCurrency(data.sold)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Net Profit</p>
          <p className={`text-sm font-medium ${profitColor}`}>{formatCurrency(data.profit)}</p>
        </div>
      </div>
    </li>
  );
}