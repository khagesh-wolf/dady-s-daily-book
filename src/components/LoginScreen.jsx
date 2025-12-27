import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sign in with the email/pass you created in the Firebase console
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in App.jsx will do the rest.
    } catch (e) {
      setError("Incorrect email or password.");
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
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </div>
    </div>
  );
}