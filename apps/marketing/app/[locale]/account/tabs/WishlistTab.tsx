"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useWishlist, useRemoveFromWishlist } from "@repo/api-client";

export function WishlistTab({ locale }: { locale: string }) {
  const t = useTranslations("Account");
  const isRtl = locale === "ar";
  const { data: items = [], isLoading: loading } = useWishlist();
  const removeMutation = useRemoveFromWishlist();

  const handleRemove = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-[#E8E4DF] rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-[#1A1A1A] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-[#E8E4DF] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <p className="text-sm text-[#1A1A1A] mb-2">{t("noWishlist")}</p>
        <p className="text-xs text-[#999] font-light mb-6">{t("noWishlistDesc")}</p>
        <Link
          href={`/${locale}/collections/all`}
          className="inline-block px-6 py-3 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
        >
          {t("startShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => {
        const p = item.product;
        const img = p.images?.[0];
        const name = isRtl ? p.nameAr : p.nameEn;
        const hasDiscount = p.salePrice != null && p.salePrice < p.basePrice;
        return (
          <div key={item.id} className="group">
            <div className="relative aspect-3/4 bg-[#FAF9F7] mb-3 overflow-hidden">
              <Link href={`/${locale}/products/${p.slug}`}>
                {img ? (
                  <Image src={img.url} alt={name} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-xs">IMG</div>
                )}
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                className="absolute top-2 inset-e-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={t("removeFromWishlist")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Link href={`/${locale}/products/${p.slug}`} className="block">
              <h3 className="text-sm text-[#1A1A1A] font-light tracking-wide line-clamp-2 mb-1">{name}</h3>
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-[#8B7355] font-light text-sm">{formatPrice(p.salePrice!)}</span>
                    <span className="text-[#999] line-through text-xs">{formatPrice(p.basePrice)}</span>
                  </>
                ) : (
                  <span className="text-[#1A1A1A] font-light text-sm">{formatPrice(p.basePrice)}</span>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
