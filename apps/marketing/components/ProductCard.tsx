"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Product } from "@repo/types";
import { QuickView } from "./QuickView";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("Product");
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <div className="group block">
        <div className="relative aspect-3/4 overflow-hidden bg-[#FAF9F7] mb-4 rounded-xl">
          <Link href={`/${locale}/products/${product.slug}`}>
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={name}
                fill
                fetchPriority="high"
                loading="eager"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[#E8E4DF] flex items-center justify-center">
                <span className="text-[#8B7355] text-sm">{t("noImage")}</span>
              </div>
            )}

            <div className="absolute top-3 inset-s-3 flex flex-col gap-2">
              {product.isNewArrival && (
                <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[10px] tracking-widest uppercase">{t("new")}</span>
              )}
              {hasDiscount && (
                <span className="px-3 py-1 bg-[#8B7355] text-white text-[10px] tracking-widest uppercase">{t("sale")}</span>
              )}
            </div>

            <div className="hidden sm:absolute sm:inset-0 sm:bg-black/0 sm:group-hover:bg-black/10 sm:transition-colors sm:duration-300 sm:flex sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
                className="px-6 py-2 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-white cursor-pointer"
              >
                {t("quickView")}
              </button>
            </div>
          </Link>

        </div>

        <Link href={`/${locale}/products/${product.slug}`} className="block text-center">
          <h3 className="font-light text-sm sm:text-base text-[#1A1A1A] tracking-wide mb-2 line-clamp-2">{name}</h3>
          <div className="flex items-center justify-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-[#8B7355] font-light">{formatPrice(product.salePrice!)}</span>
                <span className="text-[#999] line-through text-sm">{formatPrice(product.basePrice)}</span>
              </>
            ) : (
              <span className="text-[#1A1A1A] font-light">{formatPrice(product.basePrice)}</span>
            )}
          </div>
        </Link>
      </div>

      <QuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
