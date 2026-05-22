import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from './assets/locales/en.json';
import ar from './assets/locales/ar.json';
import fr from './assets/locales/fr.json';
import de from './assets/locales/de.json';
import it from './assets/locales/it.json';
import nl from './assets/locales/nl.json';
import cs from './assets/locales/cs.json';
import rm from './assets/locales/rm.json';

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

export default i18n;
