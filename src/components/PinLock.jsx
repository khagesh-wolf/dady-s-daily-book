import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { hashPin, verifyPin } from '../utils/pinHash.js';

/**
 * PinScreen is the "View" component.
 * It is defined outside the main component to prevent state-related render bugs.
 */
function PinScreen({ title, subtitle, pin, setPin, error, onSubmit, onCancel, loading }) {
  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col items-center p-8 bg-gray-50 relative">
      
      {/* Conditional Back Button */}
      {onCancel && (
        <button 
          onClick={onCancel} 
          className="absolute top-4 left-4 p-2 text-gray-600"
          disabled={loading}
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
        disabled={loading}
      />
      
      {error && <p className="text-red-600 mb-4">{error}</p>} 
      
      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Verifying...' : 'Enter'}
      </button>
    </div>
  );
}


export default function PinLock({ mode, onUnlock, onCancel, title }) {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [savedPinHash, setSavedPinHash] = useState(null);
  const [isLegacyPin, setIsLegacyPin] = useState(false);
  
  // Load saved PIN hash on mount
  useEffect(() => {
    const storedHash = localStorage.getItem('app_pin_hash');
    const legacyPin = localStorage.getItem('app_pin');
    
    if (storedHash) {
      setSavedPinHash(storedHash);
    } else if (legacyPin) {
      // Migration: old plain-text PIN exists
      setIsLegacyPin(true);
      setSavedPinHash(legacyPin);
    }
  }, []);
  
  const [step, setStep] = useState(() => {
    if (mode === 'check') {
      return 'check';
    }
    const hasPin = localStorage.getItem('app_pin_hash') || localStorage.getItem('app_pin');
    if (mode === 'create' && hasPin) {
      return 'check_old';
    }
    return 'create_new';
  });

  if (step === 'check') {
    const handleLogin = async () => {
      setLoading(true);
      setError('');
      
      try {
        let isValid = false;
        
        if (isLegacyPin) {
          // Compare with legacy plain-text PIN
          isValid = pin === savedPinHash;
          if (isValid) {
            // Migrate to hashed PIN
            const newHash = await hashPin(pin);
            localStorage.setItem('app_pin_hash', newHash);
            localStorage.removeItem('app_pin');
          }
        } else if (savedPinHash) {
          isValid = await verifyPin(pin, savedPinHash);
        }
        
        if (isValid) {
          onUnlock();
        } else {
          setError('Incorrect PIN. Try again.');
          setPin('');
        }
      } catch (e) {
        setError('Error verifying PIN. Please try again.');
        setPin('');
      } finally {
        setLoading(false);
      }
    };
    
    return <PinScreen 
             title={title || 'Enter your PIN'} 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleLogin} 
             onCancel={onCancel}
             loading={loading}
           />;
  }

  if (step === 'check_old') {
    const handleCheckOld = async () => {
      setLoading(true);
      setError('');
      
      try {
        let isValid = false;
        
        if (isLegacyPin) {
          isValid = pin === savedPinHash;
        } else if (savedPinHash) {
          isValid = await verifyPin(pin, savedPinHash);
        }
        
        if (isValid) {
          setStep('create_new');
          setPin('');
        } else {
          setError('Incorrect Old PIN. Try again.');
          setPin('');
        }
      } catch (e) {
        setError('Error verifying PIN. Please try again.');
        setPin('');
      } finally {
        setLoading(false);
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
             loading={loading}
           />;
  }
  
  if (step === 'create_new') {
    const handleCreate = () => {
      if (pin.length < 4) {
        setError('New PIN must be at least 4 digits.');
        return;
      }
      if (!/^\d+$/.test(pin)) {
        setError('PIN must contain only numbers.');
        return;
      }
      setNewPin(pin);
      setStep('confirm_new');
      setPin('');
      setError('');
    };
    const createTitle = (savedPinHash ? 'Enter New PIN' : 'Create a 4-digit PIN');
    return <PinScreen 
             title={createTitle} 
             pin={pin} 
             setPin={setPin} 
             error={error} 
             onSubmit={handleCreate} 
             onCancel={onCancel}
             loading={loading}
           />;
  }
  
  // Step: Confirm new PIN
  if (step === 'confirm_new') {
    const handleConfirm = async () => {
      if (pin === newPin) {
        setLoading(true);
        try {
          const pinHash = await hashPin(pin);
          localStorage.setItem('app_pin_hash', pinHash);
          localStorage.removeItem('app_pin'); // Remove legacy plain-text PIN
          onUnlock();
        } catch (e) {
          setError('Error saving PIN. Please try again.');
        } finally {
          setLoading(false);
        }
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
             loading={loading}
           />;
  }
}
