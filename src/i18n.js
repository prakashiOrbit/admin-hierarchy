import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './assets/locales/en.json';
import ar from './assets/locales/ar.json';
import fr from './assets/locales/fr.json';
import de from './assets/locales/de.json';
import it from './assets/locales/it.json';
import nl from './assets/locales/nl.json';
import cs from './assets/locales/cs.json';
import rm from './assets/locales/rm.json';

export const LOCALE_STORAGE_KEY = 'preferred_locale';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      nl: { translation: nl },
      cs: { translation: cs },
      rm: { translation: rm },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Called once at app startup — restores the last-persisted locale before first render.
export const restoreLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored !== i18n.language) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // AsyncStorage unavailable — fall back to default 'en'
  }
};

export default i18n;
