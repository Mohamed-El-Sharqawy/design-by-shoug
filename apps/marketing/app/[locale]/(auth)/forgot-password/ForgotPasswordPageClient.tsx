"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

export function ForgotPasswordPageClient({ locale }: { locale: string }) {
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(locale === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || json.error || "Request failed");
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "ar"
            ? "حدث خطأ"
            : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white flex items-center min-h-[60vh]">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#FAF9F7] flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-[#8B7355]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] tracking-wide">
              {t("successTitle")}
            </h1>
            <p className="mt-3 text-sm text-[#999] font-light tracking-wide leading-relaxed">
              {t("successDesc")}
            </p>
            <div className="mt-8">
              <Link
                href={`/${locale}/login`}
                className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
                {t("title")}
              </h1>
              <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
                {t("description")}
              </p>
              <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wide">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
                  placeholder={
                    locale === "ar"
                      ? "أدخلي بريدك الإلكتروني"
                      : "Enter your email"
                  }
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
              >
                {loading ? t("sending") : t("submit")}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/login`}
                className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
