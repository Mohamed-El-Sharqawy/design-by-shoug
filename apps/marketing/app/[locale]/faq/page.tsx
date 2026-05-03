import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { FAQPageClient } from "./FAQPageClient";

export default async function FAQPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <FAQPageClient locale={locale} />;
}
