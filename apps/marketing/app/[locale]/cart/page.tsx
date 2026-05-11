import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { CartPageClient } from "./CartPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function CartPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <CartPageClient locale={locale} />;
}
