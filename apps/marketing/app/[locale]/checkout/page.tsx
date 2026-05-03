import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { CheckoutPageClient } from "./CheckoutPageClient";

export default async function CheckoutPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <CheckoutPageClient locale={locale} />
    </Suspense>
  );
}
