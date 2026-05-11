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
import { PageTransitionLoader } from "@/components/layout/PageTransition";
import { Providers } from "@/components/Providers";
import "../globals.css";
import { setRequestLocale } from "next-intl/server";
import { getCartSSR } from "@/lib/cart-ssr";

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
  const baseUrl = "https://designbyshoug.com";
  const canonicalUrl = locale ? `${baseUrl}/${locale}` : baseUrl;
  const title = locale === "ar" ? "ديزاين باي شوق | أزياء فاخرة وأناقة عصرية" : "Design By Shoug | Luxury Fashion & Elegant Modern Style";
  const description = locale === "ar" ? "اكتشف ديزاين باي شوق — علامة أزياء عصرية تقدم تصاميم أنيقة وفاخرة تجمع بين الجمال، البساطة، والأناقة اليومية." : "Discover Design By Shoug — a modern fashion brand offering elegant, timeless, and stylish pieces crafted for confidence and everyday luxury.";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      images: "/opengraph-image.png",
      url: canonicalUrl,
      type: "website",
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
        "en-US": "/en-US",
        "ar-SA": "/ar-SA",
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
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const initialCartData = await getCartSSR();

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "if(history.scrollRestoration)history.scrollRestoration='manual'" }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider>
          <Providers initialCartData={initialCartData}>
            <AuthHydrator />
            <PageTransitionLoader />
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
