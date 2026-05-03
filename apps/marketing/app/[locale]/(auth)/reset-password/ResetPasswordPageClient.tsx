"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

export function ResetPasswordPageClient({
  locale,
  token,
}: {
  locale: string;
  token: string;
}) {
  const t = useTranslations("ForgotPassword");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <section className="py-16 sm:py-24 bg-white flex items-center min-h-[60vh]">
        <div className="max-w-md mx-auto w-full px-4 sm:px-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-[#1A1A1A] tracking-wide">
            {t("invalidToken")}
          </h1>
          <div className="mt-8">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
            >
              {t("requestNew")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || json.error || "Reset failed");
      }
      setSuccess(true);
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

  if (success) {
    return (
      <section className="py-16 sm:py-24 bg-white flex items-center min-h-[60vh]">
        <div className="max-w-md mx-auto w-full px-4 sm:px-6 text-center">
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] tracking-wide">
            {t("resetSuccess")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {t("resetSuccessDesc")}
          </p>
          <div className="mt-8">
            <Link
              href={`/${locale}/login`}
              className="inline-block px-8 py-3 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white flex items-center min-h-[60vh]">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
            {t("resetTitle")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {t("resetDesc")}
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
              {t("newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={
                locale === "ar" ? "٨ أحرف على الأقل" : "Minimum 8 characters"
              }
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("confirmNewPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={
                locale === "ar"
                  ? "أعيدي إدخال كلمة المرور"
                  : "Re-enter your password"
              }
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
          >
            {loading ? t("resetting") : t("resetSubmit")}
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
      </div>
    </section>
  );
}
