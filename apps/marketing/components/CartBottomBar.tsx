"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCartItems, useCartSubtotal, useCartCount } from "@/lib/cart-hooks";

export function CartBottomBar() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const itemCount = useCartCount();

  if (items.length === 0) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white border-t border-[#E8E4DF] shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-[#999] font-light">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </p>
          <p className="text-base text-[#1A1A1A] font-light">
            {formatPrice(subtotal)}
          </p>
        </div>
        <Link
          href={`/${locale}/checkout`}
          className="px-6 py-3 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
        >
          {t("checkout")}
        </Link>
      </div>
    </div>
  );
}
