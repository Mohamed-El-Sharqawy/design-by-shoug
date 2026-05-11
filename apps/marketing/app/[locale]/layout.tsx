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
  const baseUrl = "http://localhost:3000";
  const canonicalUrl = locale ? `${baseUrl}/${locale}` : baseUrl;
  const description = locale === "ar" ? "انطلقت Design by Shoug من شغف بابتكار عبايات تبرز جمال الأزياء المحتشمة. كل قطعة في مجموعتنا مصممة بعناية فائقة لمزج التقاليد العريقة مع الجماليات المعاصرة، مما يمكن المرأة من التعبير عن شخصيتها برقي وثقة." : "Design by Shoug was born from a passion for creating abayas that celebrate the beauty of modest fashion. Each piece in our collection is thoughtfully designed to blend timeless tradition with contemporary aesthetics, empowering women to express their individuality with grace and confidence.";

  return {
    metadataBase: new URL(baseUrl),
    title: "Design By Shoug",
    description,
    openGraph: {
      title: "Design By Shoug",
      description,
      images: "/opengraph-image.png",
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      title: "Design By Shoug",
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
