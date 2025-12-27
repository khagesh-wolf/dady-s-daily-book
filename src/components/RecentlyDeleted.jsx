import { ArrowLeft, RefreshCw, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Helper to calculate days remaining
const getDaysRemaining = (deletedAt) => {
  if (!deletedAt?.toDate) return '...';
  
  const deletedTime = deletedAt.toDate().getTime();
  const now = new Date().getTime();
  const timeDiff = now - deletedTime;
  const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  const daysLeft = 60 - daysPassed;
  
  if (daysLeft <= 0) return 'Deleting soon...';
  return `${daysLeft} days remaining`;
};

export default function RecentlyDeleted({ customers, onBack, onRestore }) {
  const { t } = useLanguage();

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">Recently Deleted</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {customers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {customers.map(customer => (
              <li key={customer.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </span>
                  <div>
                    <p className="text-base font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-red-500">
                      {getDaysRemaining(customer.deletedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRestore(customer.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restore</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 p-8">The recycle bin is empty.</p>
        )}
      </div>
    </div>
  );
}