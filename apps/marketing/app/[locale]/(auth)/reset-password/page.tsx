import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ResetPasswordPageClient } from "./ResetPasswordPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getLocale();
  setRequestLocale(locale);
  const params = await searchParams;

  return <ResetPasswordPageClient locale={locale} token={params.token || ""} />;
}
