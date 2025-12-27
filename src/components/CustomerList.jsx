import { useMemo, useState } from 'react';
import { User, Search } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

function CustomerListItem({ customer, due, onSelectCustomer, formatCurrency, t }) {
  return (
    <li
      onClick={() => onSelectCustomer(customer.id)}
      className="flex items-center p-4 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
    >
      <span className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-gray-500" />
      </span>
      <div className="flex-1 min-w-0 ml-4">
        <p className="text-base font-medium text-gray-900 truncate">
          {customer.name}
        </p>
        
        <p className="text-sm text-gray-500 truncate">
          {customer.phone} {customer.address ? `- ${customer.address}` : ''}
        </p>
        
      </div>
      <div className="flex-shrink-0 ml-4 text-right">
        {due > 0 && (
          <p className="text-base font-medium text-green-600">
            Rs. {formatCurrency(due)} ({t('due')})
          </p>
        )}
        {due < 0 && (
          <p className="text-base font-medium text-red-600">
            Rs. {formatCurrency(Math.abs(due))} ({t('owed')})
          </p>
        )}
        {due === 0 && (
          <p className="text-base font-medium text-gray-500">
            {t('settled')}
          </p>
        )}
      </div>
    </li>
  );
}

export default function CustomerList({ customers, onSelectCustomer, getCustomerDues }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filter, setFilter] = useState('all'); 

  const customerMatchesFilter = (customer) => {
    const due = getCustomerDues(customer.id);
    if (filter === 'all') {
      return true;
    }
    if (filter === 'due') {
      return due > 0;
    }
    if (filter === 'owed') {
      return due < 0;
    }
    return true;
  };

  const latestCustomer = useMemo(() => {
    if (!customers || customers.length === 0) {
      return null;
    }
    const sorted = [...customers].sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
    
    if (sorted[0] && sorted[0].createdAt) {
      if (customerMatchesFilter(sorted[0])) {
        return sorted[0];
      }
    }
    return null;
  }, [customers, filter, getCustomerDues]); 

  const groupedCustomers = useMemo(() => {
    const filteredCustomers = customers.filter(customer =>
      (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)) &&
      customerMatchesFilter(customer)
    );

    const groups = {};
    filteredCustomers
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((customer) => {
        const letter = customer.name[0]?.toUpperCase() || '?';
        if (!groups[letter]) {
          groups[letter] = [];
        }
        groups[letter].push(customer);
      });
    return groups;
  }, [customers, searchQuery, filter, getCustomerDues]); 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };
  
  const getFilterButtonClass = (filterName) => {
    if (filter === filterName) {
      return "flex-1  text-sm bg-blue-600 text-white rounded-lg shadow";
    }
    return "flex-1  text-sm bg-gray-200 text-gray-700 rounded-lg";
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10">        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={getFilterButtonClass('all')}
          >
            All
          </button>
          <button
            onClick={() => setFilter('due')}
            className={getFilterButtonClass('due')}
          >
            To Receive ({t('due')})
          </button>
          <button
            onClick={() => setFilter('owed')}
            className={getFilterButtonClass('owed')}
          >
            To Pay ({t('owed')})
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative">
        

        <ul className="divide-y divide-gray-200 pb-28">
          
          {latestCustomer && !searchQuery && (
            <li key="recent">
              <div className="px-4 py-1 bg-gray-100 text-sm font-medium text-gray-600 sticky top-0">
                Recently Added
              </div>
              <ul>
                <CustomerListItem 
                  customer={latestCustomer} 
                  due={getCustomerDues(latestCustomer.id)} 
                  onSelectCustomer={onSelectCustomer} 
                  formatCurrency={formatCurrency}
                  t={t}
                />
              </ul>
            </li>
          )}
          
          {Object.entries(groupedCustomers).map(([letter, group]) => (
            <li key={letter}>
              <div
                id={`letter-${letter}`}
                className="px-4 py-1 bg-gray-100 text-sm font-bold text-gray-600 sticky top-0"
              >
                {letter}
              </div>
              <ul>
                {group.map((customer) => (
                  <CustomerListItem
                    key={customer.id}
                    customer={customer}
                    due={getCustomerDues(customer.id)}
                    onSelectCustomer={onSelectCustomer}
                    formatCurrency={formatCurrency}
                    t={t}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}