"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useCartSubtotal, useCartCount, type CartItemLocal } from "@/lib/cart-hooks";

interface CartAddedPopupProps {
  item: CartItemLocal | null;
  open: boolean;
  onClose: () => void;
}

export function CartAddedPopup({ item, open, onClose }: CartAddedPopupProps) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const subtotal = useCartSubtotal();
  const itemCount = useCartCount();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !item) return null;

  const name = isRtl ? item.nameAr : item.nameEn;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-90" onClick={onClose} />
      <div className="fixed inset-0 z-90 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="relative bg-white w-full sm:max-w-md pointer-events-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs tracking-widest uppercase text-[#1A1A1A] font-light">{t("addedPopupTitle")}</span>
            </div>
            <button type="button" onClick={onClose} className="p-1 text-[#999] hover:text-[#1A1A1A] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 flex gap-4">
            <div className="relative w-16 h-20 shrink-0 bg-[#FAF9F7]">
              {item.image ? (
                <Image src={item.image} alt={name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-[8px]">IMG</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1A1A1A] font-light line-clamp-2">{name}</p>
              <p className="text-xs text-[#999] font-light mt-1">{t("subtotal")}: {formatPrice(subtotal)}</p>
              <p className="text-xs text-[#999] font-light">{itemCount} {itemCount === 1 ? t("item") : t("items")}</p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-2">
            <Link
              href={`/${locale}/cart`}
              onClick={onClose}
              className="block w-full py-3.5 bg-[#1A1A1A] text-white text-center text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
            >
              {t("viewCart")}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="block w-full py-3.5 border border-[#E8E4DF] text-[#1A1A1A] text-center text-xs tracking-widest uppercase font-light hover:border-[#1A1A1A] transition-colors"
            >
              {t("continueShopping")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
