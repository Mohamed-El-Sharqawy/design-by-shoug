import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { AccountPageClient } from "./AccountPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function AccountPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AccountPageClient locale={locale} />;
}
