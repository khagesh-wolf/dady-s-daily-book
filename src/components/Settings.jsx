import { 
  Lock, 
  Languages, 
  Download, 
  Cloud, 
  Upload, 
  Trash2, 
  RefreshCw // <-- Import new icon
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function Settings({ 
  customers, 
  transactions, 
  expenses, 
  onImport, 
  onSetPin,
  onShowRecentlyDeleted
}) {
  const { lang, setLanguage, t } = useLanguage();

  const handleLocalBackup = () => {
    const backupData = { customers, transactions, expenses, backupDate: new Date().toISOString() };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sagar-anna-bhandar-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    alert('Backup downloaded successfully!');
  };
  
  const handleGoogleDriveBackup = () => {
    alert('This is a complex feature for a future update. Please use the "Download Local Backup" button.');
  };

  // <-- Add refresh handler
  const handleRefreshData = () => {
    alert('Forcing app to refresh data from server...');
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">{t('nav_settings')}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('security')}</h2>
          <button onClick={onSetPin} className="w-full flex justify-center items-center space-x-2 p-3 bg-gray-100 text-gray-800 rounded-lg font-medium">
            <Lock className="w-5 h-5" />
            <span>{t('set_change_pin')}</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('preferences')}</h2>
          <div className="flex items-center space-x-3">
            <Languages className="w-5 h-5 text-gray-500" />
            <span className="text-base text-gray-800">{t('language')}</span>
          </div>
          <div className="flex space-x-2 mt-2">
            <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-md ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              English
            </button>
            <button onClick={() => setLanguage('ne')} className={`flex-1 py-2 rounded-md ${lang === 'ne' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              नेपाली
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('data_backup')}</h2>
          <div className="space-y-3">
            
            {/* --- ADD NEW BUTTON HERE --- */}
            <button onClick={handleRefreshData} className="w-full flex justify-center items-center space-x-2 p-3 bg-gray-100 text-gray-800 rounded-lg font-medium">
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </button>
            
            <button onClick={onShowRecentlyDeleted} className="w-full flex justify-center items-center space-x-2 p-3 bg-gray-100 text-gray-800 rounded-lg font-medium">
              <Trash2 className="w-5 h-5" />
              <span>Recently Deleted</span>
            </button>
            <button onClick={handleLocalBackup} className="w-full flex justify-center items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg font-medium">
              <Download className="w-5 h-5" />
              <span>{t('download_local_backup')}</span>
            </button>
            <button onClick={onImport} className="w-full flex justify-center items-center space-x-2 p-3 bg-gray-600 text-white rounded-lg font-medium">
              <Upload className="w-5 h-5" />
              <span>{t('import_from_backup')}</span>
            </button>
            <button onClick={handleGoogleDriveBackup} className="w-full flex justify-center items-center space-x-2 p-3 bg-gray-200 text-gray-700 rounded-lg font-medium">
              <Cloud className="w-5 h-5" />
              <span>{t('sync_to_google_drive')}</span>
            </button>
          </div>
        </div>
        
         <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('about_the_app')}</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('version')}</span>
            <span className="text-gray-800">1.1.2</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">{t('idea_by')}</span>
            <span className="text-gray-800">Diwash</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">{t('created_by')}</span>
            <span className="text-gray-800">Khagesh</span>
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            © {new Date().getFullYear()} Sagar Anna Bhandar. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}