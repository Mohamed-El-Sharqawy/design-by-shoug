"use client";

import { useCartItems, useCartCount, useCartSubtotal, useUpdateCartQuantity, useRemoveCartItem, type CartItemLocal } from "@/lib/cart-hooks";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { trackRemoveFromCart } from "@/lib/fb-helpers";

interface CartPageClientProps {
  locale: string;
}

export function CartPageClient({ locale }: CartPageClientProps) {
  const t = useTranslations("Cart");
  const isRtl = locale === "ar";
  const items = useCartItems();
  const itemCount = useCartCount();
  const subtotal = useCartSubtotal();
  const updateQty = useUpdateCartQuantity();
  const remove = useRemoveCartItem();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  if (items.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg
            className="w-20 h-20 mx-auto text-[#E8E4DF] mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-[#999] font-light tracking-wide mb-8">
            {t("emptyDesc")}
          </p>
          <Link
            href={`/${locale}/collections/all`}
            className="inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-[#999] font-light tracking-wide">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <CartItemRow
                key={item.variantId}
                item={item}
                locale={locale}
                isRtl={isRtl}
                formatPrice={formatPrice}
                t={t}
                onUpdateQuantity={(v, q) => updateQty.mutate(v, q)}
                onRemove={(v) => {
                  const item = items.find((i) => i.variantId === v);
                  if (item) trackRemoveFromCart(item);
                  remove.mutate(v);
                }}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#FAF9F7] p-6 sm:p-8 sticky top-28">
              <h2 className="font-serif text-xl text-[#1A1A1A] tracking-wide mb-6">
                {t("subtotal")}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#999] font-light">{t("subtotal")}</span>
                  <span className="text-sm text-[#1A1A1A] font-light">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#999] font-light">{t("shipping")}</span>
                  <span className="text-sm text-[#8B7355] font-light">
                    {t("freeShipping")}
                  </span>
                </div>
                <div className="w-full h-px bg-[#E8E4DF]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#1A1A1A] tracking-wide uppercase">
                    {t("total")}
                  </span>
                  <span className="text-lg text-[#1A1A1A] font-light">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <Link
                href={`/${locale}/checkout`}
                className="block w-full py-4 bg-[#1A1A1A] text-white text-center text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
              >
                {t("checkout")}
              </Link>

              <Link
                href={`/${locale}/collections/all`}
                className="block text-center mt-4 text-xs tracking-wider text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
              >
                {t("continueShopping")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartItemRow({
  item,
  locale,
  isRtl,
  formatPrice,
  t,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItemLocal;
  locale: string;
  isRtl: boolean;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}) {
  const name = isRtl ? item.nameAr : item.nameEn;
  const hasDiscount = item.salePrice != null && +item.salePrice < +item.basePrice;
  const unitPrice = (hasDiscount ? +item.salePrice! : +item.basePrice) + +item.priceAdjustment;
  const lineTotal = unitPrice * item.quantity;

  const lengthLabel = isRtl ? item.abayaLengthLabelAr : item.abayaLengthLabelEn;

  const colorLabel = isRtl ? item.colorNameAr : item.colorNameEn;

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-[#E8E4DF]">
      <Link
        href={`/${locale}/products/${item.productSlug}`}
        className="relative w-24 h-32 sm:w-28 sm:h-36 shrink-0 bg-[#FAF9F7] overflow-hidden"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#C4C4C4] text-[10px]">No Image</span>
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${locale}/products/${item.productSlug}`}
            className="font-light text-sm sm:text-base text-[#1A1A1A] tracking-wide hover:text-[#8B7355] transition-colors line-clamp-2"
          >
            {name}
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.variantId)}
            className="shrink-0 p-1 text-[#999] hover:text-[#1A1A1A] transition-colors"
            aria-label={t("remove")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#999] font-light">
          {lengthLabel && (
            <span>{t("length")}: {lengthLabel}</span>
          )}

          {colorLabel && (
            <span className="flex items-center gap-1">
              {t("color")}:
              {item.colorHex && (
                <span
                  className="inline-block w-3 h-3 rounded-full border border-[#E8E4DF]"
                  style={{ backgroundColor: item.colorHex }}
                />
              )}
              {colorLabel}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-[#E8E4DF]">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors text-sm"
            >
              −
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-xs border-x border-[#E8E4DF]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors text-sm"
            >
              +
            </button>
          </div>
          <span className="text-sm text-[#1A1A1A] font-light">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
