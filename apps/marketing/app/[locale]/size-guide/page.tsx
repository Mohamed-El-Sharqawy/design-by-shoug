import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { SizeGuideClient } from "./SizeGuideClient";

export default async function SizeGuidePage() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("SizeGuide");

  return <SizeGuideClient locale={locale} />;
}
