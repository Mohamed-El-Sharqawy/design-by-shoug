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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const minSwipeDistance = 50;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % banners.length;
    goToSlide(nextIndex);
  }, [currentIndex, banners.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    goToSlide(prevIndex);
  }, [currentIndex, banners.length, goToSlide]);

  // Auto-play
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

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

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
  };

  // Mouse drag handlers for desktop swipe
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;

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
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    mouseStartX.current = null;
  };

  const getButtonText = (banner: Banner) => {
    return locale === "ar" ? banner.buttonTextAr : banner.buttonTextEn;
  };

  if (banners.length === 0) return null;

  return (
    <section
      className="relative w-full h-[calc(100dvh-88px)] overflow-hidden bg-[#FAF9F7] select-none touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* All banner images - eagerly loaded */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out select-none ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
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
            sizes="100vw"
            draggable={false}
          />
          <Image
            src={banner.imageUrl}
            alt={getButtonText(banner) || `Banner ${index + 1}`}
            fill
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
            className="object-cover object-center select-none pointer-events-none hidden xl:block"
            sizes="100vw"
            draggable={false}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

          {/* Banner content */}
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

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          {/* Previous arrow */}
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

          {/* Next arrow */}
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

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
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
