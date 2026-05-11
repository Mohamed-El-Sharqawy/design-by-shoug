import { Suspense } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { Qualities } from "@/components/Qualities";
import { Footer } from "@/components/Footer";
import { AuthHydrator } from "@/components/AuthHydrator";
import { CartBottomBar } from "@/components/CartBottomBar";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { Providers } from "@/components/Providers";
import { FacebookPixel } from "@/components/FacebookPixel";
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
  const baseUrl = SITE_URL;
  const canonicalUrl = `${baseUrl}/${locale}`;
  const isAr = locale === "ar";
  const title = isAr ? "ديزاين باي شوق | أزياء فاخرة وأناقة عصرية" : "Design By Shoug | Luxury Fashion & Elegant Modern Style";
  const description = isAr
    ? "اكتشف ديزاين باي شوق — علامة أزياء عصرية تقدم تصاميم أنيقة وفاخرة تجمع بين الجمال، البساطة، والأناقة اليومية."
    : "Discover Design By Shoug — a modern fashion brand offering elegant, timeless, and stylish pieces crafted for confidence and everyday luxury.";
  const keywords = isAr
    ? "أزياء, عبايات, فاخرة, أنيقة, الإمارات, دبي, ديزاين باي شوق, تصميم, أناقة, موضة"
    : "fashion, abayas, luxury, elegant, UAE, Dubai, Design By Shoug, modern, style, modest fashion";

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
  const isAr = locale === "ar";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Design By Shoug",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: isAr
      ? "ديزاين باي شوق — علامة أزياء عصرية تقدم تصاميم أنيقة وفاخرة"
      : "Design By Shoug — a modern fashion brand offering elegant and timeless pieces",
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense>
          <FacebookPixel />
        </Suspense>
        <NextIntlClientProvider
          locale={locale}
          timeZone="Asia/Dubai"
        >
          <Providers>
            <AuthHydrator />
            <EmailVerificationBanner locale={locale} />
            <Header />
            <main className="pb-16 sm:pb-0">{children}</main>
            <FAQ />
            <Qualities />
            <Footer />
            <CartBottomBar />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
