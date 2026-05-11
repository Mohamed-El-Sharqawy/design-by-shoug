import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordPageClient } from "./ForgotPasswordPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <ForgotPasswordPageClient locale={locale} />
    </Suspense>
  );
}
