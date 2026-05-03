"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product, ProductVariant } from "@repo/types";
import { useCartItems, useAddToCart } from "@/lib/cart-hooks";
import { CartQuantityControl } from "@/components/CartQuantityControl";

interface QuickViewProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

function uniqueBy<T>(arr: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function QuickView({ product, open, onClose }: QuickViewProps) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const isRtl = locale === "ar";
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
  const bodySizes = useMemo(
    () =>
      uniqueBy(variants.map((v) => v.bodySize).filter(Boolean), (b) => b!.id)
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

  const bodySizeHasStock = useCallback(
    (sizeId: string, lengthId: string | null) =>
      variants.some(
        (v) =>
          v.bodySizeId === sizeId &&
          (!lengthId || v.abayaLengthId === lengthId) &&
          v.stock > 0
      ),
    [variants]
  );

  const colorHasStock = useCallback(
    (colorId: string, lengthId: string | null, sizeId: string | null) =>
      variants.some(
        (v) =>
          v.colorId === colorId &&
          (!lengthId || v.abayaLengthId === lengthId) &&
          (!sizeId || v.bodySizeId === sizeId) &&
          v.stock > 0
      ),
    [variants]
  );

  const [selectedLengthId, setSelectedLengthId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const firstAvailableLength = lengths.find((l) => lengthHasStock(l!.id));
      const newLengthId = firstAvailableLength?.id || lengths[0]?.id || null;

      const sizesForLength = bodySizes.filter((s) => bodySizeHasStock(s!.id, newLengthId));
      const newSizeId = sizesForLength[0]?.id || bodySizes[0]?.id || null;

      const colorsForSelection = colors.filter((c) => colorHasStock(c.id, newLengthId, newSizeId));
      const newColorId = colorsForSelection[0]?.id || colors[0]?.id || null;

      setSelectedLengthId(newLengthId);
      setSelectedSizeId(newSizeId);
      setSelectedColorId(newColorId);
      setAdded(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, lengths, bodySizes, colors, lengthHasStock, bodySizeHasStock, colorHasStock]);

  const handleSelectLength = (id: string) => {
    if (!lengthHasStock(id)) return;
    setSelectedLengthId(id);
    const sizesForLength = bodySizes.filter((s) => bodySizeHasStock(s!.id, id));
    setSelectedSizeId(sizesForLength[0]?.id || null);
    const colorsForSelection = colors.filter((c) =>
      colorHasStock(c.id, id, sizesForLength[0]?.id || null)
    );
    setSelectedColorId(colorsForSelection[0]?.id || null);
  };

  const handleSelectSize = (id: string) => {
    if (!bodySizeHasStock(id, selectedLengthId)) return;
    setSelectedSizeId(id);
    const colorsForSelection = colors.filter((c) =>
      colorHasStock(c.id, selectedLengthId, id)
    );
    setSelectedColorId(colorsForSelection[0]?.id || null);
  };

  const handleSelectColor = (id: string) => {
    if (!colorHasStock(id, selectedLengthId, selectedSizeId)) return;
    setSelectedColorId(id);
  };

  const selectedVariant: ProductVariant | undefined = variants.find((v) => {
    const lengthMatch = !selectedLengthId || v.abayaLengthId === selectedLengthId;
    const sizeMatch = !selectedSizeId || v.bodySizeId === selectedSizeId;
    const colorMatch = !colors.length || v.colorId === selectedColorId;
    return lengthMatch && sizeMatch && colorMatch;
  });

  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
  const name = isRtl ? product.nameAr : product.nameEn;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    addItem.mutate(
      {
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
        bodySizeLabelEn: selectedVariant.bodySize?.labelEn || "",
        bodySizeLabelAr: selectedVariant.bodySize?.labelAr || "",
        colorNameEn: selectedVariant.color?.nameEn || "",
        colorNameAr: selectedVariant.color?.nameAr || "",
        colorHex: selectedVariant.color?.hexCode || null,
        sku: selectedVariant.sku,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isInCart = selectedVariant ? cartItems.some((i) => i.variantId === selectedVariant.id) : false;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-80" onClick={onClose} />
      <div className="fixed inset-0 z-80 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 inset-e-4 z-10 w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] transition-colors bg-white/80 backdrop-blur-sm rounded-full"
            aria-label={t("close")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="relative aspect-3/4 sm:aspect-auto sm:min-h-[500px] bg-[#FAF9F7]">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#C4C4C4] text-sm">{t("noImage")}</span>
                </div>
              )}
              <div className="absolute top-4 inset-s-4 flex flex-col gap-2">
                {product.isNewArrival && (
                  <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[10px] tracking-widest uppercase">{t("new")}</span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 bg-[#8B7355] text-white text-[10px] tracking-widest uppercase">{t("sale")}</span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col">
              <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] tracking-wide leading-tight">{name}</h2>

              <div className="mt-3 flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-lg text-[#8B7355] font-light">{formatPrice(product.salePrice!)}</span>
                    <span className="text-sm text-[#999] line-through">{formatPrice(product.basePrice)}</span>
                  </>
                ) : (
                  <span className="text-lg text-[#1A1A1A] font-light">{formatPrice(product.basePrice)}</span>
                )}
                {selectedVariant && (
                  <span className={`text-xs ms-auto ${isOutOfStock ? "text-red-400" : "text-[#8B7355]"}`}>
                    {isOutOfStock ? t("outOfStock") : `${t("inStock")} (${selectedVariant.stock})`}
                  </span>
                )}
              </div>

              <div className="w-full h-px bg-[#E8E4DF] my-5" />

              {lengths.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">{t("length")}</p>
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

              {bodySizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">{t("bodySize")}</p>
                  <div className="flex flex-wrap gap-2">
                    {bodySizes.map((size) => {
                      const disabled = !bodySizeHasStock(size!.id, selectedLengthId);
                      return (
                        <button
                          key={size!.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSelectSize(size!.id)}
                          className={`min-w-12 px-3 py-2 text-xs tracking-wide border transition-all duration-200 ${
                            selectedSizeId === size!.id
                              ? disabled
                                ? "border-[#C4C4C4] bg-[#C4C4C4] text-white cursor-not-allowed"
                                : "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                              : disabled
                                ? "border-[#E8E4DF] text-[#C4C4C4] cursor-not-allowed line-through"
                                : "border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A]"
                          }`}
                        >
                          {isRtl ? size!.labelAr : size!.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2.5">{t("color")}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((color) => {
                      const disabled = !colorHasStock(color.id, selectedLengthId, selectedSizeId);
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
                          style={{ backgroundColor: color.hexCode || "#F5F3F0" }}
                          title={isRtl ? color.nameAr : color.nameEn}
                          aria-label={isRtl ? color.nameAr : color.nameEn}
                        >
                          {selectedColorId === color.id && (
                            <svg className="w-3.5 h-3.5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 space-y-3">
                {isInCart ? (
                  <CartQuantityControl variantId={selectedVariant!.id} />
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full py-3.5 text-xs tracking-widest uppercase font-light transition-all duration-300 ${
                      added
                        ? "bg-[#8B7355] text-white"
                        : isOutOfStock
                          ? "bg-[#E8E4DF] text-[#999] cursor-not-allowed"
                          : "bg-[#1A1A1A] text-white hover:bg-[#333]"
                    }`}
                  >
                    {added ? t("addedToCart") : t("addToCart")}
                  </button>
                )}

                {/* TODO: Implement Buy Now - navigate to /checkout with the selected variant */}
                <Link
                  href={`/${locale}/checkout`}
                  onClick={onClose}
                  className="block w-full py-3.5 text-center text-xs tracking-widest uppercase font-light border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
                >
                  {t("buyNow")}
                </Link>

                <Link
                  href={`/${locale}/products/${product.slug}`}
                  onClick={onClose}
                  className="block text-center text-xs tracking-wider text-[#8B7355] hover:text-[#7A6348] transition-colors font-light py-2"
                >
                  {t("viewDetails")} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
