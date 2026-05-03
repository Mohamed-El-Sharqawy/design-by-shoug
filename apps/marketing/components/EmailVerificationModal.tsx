"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useCallback, useRef } from "react";

interface EmailVerificationModalProps {
  locale: string;
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function EmailVerificationModal({
  locale,
  open,
  onClose,
  onVerified,
}: EmailVerificationModalProps) {
  const t = useTranslations("VerifyEmail");
  const { user, sendOtp, verifyEmail } = useAuth();
  const email = user?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open || !user || user.emailVerified || !email) return;

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
  }, [open]);

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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) handleVerify(newOtp.join(""));
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

  const handleVerify = useCallback(
    async (code: string) => {
      setVerifying(true);
      setError("");
      try {
        await verifyEmail(email, code);
        setSuccess(true);
        setTimeout(() => {
          onVerified?.();
          onClose();
          setSuccess(false);
          setOtp(["", "", "", "", "", ""]);
        }, 1500);
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
    },
    [email, verifyEmail, onClose, onVerified, t]
  );

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      await sendOtp(email);
      sessionStorage.setItem(`dbs_otp_sent_${email}`, String(Date.now()));
      setCooldown(60);
    } catch {
      setError(t("expiredCode"));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white max-w-sm w-full mx-4 p-6 sm:p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#999] hover:text-[#1A1A1A] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-serif text-lg text-[#1A1A1A]">{t("verified")}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="font-serif text-xl text-[#1A1A1A] tracking-wide">{t("title")}</h2>
              <p className="mt-2 text-xs text-[#999] font-light">{t("subtitle", { email })}</p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wide text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2 mb-6" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={verifying}
                  className="w-11 h-12 text-center text-lg font-light border border-[#E8E4DF] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  dir="ltr"
                />
              ))}
            </div>

            <button
              onClick={() => handleVerify(otp.join(""))}
              disabled={verifying || otp.some((d) => !d)}
              className="w-full py-3 text-xs tracking-widest uppercase font-light transition-all duration-300 bg-[#1A1A1A] text-white hover:bg-[#333] disabled:bg-[#E8E4DF] disabled:text-[#999] disabled:cursor-not-allowed"
            >
              {verifying ? t("verifying") : t("verify")}
            </button>

            <div className="mt-4 text-center">
              {cooldown > 0 ? (
                <p className="text-xs text-[#999] font-light">{t("resendIn", { seconds: cooldown })}</p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
                >
                  {t("resend")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
