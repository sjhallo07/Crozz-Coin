/**
 * Language context provider for i18n support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or browser language
    const stored = localStorage.getItem('language') as Language;
    if (stored && (stored === 'en' || stored === 'es')) {
      return stored;
    }
    
    // Default to English if browser language is not Spanish
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
    return browserLang as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const useTranslate = () => {
  const { t } = useLanguage();
  return t;
};
