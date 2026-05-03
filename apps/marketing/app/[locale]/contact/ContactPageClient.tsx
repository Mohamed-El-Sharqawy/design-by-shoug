"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function ContactPageClient({ locale }: { locale: string }) {
  const t = useTranslations("Contact");
  const isRtl = locale === "ar";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <section className="py-16 sm:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-[#999] font-light tracking-wide">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FAF9F7] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("emailTitle")}</h3>
                  <a href="mailto:hello@designbyshoug.com" className="text-sm text-[#1A1A1A] font-light hover:text-[#8B7355] transition-colors" dir="ltr">
                    hello@designbyshoug.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FAF9F7] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("phoneTitle")}</h3>
                  <a href="tel:+971501234567" className="text-sm text-[#1A1A1A] font-light hover:text-[#8B7355] transition-colors" dir="ltr">
                    +971 50 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FAF9F7] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("locationTitle")}</h3>
                  <p className="text-sm text-[#1A1A1A] font-light">{t("locationValue")}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-2">{t("sent")}</h3>
                <p className="text-sm text-[#999] font-light mb-6">{t("sentDesc")}</p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
                >
                  {t("sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-6">{t("formTitle")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input
                      required
                      type="text"
                      placeholder={t("namePlaceholder")}
                      className="w-full px-4 py-3 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      required
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      className="w-full px-4 py-3 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
                <input
                  required
                  type="text"
                  placeholder={t("subjectPlaceholder")}
                  className="w-full px-4 py-3 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
                <textarea
                  required
                  rows={6}
                  placeholder={t("messagePlaceholder")}
                  className="w-full px-4 py-3 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors disabled:opacity-60"
                >
                  {sending ? t("sending") : t("send")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
