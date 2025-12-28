import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_JSON_SIZE = 500; // Max bytes for sessionStorage JSON

// Safe JSON parse with size limit and type validation
const safeParseLockout = (jsonString) => {
  const defaultValue = { attempts: 0, lockoutUntil: 0 };
  if (!jsonString || typeof jsonString !== 'string' || jsonString.length > MAX_JSON_SIZE) {
    return defaultValue;
  }
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return defaultValue;
    }
    return {
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : 0,
    };
  } catch {
    return defaultValue;
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout status on mount and update countdown
  useEffect(() => {
    const checkLockout = () => {
      const lockoutData = sessionStorage.getItem('login_lockout');
      const { lockoutUntil } = safeParseLockout(lockoutData);
      if (lockoutUntil && Date.now() < lockoutUntil) {
        setLockoutRemaining(Math.ceil((lockoutUntil - Date.now()) / 1000));
      } else {
        setLockoutRemaining(0);
        if (lockoutData) sessionStorage.removeItem('login_lockout');
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    // Check if currently locked out
    const lockoutData = sessionStorage.getItem('login_lockout');
    const { lockoutUntil, attempts } = safeParseLockout(lockoutData);
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Too many failed attempts. Try again in ${remainingMinutes} minute(s).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Clear lockout data on successful login
      sessionStorage.removeItem('login_lockout');
    } catch {
      // Track failed attempts
      const newAttempts = attempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        const newLockoutUntil = Date.now() + LOCKOUT_DURATION;
        sessionStorage.setItem('login_lockout', JSON.stringify({ attempts: newAttempts, lockoutUntil: newLockoutUntil }));
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        sessionStorage.setItem('login_lockout', JSON.stringify({ attempts: newAttempts, lockoutUntil: 0 }));
        setError(`Incorrect email or password. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
      setLoading(false);
    }
  };
  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col items-center justify-center p-8">
      <img 
        src="/logo.png" 
        alt="Sagar Anna Bhandar Logo" 
        className="w-24 h-24 mb-6" 
      />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Login</h1>
      
      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder="admin@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder="••••••••"
          />
        </div>
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading || lockoutRemaining > 0}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Logging In...' : lockoutRemaining > 0 ? `Locked (${Math.ceil(lockoutRemaining / 60)}m)` : 'Log In'}
        </button>
      </div>
    </div>
  );
}