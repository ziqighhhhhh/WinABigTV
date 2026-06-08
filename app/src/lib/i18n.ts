import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import ar from '../../public/locales/ar/translation.json';
import fr from '../../public/locales/fr/translation.json';

const savedLanguage =
  typeof window === 'undefined' ? undefined : localStorage.getItem('preferred_language') ?? undefined;

i18n
  .use(initReactI18next)
  .init({
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'fr'],
    nonExplicitSupportedLngs: true,
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
