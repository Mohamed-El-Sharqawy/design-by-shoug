import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { FAQPageClient } from "./FAQPageClient";
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
    path: "/faq",
    titleEn: "FAQ | Design By Shoug",
    titleAr: "الأسئلة الشائعة | ديزاين باي شوق",
    descEn: "Find answers to frequently asked questions about orders, shipping, returns, and more at Design By Shoug.",
    descAr: "اعثري على إجابات للأسئلة الشائعة حول الطلبات، الشحن، الإرجاع والمزيد في ديزاين باي شوق.",
    keywordsEn: "FAQ, help, shipping, returns, orders, Design By Shoug",
    keywordsAr: "أسئلة شائعة, مساعدة, شحن, إرجاع, طلبات, ديزاين باي شوق",
  });
}

export default async function FAQPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <FAQPageClient locale={locale} />;
}
