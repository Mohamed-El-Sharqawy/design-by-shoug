export type Language = "en" | "ar";
export const locales: Language[] = ["en", "ar"];
export const defaultLocale: Language = "en";

export function isValidLocale(locale: string): locale is Language {
  return locales.includes(locale as Language);
}
