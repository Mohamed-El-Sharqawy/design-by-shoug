import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { RegisterPageClient } from "./RegisterPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function RegisterPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <RegisterPageClient locale={locale} />;
}
