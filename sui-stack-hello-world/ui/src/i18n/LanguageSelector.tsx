/**
 * Language selector component
 * Allows users to switch between English and Spanish
 */

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from './translations';
import './LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <div className="language-selector">
      <label htmlFor="lang-select">{t.common.language}:</label>
      <select
        id="lang-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="language-select"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
