import { I18n } from 'i18n-js';
import en from './locales/en';
import hi from './locales/hi';
import mr from './locales/mr';
import or from './locales/or';
import as from './locales/as';
import bn from './locales/bn';
import gu from './locales/gu';
import kn from './locales/kn';
import ml from './locales/ml';
import pa from './locales/pa';
import ta from './locales/ta';

let i18n: I18n;

try {
  i18n = new I18n({
    en,
    hi,
    mr,
    or,
    as,
    bn,
    gu,
    kn,
    ml,
    pa,
    ta,
  });

  // Set the default locale
  i18n.defaultLocale = 'en';
  i18n.locale = 'en';

  // Enable fallback to default locale
  i18n.enableFallback = true;
} catch (err) {
  console.error('Error initializing i18n:', err);
  // Fallback i18n instance
  i18n = new I18n({ en });
  i18n.defaultLocale = 'en';
  i18n.locale = 'en';
  i18n.enableFallback = true;
}

export default i18n;

// Export locale object for direct access (backwards compatibility)
export { default as translations } from './locales/en';

// Helper function to translate with parameters
export const t = (key: string, options?: any) => {
  return i18n.t(key, options);
};

// Helper function to change language
export const changeLanguage = (locale: string) => {
  try {
    const validLocales = ['en', 'hi', 'mr', 'or', 'as', 'bn', 'gu', 'kn', 'ml', 'pa', 'ta'];
    if (validLocales.includes(locale)) {
      i18n.locale = locale;
    } else {
      console.warn(`Invalid locale: ${locale}, falling back to 'en'`);
      i18n.locale = 'en';
    }
  } catch (err) {
    console.error('Error changing language:', err);
    i18n.locale = 'en';
  }
};

// Helper function to get current language
export const getCurrentLanguage = () => {
  return i18n.locale;
};

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];
};
