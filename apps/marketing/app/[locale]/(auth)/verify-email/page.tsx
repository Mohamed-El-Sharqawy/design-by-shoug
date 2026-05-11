import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { VerifyEmailPageClient } from "./VerifyEmailPageClient";

export default async function VerifyEmailPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense>
      <VerifyEmailPageClient locale={locale} />
    </Suspense>
  );
}
