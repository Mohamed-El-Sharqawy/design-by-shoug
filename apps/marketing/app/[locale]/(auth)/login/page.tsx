import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { LoginPageClient } from "./LoginPageClient";

export default async function LoginPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <LoginPageClient locale={locale} />;
}
