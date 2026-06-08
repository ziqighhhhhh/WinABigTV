import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import ar from '../../public/locales/ar/translation.json';
import fr from '../../public/locales/fr/translation.json';

const supportedLanguages = ['en', 'ar', 'fr'] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function getSavedLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';

  try {
    const savedLanguage = window.localStorage.getItem('preferred_language');
    return supportedLanguages.includes(savedLanguage as SupportedLanguage)
      ? (savedLanguage as SupportedLanguage)
      : 'en';
  } catch {
    return 'en';
  }
}

i18n
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
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
