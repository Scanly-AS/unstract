import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from "../helpers/localStorage";
import en from "./locales/en.json";
import nb from "./locales/nb.json";

const LANGUAGE_KEY = "preferredLanguage";
const DEFAULT_LANGUAGE = "nb";

const savedLanguage = getLocalStorageValue(LANGUAGE_KEY, DEFAULT_LANGUAGE);

i18n.use(initReactI18next).init({
  resources: {
    nb: { translation: nb },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang) => {
  setLocalStorageValue(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export const LANGUAGES = [
  { code: "nb", label: "Norsk" },
  { code: "en", label: "English" },
];

export default i18n;
