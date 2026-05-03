"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";

export function VerifyEmailPageClient({ locale }: { locale: string }) {
  const t = useTranslations("VerifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, sendOtp, verifyEmail } = useAuth();
  const email = searchParams.get("email") || user?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!user || user.emailVerified) return;

    const storageKey = `dbs_otp_sent_${email}`;
    const lastSentAt = sessionStorage.getItem(storageKey);
    const now = Date.now();

    if (lastSentAt) {
      const elapsed = Math.floor((now - parseInt(lastSentAt, 10)) / 1000);
      const remaining = 60 - elapsed;
      if (remaining > 0) {
        setCooldown(remaining);
        return;
      }
    }

    sendOtp(email).catch(() => {});
    sessionStorage.setItem(storageKey, String(now));
    setCooldown(60);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length >= 4) {
      const digits = text.split("");
      setOtp(digits.concat(Array(6 - digits.length).fill("")));
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleVerify = useCallback(async (code: string) => {
    setVerifying(true);
    setError("");
    try {
      await verifyEmail(email, code);
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/account`), 2000);
    } catch (err) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      const msg = err instanceof Error ? err.message : "Verification failed";
      if (msg.includes("expired")) setError(t("expiredCode"));
      else if (msg.includes("attempts")) setError(t("tooManyAttempts"));
      else setError(t("invalidCode"));
    } finally {
      setVerifying(false);
    }
  }, [email, verifyEmail, router, locale, t]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    setError("");
    try {
      await sendOtp(email);
      sessionStorage.setItem(`dbs_otp_sent_${email}`, String(Date.now()));
      setCooldown(60);
    } catch {
      setError(t("expiredCode"));
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <section className="py-16 sm:py-24 bg-white flex items-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-[#999]">{t("backToAccount")}</p>
          <Link href={`/${locale}/login`} className="text-[#8B7355] text-sm mt-2 inline-block">
            Login
          </Link>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="py-16 sm:py-24 bg-white flex items-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide">{t("verified")}</h2>
          <p className="mt-2 text-sm text-[#999] font-light">{t("verifiedDesc")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white flex items-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {t("subtitle", { email })}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wide text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-3 mb-8" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={verifying}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-light border border-[#E8E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              dir="ltr"
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify(otp.join(""))}
          disabled={verifying || otp.some((d) => !d)}
          className="w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
        >
          {verifying ? t("verifying") : t("verify")}
        </button>

        <div className="mt-6 text-center">
          {cooldown > 0 ? (
            <p className="text-xs text-[#999] font-light">{t("resendIn", { seconds: cooldown })}</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light disabled:opacity-50"
            >
              {sending ? "..." : t("resend")}
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/account`}
            className="text-xs tracking-wide text-[#999] hover:text-[#1A1A1A] transition-colors font-light"
          >
            {t("backToAccount")}
          </Link>
        </div>
      </div>
    </section>
  );
}
