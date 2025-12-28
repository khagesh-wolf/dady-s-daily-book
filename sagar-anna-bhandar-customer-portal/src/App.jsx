import { useEffect } from 'react'; // Add this import
import { Routes, Route } from 'react-router-dom';
import PublicCustomerPage from './components/PublicCustomerPage.jsx';

function App() {
  // Add service worker registration for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('SW registered: ', registration);
          },
          function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          }
        );
      });
    }
  }, []);

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 flex flex-col relative">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* This is the route you asked for, using the secret accessKey */}
          <Route path="/customer/:accessKey" element={<PublicCustomerPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Error 404</h1>
      <p className="text-gray-600">This page was not found.</p>
    </div>
  )
}

export default App;