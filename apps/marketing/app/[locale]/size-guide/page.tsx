import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { SizeGuideClient } from "./SizeGuideClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/size-guide",
    titleEn: "Size Guide | Design By Shoug",
    titleAr: "دليل المقاسات | ديزاين باي شوق",
    descEn: "Find your perfect fit with our size guide. Detailed measurements and tips for choosing the right abaya size.",
    descAr: "اعثري على مقاسك المثالي مع دليل المقاسات. قياسات مفصلة ونصائح لاختيار المقاس المناسب للعباية.",
    keywordsEn: "size guide, abaya sizes, measurements, fit guide",
    keywordsAr: "دليل المقاسات, مقاسات العباية, القياسات",
  });
}

export default async function SizeGuidePage() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("SizeGuide");

  return <SizeGuideClient locale={locale} />;
}
