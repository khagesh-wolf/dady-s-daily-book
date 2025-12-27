import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

/**
 * PinScreen is the "View" component.
 * It is defined outside the main component to prevent state-related render bugs.
 */
function PinScreen({ title, subtitle, pin, setPin, error, onSubmit, onCancel }) {
  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col items-center p-8 bg-gray-50 relative">
      
      {/* Conditional Back Button */}
      {onCancel && (
        <button 
          onClick={onCancel} 
          className="absolute top-4 left-4 p-2 text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      
      {/* Logo from /public/logo.png */}
      <img 
        src="/logo.png" 
        alt="Sagar Anna Bhandar Logo" 
        className="w-60 h-50 mb-12 mt-8" 
      />
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      {subtitle && <p className="text-lg text-gray-600 mb-2">{subtitle}</p>}
      
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="w-full p-4 text-center text-2xl border border-gray-300 rounded-md shadow-sm mb-4"
        maxLength={4}
        pattern="\d*"
        inputMode="numeric"
      />
      
      {error && <p className="text-red-600 mb-4">{error}</p>} 
      
      <button
        onClick={onSubmit}
        className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700"
      >
        Enter
      </button>
    </div>
  );
}


export default function PinLock({ mode, onUnlock, onCancel, title }) {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  
  const savedPin = localStorage.getItem('app_pin');
  
  const [step, setStep] = useState(() => {
    if (mode === 'check') {
      return 'check';
    }
    if (mode === 'create' && savedPin) {
      return 'check_old';
    }
    return 'create_new';
  });

  if (step === 'check') {
    const handleLogin = () => {
      if (pin === savedPin) {
        onUnlock(); 
      } else {
        setError('Incorrect PIN. Try again.');
        setPin('');
      }
    };
    return <PinScreen 
             title={title || 'Enter your PIN'} 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleLogin} 
             onCancel={onCancel} 
           />;
  }

    if (step === 'check_old') {
    const handleCheckOld = () => {
      if (pin === savedPin) {
        setStep('create_new');
        setPin('');
        setError('');
      } else {
        setError('Incorrect Old PIN. Try again.');
        setPin('');
      }
    };
    return <PinScreen 
             title={t('set_change_pin')} 
             subtitle="Enter Old PIN" 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleCheckOld} 
             onCancel={onCancel} 
           />;
  }
  if (step === 'create_new') {
    const handleCreate = () => {
      if (pin.length < 4) {
        setError('New PIN must be at least 4 digits.');
        return;
      }
      setNewPin(pin);
      setStep('confirm_new');
      setPin('');
      setError('');
    };
    const createTitle = (savedPin ? 'Enter New PIN' : 'Create a 4-digit PIN');
    return <PinScreen 
             title={createTitle} 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleCreate} 
             onCancel={onCancel} 
           />;
  }
  
  // Step 2c: Confirm new PIN
  if (step === 'confirm_new') {
    // --- THIS IS THE FIXED LINE ---
    const handleConfirm = () => { 
      if (pin === newPin) {
        localStorage.setItem('app_pin', pin);
        onUnlock();
      } else {
        setError('PINs do not match. Try again.');
        setPin('');
        setStep('create_new');
      }
    };
    return <PinScreen 
             title={'Confirm New PIN'} 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleConfirm} 
             onCancel={onCancel} 
           />;
  }
}