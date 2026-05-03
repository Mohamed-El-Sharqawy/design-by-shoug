"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function ProfileTab({ locale }: { locale: string }) {
  const t = useTranslations("Account");
  const tc = useTranslations("ChangeEmail");
  const tv = useTranslations("VerifyEmail");
  const { user, requestEmailChange, verifyEmailChange, sendOtp } = useAuth();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!user) return null;

  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";

  const createdAt = (user as any).createdAt;
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", {
        year: "numeric",
        month: "long",
      })
    : "—";

  const handleSendCode = async () => {
    setLoading(true);
    setError("");
    try {
      await requestEmailChange(newEmail);
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      if (msg.includes("already your")) setError(tc("sameEmail"));
      else if (msg.includes("already registered")) setError(tc("emailTaken"));
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
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

  const handleConfirmChange = async () => {
    setLoading(true);
    setError("");
    try {
      await verifyEmailChange(otp.join(""));
      setSuccess(tc("changed"));
      setOtpSent(false);
      setShowChangeEmail(false);
      setNewEmail("");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      const msg = err instanceof Error ? err.message : "Failed";
      if (msg.includes("expired")) setError(tv("expiredCode"));
      else if (msg.includes("attempts")) setError(tv("tooManyAttempts"));
      else setError(tv("invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      await requestEmailChange(newEmail);
      setCooldown(60);
    } catch {
      setError(tv("expiredCode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-6">
        {t("profileInfo")}
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs tracking-wide">
          {success}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-start justify-between py-4 border-b border-[#E8E4DF]">
          <span className="text-xs tracking-widest uppercase text-[#8B7355]">{t("name")}</span>
          <span className="text-sm text-[#1A1A1A] font-light">{displayName}</span>
        </div>
        <div className="py-4 border-b border-[#E8E4DF]">
          <div className="flex items-start justify-between">
            <span className="text-xs tracking-widest uppercase text-[#8B7355]">{t("email")}</span>
            <div className="text-right">
              <span className="text-sm text-[#1A1A1A] font-light block" dir="ltr">{user.email}</span>
              {!user.emailVerified && (
                <Link
                  href={`/${locale}/verify-email?email=${encodeURIComponent(user.email)}`}
                  className="text-[10px] tracking-wide text-[#8B7355] hover:underline mt-1 inline-block"
                >
                  {tv("title")}
                </Link>
              )}
              {user.emailVerified && !showChangeEmail && (
                <button
                  onClick={() => setShowChangeEmail(true)}
                  className="text-[10px] tracking-wide text-[#8B7355] hover:underline mt-1 inline-block"
                >
                  {tc("title")}
                </button>
              )}
            </div>
          </div>

          {showChangeEmail && !otpSent && (
            <div className="mt-4 space-y-3">
              {error && <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setError(""); }}
                placeholder={tc("newEmail")}
                className="w-full px-3 py-2 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
                dir="ltr"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendCode}
                  disabled={loading || !newEmail}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] font-light"
                >
                  {loading ? tc("sending") : tc("sendCode")}
                </button>
                <button
                  onClick={() => { setShowChangeEmail(false); setError(""); setNewEmail(""); }}
                  className="px-4 py-2 text-xs tracking-widest uppercase text-[#999] hover:text-[#1A1A1A] font-light"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}

          {otpSent && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#999] font-light">{tc("codeSent", { email: user.email })}</p>
              {error && <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}
              <div className="flex gap-2" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className="w-10 h-10 text-center text-sm border border-[#E8E4DF] focus:outline-none focus:border-[#1A1A1A]"
                    dir="ltr"
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleConfirmChange}
                  disabled={loading || otp.some((d) => !d)}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] font-light"
                >
                  {loading ? tc("confirming") : tc("confirm")}
                </button>
                {cooldown > 0 ? (
                  <span className="text-xs text-[#999] font-light">{tv("resendIn", { seconds: cooldown })}</span>
                ) : (
                  <button onClick={handleResend} className="text-xs text-[#8B7355] hover:underline font-light">
                    {tv("resend")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between py-4 border-b border-[#E8E4DF]">
          <span className="text-xs tracking-widest uppercase text-[#8B7355]">{t("phone")}</span>
          <span className="text-sm text-[#1A1A1A] font-light" dir="ltr">{user.phone || "—"}</span>
        </div>
        <div className="flex items-start justify-between py-4 border-b border-[#E8E4DF]">
          <span className="text-xs tracking-widest uppercase text-[#8B7355]">{t("memberSince")}</span>
          <span className="text-sm text-[#1A1A1A] font-light">{memberSince}</span>
        </div>
      </div>
    </div>
  );
}
