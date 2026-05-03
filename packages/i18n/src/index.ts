import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const defaultNS = "common";
export const resources = {
  en: { common: en },
  ar: { common: ar },
} as const;

export type Language = "en" | "ar";
export const locales: Language[] = ["en", "ar"];
export const defaultLocale: Language = "en";

export type Dictionary = typeof en;

export function initI18n(lng: Language = "en") {
  i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
}

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  ar: () => import("./locales/ar.json").then((module) => module.default),
};

export async function getDictionary(locale: Language) {
  return dictionaries[locale]();
}

export function isValidLocale(locale: string): locale is Language {
  return locales.includes(locale as Language);
}

export { i18n };
export { useTranslation, Trans } from "react-i18next";
