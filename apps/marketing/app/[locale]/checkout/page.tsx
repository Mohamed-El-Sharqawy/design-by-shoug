import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { CheckoutPageClient } from "./CheckoutPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function CheckoutPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <CheckoutPageClient locale={locale} />
    </Suspense>
  );
}
