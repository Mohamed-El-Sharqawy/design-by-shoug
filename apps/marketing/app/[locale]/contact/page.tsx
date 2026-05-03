import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ContactPageClient } from "./ContactPageClient";

export default async function ContactPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ContactPageClient locale={locale} />;
}
