"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQCard({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#E8E4DF] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-start group"
      >
        <h3 className="font-light text-sm sm:text-base text-[#1A1A1A] tracking-wide leading-relaxed">
          {item.question}
        </h3>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full border border-[#E8E4DF] flex items-center justify-center transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          <svg className="w-3.5 h-3.5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            <div className="w-8 h-px bg-[#8B7355] mb-4" />
            <p className="text-sm text-[#666] leading-relaxed font-light">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPlaceholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-12">
      <h3 className="font-serif text-lg text-[#1A1A1A] tracking-wide mb-2">{title}</h3>
      <p className="text-sm text-[#999] font-light leading-relaxed mb-4">{desc}</p>
      <div className="aspect-video bg-[#FAF9F7] border border-[#E8E4DF] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-[#E8E4DF] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          <p className="text-xs text-[#C4C4C4] font-light">Video coming soon</p>
        </div>
      </div>
    </div>
  );
}

export function FAQPageClient({ locale }: { locale: string }) {
  const t = useTranslations("FAQPage");

  const sections = [
    {
      title: t("shipping"),
      items: [
        { question: t("shippingQ1"), answer: t("shippingA1") },
        { question: t("shippingQ2"), answer: t("shippingA2") },
        { question: t("shippingQ3"), answer: t("shippingA3") },
        { question: t("shippingQ4"), answer: t("shippingA4") },
      ],
      video: { title: t("shippingVideoTitle"), desc: t("shippingVideoDesc") },
    },
    {
      title: t("sizing"),
      items: [
        { question: t("sizingQ1"), answer: t("sizingA1") },
        { question: t("sizingQ2"), answer: t("sizingA2") },
        { question: t("sizingQ3"), answer: t("sizingA3") },
        { question: t("sizingQ4"), answer: t("sizingA4") },
      ],
      video: { title: t("sizingVideoTitle"), desc: t("sizingVideoDesc") },
    },
    {
      title: t("products"),
      items: [
        { question: t("productsQ1"), answer: t("productsA1") },
        { question: t("productsQ2"), answer: t("productsA2") },
        { question: t("productsQ3"), answer: t("productsA3") },
        { question: t("productsQ4"), answer: t("productsA4") },
      ],
    },
    {
      title: t("orders"),
      items: [
        { question: t("ordersQ1"), answer: t("ordersA1") },
        { question: t("ordersQ2"), answer: t("ordersA2") },
        { question: t("ordersQ3"), answer: t("ordersA3") },
        { question: t("ordersQ4"), answer: t("ordersA4") },
      ],
    },
    {
      title: t("returns"),
      items: [
        { question: t("returnsQ1"), answer: t("returnsA1") },
        { question: t("returnsQ2"), answer: t("returnsA2") },
        { question: t("returnsQ3"), answer: t("returnsA3") },
      ],
      video: { title: t("craftVideoTitle"), desc: t("craftVideoDesc") },
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-[#999] font-light tracking-wide max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="mb-8 p-4 bg-[#FAF9F7] border border-[#E8E4DF] flex items-center justify-between gap-4">
          <p className="text-sm text-[#555] font-light">{t("sizingQ1")}</p>
          <Link
            href={`/${locale}/size-guide`}
            className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light shrink-0"
          >
            {t("viewSizeGuide")} →
          </Link>
        </div>

        <div className="space-y-16">
          {sections.map((section, si) => (
            <div key={si}>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] tracking-wide mb-6">
                {section.title}
              </h2>
              <div className="space-y-3 mb-8">
                {section.items.map((item, i) => (
                  <FAQCard key={i} item={item} />
                ))}
              </div>
              {section.video && (
                <VideoPlaceholder title={section.video.title} desc={section.video.desc} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
          >
            ↑ {t("backToTop")}
          </button>
        </div>
      </div>
    </section>
  );
}
