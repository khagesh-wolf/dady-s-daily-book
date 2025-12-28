import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Function to generate a cryptographically secure random access key
const generateAccessKey = () => {
  // Use crypto.getRandomValues for cryptographically secure random generation
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export default function AddCustomerForm({ onSave, onCancel, initialData }) {
  const { t } = useLanguage();
  
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    
    // Input validation with length limits
    if (!trimmedName) {
      alert('Please enter a customer name.');
      return;
    }
    if (trimmedName.length > 100) {
      alert('Customer name must be less than 100 characters.');
      return;
    }
    if (trimmedPhone && trimmedPhone.length > 20) {
      alert('Phone number must be less than 20 characters.');
      return;
    }
    // Phone format validation - allow only digits, +, -, spaces, parentheses
    if (trimmedPhone && !/^[0-9+\-\s()]*$/.test(trimmedPhone)) {
      alert('Phone number contains invalid characters.');
      return;
    }
    if (trimmedAddress && trimmedAddress.length > 200) {
      alert('Address must be less than 200 characters.');
      return;
    }

    // Generate access key for new customers, keep existing for edits
    const accessKey = initialData?.accessKey || generateAccessKey();

    onSave({
      id: initialData?.id,
      name: trimmedName,
      phone: trimmedPhone,
      address: trimmedAddress,
      accessKey: accessKey,
    });
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onCancel} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {initialData ? t('edit_customer') : t('add_new_customer')}
        </h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder="e.g. Sitaram Chaudhary (Lamahi)"
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('phone')}</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder={t('phone_optional')}
            inputMode="tel"
            maxLength={20}
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('address')}</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder={t('address_optional')}
            maxLength={200}
          />
        </div>
      </div>
      
      <footer className="p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700"
        >
          {initialData ? t('save_changes') : t('save_customer')}
        </button>
      </footer>
    </div>
  );
}