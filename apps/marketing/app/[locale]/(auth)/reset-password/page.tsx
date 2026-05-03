import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ResetPasswordPageClient } from "./ResetPasswordPageClient";

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
