"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function RegisterPageClient({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { register, loading } = useAuth();
  const isRtl = locale === "ar";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(isRtl ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }

    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
      });
      router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || (isRtl ? "فشل إنشاء الحساب" : "Registration failed"));
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white min-h-screen flex items-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
            {t("registerTitle")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {t("registerDesc")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wide">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
                {t("firstName")}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
                {t("lastName")}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("email")} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={isRtl ? "أدخلي بريدك الإلكتروني" : "Enter your email"}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("phone")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={isRtl ? "أدخلي رقم الهاتف" : "Enter your phone number"}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("password")} *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={isRtl ? "٨ أحرف على الأقل" : "Minimum 8 characters"}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              {t("confirmPassword")} *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E4DF] text-sm text-[#1A1A1A] font-light tracking-wide focus:outline-none focus:border-[#1A1A1A] transition-colors bg-white"
              placeholder={isRtl ? "أعيدي إدخال كلمة المرور" : "Re-enter your password"}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
          >
            {loading ? t("registering") : t("register")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#999] font-light">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-[#8B7355] hover:text-[#7A6348] transition-colors"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
