import { Users, LayoutDashboard, Settings } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function BottomNav({ activePage, onPageChange }) {
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav_customers'), icon: Users, page: 'customers' },
    { name: t('nav_dashboard'), icon: LayoutDashboard, page: 'dashboard' },
    { name: t('nav_settings'), icon: Settings, page: 'settings' },
  ];

  return (
    <nav className="w-full max-w-md mx-auto bg-white border-t border-gray-200 sticky bottom-0 z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onPageChange(item.page)}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activePage === item.page
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}