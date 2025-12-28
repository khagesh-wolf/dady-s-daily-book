import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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
      if (lockoutData) {
        const { lockoutUntil } = JSON.parse(lockoutData);
        if (lockoutUntil && Date.now() < lockoutUntil) {
          setLockoutRemaining(Math.ceil((lockoutUntil - Date.now()) / 1000));
        } else {
          setLockoutRemaining(0);
          sessionStorage.removeItem('login_lockout');
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    // Check if currently locked out
    const lockoutData = sessionStorage.getItem('login_lockout');
    if (lockoutData) {
      const { lockoutUntil } = JSON.parse(lockoutData);
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
        setError(`Too many failed attempts. Try again in ${remainingMinutes} minute(s).`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Clear lockout data on successful login
      sessionStorage.removeItem('login_lockout');
    } catch (e) {
      // Track failed attempts
      const currentData = sessionStorage.getItem('login_lockout');
      const { attempts = 0 } = currentData ? JSON.parse(currentData) : {};
      const newAttempts = attempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        sessionStorage.setItem('login_lockout', JSON.stringify({ attempts: newAttempts, lockoutUntil }));
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        sessionStorage.setItem('login_lockout', JSON.stringify({ attempts: newAttempts }));
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