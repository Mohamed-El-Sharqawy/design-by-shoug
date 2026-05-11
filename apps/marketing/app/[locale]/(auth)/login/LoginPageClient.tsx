"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { trackLogin } from "@/lib/fb-helpers";

export function LoginPageClient({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { login, loading } = useAuth();
  const isRtl = locale === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(isRtl ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      trackLogin();
      router.push(`/${locale}/account`);
    } catch (err) {
      setError((err instanceof Error) ? err.message : (isRtl ? "فشل تسجيل الدخول" : "Login failed"));
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white flex items-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
            {t("loginTitle")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {t("loginDesc")}
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
              placeholder={locale === "ar" ? "أدخلي بريدك الإلكتروني" : "Enter your email"}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={locale === "ar" ? "أدخلي كلمة المرور" : "Enter your password"}
              dir="ltr"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
          >
            {loading ? t("loggingIn") : t("login")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#999] font-light">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-[#8B7355] hover:text-[#7A6348] transition-colors"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
