import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ContactPageClient } from "./ContactPageClient";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const canonical = `${SITE_URL}/${locale}/contact`;

  const title = isAr
    ? "تواصلي معنا | ديزاين باي شوق"
    : "Contact Us | Design By Shoug";
  const description = isAr
    ? "تواصلي مع ديزاين باي شوق للاستفسارات والدعم. نحن هنا لمساعدتك."
    : "Get in touch with Design By Shoug for inquiries and support. We're here to help.";

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/contact`,
        ar: `${SITE_URL}/ar/contact`,
        "x-default": `${SITE_URL}/en/contact`,
      },
    },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ContactPageClient locale={locale} />;
}
