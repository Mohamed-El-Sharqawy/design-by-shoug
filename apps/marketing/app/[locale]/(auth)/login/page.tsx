import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { LoginPageClient } from "./LoginPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LoginPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <LoginPageClient locale={locale} />;
}
