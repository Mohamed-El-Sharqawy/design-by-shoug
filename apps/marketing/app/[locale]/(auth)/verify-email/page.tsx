import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { VerifyEmailPageClient } from "./VerifyEmailPageClient";

export default async function VerifyEmailPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <VerifyEmailPageClient locale={locale} />;
}
