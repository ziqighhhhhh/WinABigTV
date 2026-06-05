import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ];

  return (
    <div className="flex items-center gap-1">
      <Globe size={16} className="text-gray-500 mr-1" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-500 text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={lang.label}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
