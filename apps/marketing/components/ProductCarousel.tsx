"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Product } from "@repo/types";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  products: Product[];
  locale: string;
}

const DRAG_THRESHOLD = 5;

export function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const didDrag = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products, checkScroll]);

  const startX = useRef(0);
  const scrollStart = useRef(0);
  const pointerDown = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='button']")) {
      didDrag.current = false;
      return;
    }
    startX.current = e.clientX;
    scrollStart.current = scrollRef.current?.scrollLeft || 0;
    pointerDown.current = true;
    didDrag.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) didDrag.current = true;
    const el = scrollRef.current;
    if (el) el.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = () => {
    pointerDown.current = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  const scrollByCard = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > div");
    const gap = 32;
    const cardWidth = card ? card.offsetWidth + gap : el.clientWidth / 2;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scroll-smooth pl-1 pr-1 py-2 select-none cursor-grab"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollByCard("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-[#E8E4DF] flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByCard("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-[#E8E4DF] flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
