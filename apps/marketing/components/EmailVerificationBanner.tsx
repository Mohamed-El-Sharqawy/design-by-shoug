"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function EmailVerificationBanner({ locale }: { locale: string }) {
  const t = useTranslations("EmailBanner");
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  return (
    <div className="bg-[#FFF8F0] border-b border-[#E8E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-[#8B7355] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-[#1A1A1A] font-light truncate">
            {t("message", { email: user.email })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${locale}/verify-email?email=${encodeURIComponent(user.email)}`}
            className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light underline underline-offset-2"
          >
            {t("verifyNow")}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#999] hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
