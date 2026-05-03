"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-24 sm:py-32 bg-white min-h-screen flex items-center">
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
          {t("title")}
        </h1>

        <p className="text-sm text-[#999] font-light tracking-wide leading-relaxed max-w-md mx-auto mb-10">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
          >
            {t("retry")}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-block px-8 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
