"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { CustomerReview } from "@repo/types";

interface Translations {
  sectionTitle: string;
  reviewedProduct: string;
  viewProduct: string;
  collectedWithConsent: string;
  reviewerCustomer: string;
  reviewerModel: string;
  reviewerInfluencer: string;
}

interface CustomerReviewsCarouselProps {
  reviews: CustomerReview[];
  translations: Translations;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${cls} ${i < rating ? "text-[#8B7355]" : "text-[#E8E4DF]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number | string, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(Number(price));
}

function ReviewerTypeBadge({ type, t }: { type: string; t: Translations }) {
  const label =
    type === "MODEL" ? t.reviewerModel
    : type === "INFLUENCER" ? t.reviewerInfluencer
    : t.reviewerCustomer;
  return (
    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] tracking-widest uppercase rounded-full">
      {label}
    </span>
  );
}

function ReviewCard({
  review,
  locale,
  t,
  onOpen,
}: {
  review: CustomerReview;
  locale: string;
  t: Translations;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8E4DF] hover:shadow-md transition-shadow duration-300 text-left w-full"
    >
      <div className="relative aspect-9/16 bg-[#1A1A1A] overflow-hidden">
        {review.thumbnailUrl ? (
          <Image
            src={review.thumbnailUrl}
            alt={review.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#2A2A2A] to-[#1A1A1A]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-[#1A1A1A] ms-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </span>
        </div>
        <div className="absolute top-3 inset-e-3">
          <ReviewerTypeBadge type={review.type} t={t} />
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="font-light text-sm text-[#1A1A1A] tracking-wide">{review.name}</h4>
          <StarRating rating={review.rating} />
        </div>
        <p className="text-[11px] text-[#999] tracking-wide">
          {formatDate(review.reviewDate, locale)}
        </p>
      </div>
    </button>
  );
}

function ReviewModal({
  review,
  locale,
  t,
  onClose,
}: {
  review: CustomerReview;
  locale: string;
  t: Translations;
  onClose: () => void;
}) {
  const feedback = locale === "ar" ? review.feedbackAr : review.feedbackEn;
  const product = review.product;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl overflow-hidden shadow-2xl w-[95vw] max-w-4xl max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 inset-e-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8E4DF] flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full md:w-1/2 bg-[#1A1A1A] shrink-0">
          <video
            src={review.videoUrl}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-contain max-h-[40vh] md:max-h-[90vh]"
          />
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-serif text-xl text-[#1A1A1A] tracking-wide">{review.name}</h3>
              <ReviewerTypeBadge type={review.type} t={t} />
            </div>
            <StarRating rating={review.rating} size="md" />
            <p className="text-xs text-[#999] tracking-wide mt-2">
              {formatDate(review.reviewDate, locale)}
            </p>
          </div>

          {feedback && (
            <div>
              <p className="text-sm text-[#444] leading-relaxed italic">&ldquo;{feedback}&rdquo;</p>
            </div>
          )}

          {product && (
            <div className="border-t border-[#E8E4DF] pt-5">
              <p className="text-[10px] text-[#999] tracking-widest uppercase mb-3">{t.reviewedProduct}</p>
              <Link
                href={`/${locale}/products/${product.slug}`}
                className="flex items-center gap-4 group rounded-xl p-3 -mx-3 hover:bg-[#FAF9F7] transition-colors"
              >
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#FAF9F7] shrink-0">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={locale === "ar" ? product.nameAr : product.nameEn}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#E8E4DF]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-light text-sm text-[#1A1A1A] tracking-wide group-hover:text-[#8B7355] transition-colors line-clamp-1">
                    {locale === "ar" ? product.nameAr : product.nameEn}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {product.salePrice && Number(product.salePrice) < Number(product.basePrice) ? (
                      <>
                        <span className="text-sm text-[#8B7355]">{formatPrice(product.salePrice, locale)}</span>
                        <span className="text-xs text-[#999] line-through">{formatPrice(product.basePrice, locale)}</span>
                      </>
                    ) : (
                      <span className="text-sm text-[#1A1A1A]">{formatPrice(product.basePrice, locale)}</span>
                    )}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-[#999] group-hover:text-[#8B7355] transition-colors shrink-0 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          <div className="border-t border-[#E8E4DF] pt-4 mt-auto">
            <p className="text-[10px] text-[#BBB] tracking-wide leading-relaxed">
              {t.collectedWithConsent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviewsCarousel({ reviews, translations: t }: CustomerReviewsCarouselProps) {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [activeReview, setActiveReview] = useState<CustomerReview | null>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isRtl = locale === "ar";
    if (isRtl) {
      setCanScrollPrev(Math.round(el.scrollLeft) < 0);
      setCanScrollNext(Math.round(el.scrollLeft) > -(el.scrollWidth - el.clientWidth - 2));
    } else {
      setCanScrollPrev(el.scrollLeft > 2);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    }
  }, [locale]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scroll = useCallback(
    (dir: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth || 280;
      el.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
    },
    []
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t.sectionTitle}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="relative">
          {canScrollPrev && (
            <button
              onClick={() => scroll(-1)}
              className="absolute -inset-s-3 sm:-inset-s-5 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-[#E8E4DF] hover:bg-[#FAF9F7] transition-all duration-200"
              aria-label="Previous reviews"
            >
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canScrollNext && (
            <button
              onClick={() => scroll(1)}
              className="absolute -inset-e-3 sm:-inset-e-5 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-[#E8E4DF] hover:bg-[#FAF9F7] transition-all duration-200"
              aria-label="Next reviews"
            >
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="shrink-0 snap-start w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[calc(25%-1.125rem)]"
              >
                <ReviewCard
                  review={review}
                  locale={locale}
                  t={t}
                  onOpen={() => setActiveReview(review)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeReview && (
        <ReviewModal
          review={activeReview}
          locale={locale}
          t={t}
          onClose={() => setActiveReview(null)}
        />
      )}
    </section>
  );
}
