import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordPageClient } from "./ForgotPasswordPageClient";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <ForgotPasswordPageClient locale={locale} />
    </Suspense>
  );
}
