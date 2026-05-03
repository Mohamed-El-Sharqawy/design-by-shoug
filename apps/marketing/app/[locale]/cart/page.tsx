import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { CartPageClient } from "./CartPageClient";

export default async function CartPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <CartPageClient locale={locale} />;
}
