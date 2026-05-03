import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { AccountPageClient } from "./AccountPageClient";

export default async function AccountPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AccountPageClient locale={locale} />;
}
