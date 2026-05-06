export interface CartItemLocal {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  nameEn: string;
  nameAr: string;
  image: string | null;
  basePrice: number;
  salePrice: number | null;
  priceAdjustment: number;
  abayaLengthLabelEn: string;
  abayaLengthLabelAr: string;
  colorNameEn: string;
  colorNameAr: string;
  colorHex: string | null;
  sku: string;
  quantity: number;
}

interface CartItemServer {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    priceAdjustment: number;
    abayaLength: { labelEn: string; labelAr: string } | null;
    color: { nameEn: string; nameAr: string; hexCode: string | null } | null;
    product: {
      id: string;
      slug: string;
      nameEn: string;
      nameAr: string;
      basePrice: number;
      salePrice: number | null;
      images: { url: string; isPrimary: boolean }[];
    };
  };
  unitPrice: number;
  totalPrice: number;
}

export function transformCartItem(item: CartItemServer): CartItemLocal {
  const p = item.variant.product;
  const primaryImage =
    p.images?.find((img) => img.isPrimary) || p.images?.[0];
  return {
    id: item.id,
    variantId: item.variantId,
    productId: p.id,
    productSlug: p.slug,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    image: primaryImage?.url || null,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    priceAdjustment: Number(item.variant.priceAdjustment),
    abayaLengthLabelEn: item.variant.abayaLength?.labelEn || "",
    abayaLengthLabelAr: item.variant.abayaLength?.labelAr || "",
    colorNameEn: item.variant.color?.nameEn || "",
    colorNameAr: item.variant.color?.nameAr || "",
    colorHex: item.variant.color?.hexCode || null,
    sku: item.variant.sku,
    quantity: item.quantity,
  };
}

export function transformCartResponse(json: any): CartItemLocal[] {
  const items = json?.success !== undefined ? json.data?.items : json?.items;
  if (items) {
    return items.map(transformCartItem);
  }
  return [];
}
