"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { Banner } from "@repo/types";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioning = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);

  const minSwipeDistance = 50;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      setCurrentIndex(index);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 500);
    },
    []
  );

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndexRef.current + 1) % banners.length;
    goToSlide(nextIndex);
  }, [banners.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndexRef.current - 1 + banners.length) % banners.length;
    goToSlide(prevIndex);
  }, [banners.length, goToSlide]);

  useEffect(() => {
    if (banners.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [banners.length, goToNext]);

  const pauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (banners.length <= 1) return;
    pauseAutoPlay();
    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, 5000);
  }, [banners.length, goToNext, pauseAutoPlay]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) {
      resumeAutoPlay();
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    resumeAutoPlay();
  }, [goToNext, goToPrev, resumeAutoPlay]);

  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) {
      resumeAutoPlay();
      return;
    }

    const distance = mouseStartX.current - e.clientX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    mouseStartX.current = null;
    isDragging.current = false;
    resumeAutoPlay();
  }, [goToNext, goToPrev, resumeAutoPlay]);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
    mouseStartX.current = null;
  }, []);

  const getButtonText = (banner: Banner) => {
    return locale === "ar" ? banner.buttonTextAr : banner.buttonTextEn;
  };

  if (banners.length === 0) return null;

  return (
    <section
      className="relative w-full h-[calc(100dvh-88px)] overflow-hidden bg-[#FAF9F7] select-none"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDragStart={(e) => e.preventDefault()}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out select-none ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          draggable={false}
        >
          <Image
            src={banner.imageMobileUrl || banner.imageUrl}
            alt={getButtonText(banner) || `Banner ${index + 1}`}
            fill
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
            className="object-cover object-center select-none pointer-events-none xl:hidden"
            sizes="(max-width: 1279px) 100vw, 1px"
            draggable={false}
          />
          <Image
            src={banner.imageUrl}
            alt={getButtonText(banner) || `Banner ${index + 1}`}
            fill
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
            className="object-cover object-center select-none pointer-events-none hidden xl:block"
            sizes="(max-width: 1279px) 1px, 100vw"
            draggable={false}
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

          {(getButtonText(banner) || banner.href) && (
            <div className="absolute inset-0 flex items-end justify-center pb-16 sm:pb-20 md:pb-24">
              {banner.href ? (
                <Link
                  href={banner.href}
                  className="px-8 py-3 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-sm tracking-widest uppercase font-light hover:bg-white transition-all duration-300 border border-[#E8E4DF]"
                >
                  {getButtonText(banner) || (locale === "ar" ? "تسوق الآن" : "Shop Now")}
                </Link>
              ) : getButtonText(banner) ? (
                <span className="px-8 py-3 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-sm tracking-widest uppercase font-light">
                  {getButtonText(banner)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 text-[#1A1A1A] border border-[#E8E4DF] group"
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 text-[#1A1A1A] border border-[#E8E4DF] group"
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
