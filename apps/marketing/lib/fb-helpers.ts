import type { Product } from "@repo/types";
import type { CartItemLocal } from "./cart-hooks";
import { trackEvent, trackCustomEvent } from "@/components/FacebookPixel";

export function getProductPrice(product: Product): number {
  return product.salePrice ?? product.basePrice;
}

export function getCartItemPrice(item: CartItemLocal): number {
  return (item.salePrice ?? item.basePrice) + (item.priceAdjustment ?? 0);
}

export function trackViewContentProduct(product: Product, locale: string) {
  trackEvent("ViewContent", {
    content_type: "product",
    content_ids: [product.id],
    content_name: locale === "ar" ? product.nameAr : product.nameEn,
    value: getProductPrice(product),
    currency: "AED",
  });
}

export function trackViewContentCollection(
  name: string,
  products: Product[],
) {
  trackEvent("ViewContent", {
    content_type: "product_group",
    content_name: name,
    content_ids: products.slice(0, 10).map((p) => p.id),
  });
}

export function trackAddToCart(
  product: Product,
  quantity: number,
  _priceAdjustment: number = 0,
) {
  const price = getProductPrice(product) + _priceAdjustment;
  trackEvent("AddToCart", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.nameEn,
    value: price * quantity,
    currency: "AED",
    num_items: quantity,
  });
}

export function trackAddToCartFromItem(item: CartItemLocal) {
  const price = getCartItemPrice(item);
  trackEvent("AddToCart", {
    content_type: "product",
    content_ids: [item.productId],
    content_name: item.nameEn,
    value: price * item.quantity,
    currency: "AED",
    num_items: item.quantity,
  });
}

export function trackInitiateCheckout(
  items: CartItemLocal[],
  subtotal: number,
) {
  trackEvent("InitiateCheckout", {
    content_type: "product",
    content_ids: items.map((i) => i.productId),
    value: subtotal,
    currency: "AED",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  });
}

export function trackInitiateCheckoutDirect(
  productId: string,
  price: number,
  quantity: number,
) {
  trackEvent("InitiateCheckout", {
    content_type: "product",
    content_ids: [productId],
    value: price * quantity,
    currency: "AED",
    num_items: quantity,
  });
}

export function trackPurchase(
  orderNumber: string,
  value: number,
  productIds: string[],
  numItems: number,
) {
  trackEvent("Purchase", {
    value,
    currency: "AED",
    content_type: "product",
    content_ids: productIds,
    content_name: `Order #${orderNumber}`,
    num_items: numItems,
    order_id: orderNumber,
  });
}

export function trackSearch(query: string, productIds: string[]) {
  trackEvent("Search", {
    search_string: query,
    content_type: "product",
    content_ids: productIds.slice(0, 10),
  });
}

export function trackCompleteRegistration(name: string) {
  trackEvent("CompleteRegistration", {
    status: "registered",
    content_name: name,
  });
}

export function trackLogin() {
  trackCustomEvent("Login", { method: "email" });
}

export function trackRemoveFromCart(item: CartItemLocal) {
  const price = getCartItemPrice(item);
  trackCustomEvent("RemoveFromCart", {
    content_type: "product",
    content_ids: [item.productId],
    content_name: item.nameEn,
    value: price * item.quantity,
    currency: "AED",
  });
}

export function trackLead(source: string) {
  trackEvent("Lead", {
    content_name: source,
  });
}

export function trackSubscribe() {
  trackEvent("Subscribe", {});
}
