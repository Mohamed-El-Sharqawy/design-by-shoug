import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

const localeMessages: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("../../../packages/i18n/src/locales/en.json"),
  ar: () => import("../../../packages/i18n/src/locales/ar.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await localeMessages[locale]()).default;

  return {
    locale,
    messages,
  };
});
