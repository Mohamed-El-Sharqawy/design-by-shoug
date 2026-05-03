import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { RegisterPageClient } from "./RegisterPageClient";

export default async function RegisterPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <RegisterPageClient locale={locale} />;
}
