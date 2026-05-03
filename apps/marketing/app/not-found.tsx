import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";
import { headers } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const t = {
  en: {
    title: "Page Not Found",
    description: "The page you are looking for doesn't exist or has been moved.",
    backHome: "Back to Home",
  },
  ar: {
    title: "الصفحة غير موجودة",
    description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    backHome: "العودة للرئيسية",
  },
};

export default async function RootNotFound() {
  const headersList = await headers();
  const pathname =
    headersList.get("x-next-url") ||
    headersList.get("x-invoke-path") ||
    "";
  const locale = pathname.startsWith("/ar") ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white`}>
        <section className="py-24 sm:py-32 min-h-screen flex items-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <span className="font-serif text-8xl sm:text-9xl text-[#E8E4DF] tracking-wider select-none block mb-6">
              404
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
              {t[locale].title}
            </h1>
            <p className="text-sm text-[#999] font-light tracking-wide leading-relaxed max-w-md mx-auto mb-10">
              {t[locale].description}
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
            >
              {t[locale].backHome}
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
