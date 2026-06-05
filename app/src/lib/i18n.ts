import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../public/locales/en/translation.json';
import arTranslation from '../public/locales/ar/translation.json';
import frTranslation from '../public/locales/fr/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
    fallbackLng: 'en',
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
