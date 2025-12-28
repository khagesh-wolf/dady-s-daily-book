// src/hooks/useLanguage.jsx
import { createContext, useContext, useState, useMemo } from 'react';
import { translations } from '../lang.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  const setLanguage = (newLang) => {
    localStorage.setItem('app_lang', newLang);
    setLang(newLang);
  };

  const t = (key) => {
    if (!key) return '';
    return translations[key] ? translations[key][lang] : key;
  };

  const value = useMemo(() => ({
    lang,
    setLanguage,
    t,
  }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};