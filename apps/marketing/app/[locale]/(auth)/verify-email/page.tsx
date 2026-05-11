import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { VerifyEmailPageClient } from "./VerifyEmailPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function VerifyEmailPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <VerifyEmailPageClient locale={locale} />
    </Suspense>
  );
}
