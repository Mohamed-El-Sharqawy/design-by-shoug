import { Suspense } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { Qualities } from "@/components/Qualities";
import { Footer } from "@/components/Footer";
import { AuthHydrator } from "@/components/AuthHydrator";
import { CartBottomBar } from "@/components/CartBottomBar";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { MaintenanceModal } from "@/components/MaintenanceModal";
import { Providers } from "@/components/Providers";
import { FacebookPixel } from "@/components/FacebookPixel";
import { ScrollToTop } from "@/components/ScrollToTop";
import "../globals.css";
import { setRequestLocale } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("SEO");
  const baseUrl = SITE_URL;
  const canonicalUrl = `${baseUrl}/${locale}`;
  const title = t("title");
  const description = t("description");
  const keywords = t("keywords");
  const isAr = locale === "ar";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | Design By Shoug`,
    },
    description,
    keywords,
    authors: [{ name: "Design By Shoug", url: baseUrl }],
    publisher: "Design By Shoug",
    creator: "Design By Shoug",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      images: "/opengraph-image.png",
      url: canonicalUrl,
      siteName: "Design By Shoug",
      type: "website",
      locale: isAr ? "ar_AE" : "en_US",
    },
    twitter: {
      title,
      description,
      images: "/twitter-image.png",
      card: "summary_large_image",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const locale = (await params).locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = await getTranslations("SEO");
  const isAr = locale === "ar";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Design By Shoug",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: t("organizationDescription"),
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@designbyshoug.com",
      contactType: "customer service",
      areaServed: "AE",
    },
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Design By Shoug",
    url: SITE_URL,
    inLanguage: isAr ? "ar" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "if(history.scrollRestoration)history.scrollRestoration='manual'" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Suspense>
          <FacebookPixel />
        </Suspense>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider
          locale={locale}
          timeZone="Asia/Dubai"
        >
          <Providers>
            <Suspense>
              <MaintenanceModal />
            </Suspense>
            <Suspense>
              <ScrollToTop />
            </Suspense>
            <AuthHydrator />
            <EmailVerificationBanner locale={locale} />
            <Header />
            <main className="pb-16 sm:pb-0">{children}</main>
            <FAQ />
            <Qualities />
            <Footer />
            <CartBottomBar />
            <WhatsAppFAB />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
