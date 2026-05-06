"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@repo/types";
import { ProductCard } from "@/components/ProductCard";
import { CartAddedPopup } from "@/components/CartAddedPopup";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import { useCartItems, useAddToCart, type CartItemLocal } from "@/lib/cart-hooks";

function uniqueBy<T>(arr: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

interface ProductDetailProps {
  product: Product;
  locale: string;
  relatedProducts: Product[];
}

export function ProductDetail({ product, locale, relatedProducts }: ProductDetailProps) {
  const t = useTranslations("Product");
  const isRtl = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const addItem = useAddToCart();
  const cartItems = useCartItems();

  const variants = useMemo(
    () => product.variants?.filter((v) => v.isActive) || [],
    [product.variants]
  );

  const lengths = useMemo(
    () =>
      uniqueBy(variants.map((v) => v.abayaLength).filter(Boolean), (l) => l!.id)
        .sort((a, b) => a!.sortOrder - b!.sortOrder),
    [variants]
  );
  const colors = useMemo(
    () =>
      uniqueBy(
        variants.map((v) => v.color).filter((c): c is NonNullable<typeof c> => !!c),
        (c) => c.id
      ).sort((a, b) => a.sortOrder - b.sortOrder),
    [variants]
  );

  const lengthHasStock = useCallback(
    (lengthId: string) => variants.some((v) => v.abayaLengthId === lengthId && v.stock > 0),
    [variants]
  );

  const colorHasStock = useCallback(
    (colorId: string, lengthId: string | null) =>
      variants.some(
        (v) =>
          v.colorId === colorId &&
          (!lengthId || v.abayaLengthId === lengthId) &&
          v.stock > 0
      ),
    [variants]
  );

  const resolveInitial = useCallback(() => {
    const urlVariant = searchParams.get("variant");
    const urlQty = searchParams.get("qty");

    if (urlVariant) {
      const v = variants.find((v) => v.id === urlVariant && v.stock > 0);
      if (v) {
        return { lengthId: v.abayaLengthId, colorId: v.colorId, qty: urlQty ? parseInt(urlQty, 10) || 1 : 1 };
      }
    }

    const firstAvailableLength = lengths.find((l) => lengthHasStock(l!.id));
    const newLengthId = firstAvailableLength?.id || lengths[0]?.id || null;

    const colorsForSelection = colors.filter((c) => colorHasStock(c.id, newLengthId));
    const newColorId = colorsForSelection[0]?.id || colors[0]?.id || null;

    return { lengthId: newLengthId, colorId: newColorId, qty: urlQty ? parseInt(urlQty, 10) || 1 : 1 };
  }, [searchParams, variants, lengths, colors, lengthHasStock, colorHasStock]);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedLengthId, setSelectedLengthId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [popupItem, setPopupItem] = useState<CartItemLocal | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "sizeGuide">(
    "description"
  );
  const initialApplied = useRef(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    const init = resolveInitial();
    setSelectedLengthId(init.lengthId);
    setSelectedColorId(init.colorId);
    setQuantity(init.qty);
    initialApplied.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-initialize when product changes
  }, [product.id]);

  const pushUrl = useCallback(
    (variantId: string | null, qty: number) => {
      const params = new URLSearchParams();
      if (variantId) params.set("variant", variantId);
      if (qty > 1) params.set("qty", String(qty));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const handleSelectLength = (id: string) => {
    if (!lengthHasStock(id)) return;
    setSelectedLengthId(id);
    const colorsForSelection = colors.filter((c) =>
      colorHasStock(c.id, id)
    );
    const newColorId = colorsForSelection[0]?.id || null;
    setSelectedColorId(newColorId);
    const newVariant = variants.find((v) => v.abayaLengthId === id && (!colors.length || v.colorId === newColorId) && v.stock > 0);
    pushUrl(newVariant?.id || null, quantity);
  };

  const handleSelectColor = (id: string) => {
    if (!colorHasStock(id, selectedLengthId)) return;
    setSelectedColorId(id);
    const newVariant = variants.find((v) => v.abayaLengthId === selectedLengthId && v.colorId === id && v.stock > 0);
    pushUrl(newVariant?.id || null, quantity);
  };

  useEffect(() => {
    if (initialApplied.current) {
      const v = variants.find((v) => v.abayaLengthId === selectedLengthId && (!colors.length || v.colorId === selectedColorId));
      pushUrl(v?.id || null, quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only push URL when quantity changes; selection changes already push via handlers
  }, [quantity]);

  const images = product.images || [];
  const sizeGuideImages = product.sizeGuideImages || [];

  const selectedVariant: ProductVariant | undefined = variants.find((v) => {
    const lengthMatch =
      !selectedLengthId || v.abayaLengthId === selectedLengthId;
    const colorMatch = !colors.length || v.colorId === selectedColorId;
    return lengthMatch && colorMatch;
  });

  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
  const maxStock = selectedVariant?.stock ?? 0;

  const name = isRtl ? product.nameAr : product.nameEn;
  const description = isRtl ? product.descriptionAr : product.descriptionEn;
  const hasDiscount =
    product.salePrice && product.salePrice < product.basePrice;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const cartItem: CartItemLocal = {
      id: "",
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      image: primaryImage?.url || null,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      priceAdjustment: selectedVariant.priceAdjustment,
      abayaLengthLabelEn: selectedVariant.abayaLength?.labelEn || "",
      abayaLengthLabelAr: selectedVariant.abayaLength?.labelAr || "",
      colorNameEn: selectedVariant.color?.nameEn || "",
      colorNameAr: selectedVariant.color?.nameAr || "",
      colorHex: selectedVariant.color?.hexCode || null,
      sku: selectedVariant.sku,
      quantity,
    };
    addItem.mutate(cartItem, quantity);
    setPopupItem(cartItem);
    setPopupOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const isInCart = selectedVariant ? cartItems.some((i) => i.variantId === selectedVariant.id) : false;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white min-h-screen max-sm:pb-24">
      <CartAddedPopup item={popupItem} open={popupOpen} onClose={() => setPopupOpen(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href={`/${locale}/collections`}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light mb-8"
        >
          <svg
            className="w-3.5 h-3.5 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("backToCollections")}
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-3/4 overflow-hidden bg-[#FAF9F7] rounded-xl">
              {images[selectedImageIdx] ? (
                <Image
                  src={images[selectedImageIdx].url}
                  alt={name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#C4C4C4] text-sm">{t("noImage")}</span>
                </div>
              )}
              <div className="absolute top-4 inset-s-4 flex flex-col gap-2">
                {product.isNewArrival && (
                  <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[10px] tracking-widest uppercase">
                    {t("new")}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 bg-[#8B7355] text-white text-[10px] tracking-widest uppercase">
                    {t("sale")}
                  </span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      idx === selectedImageIdx
                        ? "border-[#1A1A1A]"
                        : "border-[#E8E4DF] hover:border-[#999]"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide leading-tight">
              {name}
            </h1>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-xl text-[#8B7355] font-light">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-sm text-[#999] line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                </>
              ) : (
                <span className="text-xl text-[#1A1A1A] font-light">
                  {formatPrice(product.basePrice)}
                </span>
              )}
              {selectedVariant && (
                <span
                  className={`text-xs ms-auto ${
                    isOutOfStock ? "text-red-400" : "text-[#8B7355]"
                  }`}
                >
                  {isOutOfStock
                    ? t("outOfStock")
                    : `${t("inStock")} (${selectedVariant.stock})`}
                </span>
              )}
            </div>

            {product.sku && (
              <p className="mt-2 text-xs text-[#999] tracking-wide">
                {t("sku")}: {product.sku}
              </p>
            )}

            <div className="w-full h-px bg-[#E8E4DF] my-6" />

            {lengths.length > 0 && (
              <div className="mb-5">
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">
                  {t("length")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {lengths.map((length) => {
                    const disabled = !lengthHasStock(length!.id);
                    return (
                      <button
                        key={length!.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelectLength(length!.id)}
                        className={`min-w-14 px-3 py-2 text-xs tracking-wide border transition-all duration-200 ${
                          selectedLengthId === length!.id
                            ? disabled
                              ? "border-[#C4C4C4] bg-[#C4C4C4] text-white cursor-not-allowed"
                              : "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                            : disabled
                              ? "border-[#E8E4DF] text-[#C4C4C4] cursor-not-allowed line-through"
                              : "border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A]"
                        }`}
                      >
                        {isRtl ? length!.labelAr : length!.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">
                  {t("color")}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => {
                    const disabled = !colorHasStock(color.id, selectedLengthId);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelectColor(color.id)}
                        className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedColorId === color.id
                            ? disabled
                              ? "border-[#C4C4C4] scale-110 cursor-not-allowed"
                              : "border-[#1A1A1A] scale-110"
                            : disabled
                              ? "border-[#E8E4DF] cursor-not-allowed opacity-40"
                              : "border-[#E8E4DF] hover:border-[#999]"
                        }`}
                        style={{
                          backgroundColor: color.hexCode || "#F5F3F0",
                        }}
                        title={isRtl ? color.nameAr : color.nameEn}
                        aria-label={isRtl ? color.nameAr : color.nameEn}
                      >
                        {selectedColorId === color.id && (
                          <svg
                            className="w-3.5 h-3.5 text-white drop-shadow-sm"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isInCart && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">
                  {t("quantity")}
                </p>
                <div className="inline-flex items-center border border-[#E8E4DF]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm border-x border-[#E8E4DF]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        maxStock > 0 ? Math.min(maxStock, q + 1) : q + 1
                      )
                    }
                    disabled={maxStock > 0 && quantity >= maxStock}
                    className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors disabled:text-[#C4C4C4] disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {isInCart ? (
                <div className="space-y-3">
                  <CartQuantityControl variantId={selectedVariant!.id} />
                  <Link
                    href={`/${locale}/cart`}
                    className="block w-full py-4 text-center text-xs tracking-widest uppercase font-light bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors"
                  >
                    {t("viewCart")}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-[#E8E4DF] text-[#999] cursor-not-allowed"
                      : "bg-[#1A1A1A] text-white hover:bg-[#333]"
                  }`}
                >
                  {t("addToCart")}
                </button>
              )}

              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  if (selectedVariant) p.set("variant", selectedVariant.id);
                  if (quantity > 1) p.set("qty", String(quantity));
                  const qs = p.toString();
                  return `/${locale}/checkout${qs ? `?${qs}` : ""}`;
                })()}
                className={`block w-full py-4 text-center text-xs tracking-widest uppercase font-light border transition-all duration-300 ${
                  !selectedVariant || isOutOfStock
                    ? "border-[#E8E4DF] text-[#C4C4C4] cursor-not-allowed pointer-events-none"
                    : "border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white"
                }`}
              >
                {t("buyNow")}
              </Link>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="mt-4 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
              {copied ? t("copied") : t("share")}
            </button>

            <div className="w-full h-px bg-[#E8E4DF] my-6" />

            <div className="flex gap-6 border-b border-[#E8E4DF]">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`pb-3 text-xs tracking-widest uppercase font-light transition-colors border-b-2 -mb-px ${
                  activeTab === "description"
                    ? "border-[#1A1A1A] text-[#1A1A1A]"
                    : "border-transparent text-[#999] hover:text-[#1A1A1A]"
                }`}
              >
                {t("description")}
              </button>
              {sizeGuideImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("sizeGuide")}
                  className={`pb-3 text-xs tracking-widest uppercase font-light transition-colors border-b-2 -mb-px ${
                    activeTab === "sizeGuide"
                      ? "border-[#1A1A1A] text-[#1A1A1A]"
                      : "border-transparent text-[#999] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("sizeGuide")}
                </button>
              )}
            </div>

            <div className="py-6">
              {activeTab === "description" && (
                <div
                  className="prose prose-sm max-w-none text-[#555] font-light leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: description || "",
                  }}
                />
              )}
              {activeTab === "sizeGuide" && sizeGuideImages.length > 0 && (
                <div className="space-y-4">
                  {sizeGuideImages.map((img) => (
                    <div key={img.id} className="relative w-full">
                      <Image
                        src={img.url}
                        alt={
                          isRtl ? img.titleAr || "" : img.titleEn || ""
                        }
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg"
                      />
                      {(img.titleEn || img.titleAr) && (
                        <p className="mt-2 text-xs text-[#999] tracking-wide">
                          {isRtl ? img.titleAr : img.titleEn}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-24">
            <div className="mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide text-center">
                {t("youMayAlsoLike")}
              </h2>
              <div className="mt-4 w-16 h-px bg-[#8B7355] mx-auto" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
