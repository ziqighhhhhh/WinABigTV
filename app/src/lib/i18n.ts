import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const savedLanguage =
  typeof window === 'undefined' ? undefined : localStorage.getItem('preferred_language') ?? undefined;

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'fr'],
    nonExplicitSupportedLngs: true,
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
