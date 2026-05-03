import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Language = "en" | "ar";
export const locales: Language[] = ["en", "ar"];
export const defaultLocale: Language = "en";

export type Dictionary = typeof en;

const dictionaries: Record<Language, () => Promise<Dictionary>> = {
  en: () => import("./locales/en.json").then((module) => module.default),
  ar: () => import("./locales/ar.json").then((module) => module.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;
  return dictionaries[validLocale]();
}

export function isValidLocale(locale: string): locale is Language {
  return locales.includes(locale as Language);
}
