"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQCard({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left group"
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

export function FAQ() {
  const t = useTranslations("Home");

  const faqs: FAQItem[] = [
    { question: t("faqShipping"), answer: t("faqShippingA") },
    { question: t("faqReturns"), answer: t("faqReturnsA") },
    { question: t("faqSizing"), answer: t("faqSizingA") },
    { question: t("faqCustom"), answer: t("faqCustomA") },
    { question: t("faqCare"), answer: t("faqCareA") },
    { question: t("faqMaterials"), answer: t("faqMaterialsA") },
    { question: t("faqGift"), answer: t("faqGiftA") },
    { question: t("faqAlterations"), answer: t("faqAlterationsA") },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-end mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t("faqTitle")}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355] ms-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {faqs.map((faq, i) => (
            <FAQCard key={i} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
