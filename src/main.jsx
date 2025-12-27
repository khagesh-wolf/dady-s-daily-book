import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import "@kkeshavv18/nepali-datepicker/dist/index.css"; // For the calendar
import { LanguageProvider } from './hooks/useLanguage.jsx'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)