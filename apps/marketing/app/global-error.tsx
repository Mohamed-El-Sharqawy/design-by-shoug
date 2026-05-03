"use client";

import "./globals.css";
import localFont from "next/font/local";
import { useEffect } from "react";

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
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
    retry: "Try Again",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    retry: "حاول مرة أخرى",
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const locale =
    typeof window !== "undefined" && window.location.pathname.startsWith("/ar")
      ? "ar"
      : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white`}>
        <section className="py-24 sm:py-32 min-h-screen flex items-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div className="mb-8 flex justify-center">
              <svg
                className="w-20 h-20 text-[#E8E4DF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
              {t[locale].title}
            </h1>
            <p className="text-sm text-[#999] font-light tracking-wide leading-relaxed max-w-md mx-auto mb-10">
              {t[locale].description}
            </p>
            <button
              onClick={reset}
              className="inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
            >
              {t[locale].retry}
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
