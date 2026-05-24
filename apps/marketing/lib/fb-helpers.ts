import type { Product } from "@repo/types";
import type { CartItemLocal } from "./cart-hooks";
import { trackEvent, trackCustomEvent } from "@/components/FacebookPixel";
import { trackServerEvent } from "./meta-capi-client";

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getProductPrice(product: Product): number {
  return product.salePrice ?? product.basePrice;
}

export function getCartItemPrice(item: CartItemLocal): number {
  return (item.salePrice ?? item.basePrice) + (item.priceAdjustment ?? 0);
}

export function trackViewContentProduct(product: Product, locale: string) {
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: [product.id],
    content_name: locale === "ar" ? product.nameAr : product.nameEn,
    value: getProductPrice(product),
    currency: "AED",
  };
  trackEvent("ViewContent", params, eventId);
  trackServerEvent("ViewContent", eventId, params);
}

export function trackViewContentCollection(
  name: string,
  products: Product[],
) {
  const eventId = uid();
  const params = {
    content_type: "product_group",
    content_name: name,
    content_ids: products.slice(0, 10).map((p) => p.id),
  };
  trackEvent("ViewContent", params, eventId);
  trackServerEvent("ViewContent", eventId, params);
}

export function trackAddToCart(
  product: Product,
  quantity: number,
  _priceAdjustment: number = 0,
) {
  const price = getProductPrice(product) + _priceAdjustment;
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.nameEn,
    value: price * quantity,
    currency: "AED",
    num_items: quantity,
  };
  trackEvent("AddToCart", params, eventId);
  trackServerEvent("AddToCart", eventId, params);
}

export function trackAddToCartFromItem(item: CartItemLocal) {
  const price = getCartItemPrice(item);
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: [item.productId],
    content_name: item.nameEn,
    value: price * item.quantity,
    currency: "AED",
    num_items: item.quantity,
  };
  trackEvent("AddToCart", params, eventId);
  trackServerEvent("AddToCart", eventId, params);
}

export function trackInitiateCheckout(
  items: CartItemLocal[],
  subtotal: number,
) {
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: items.map((i) => i.productId),
    value: subtotal,
    currency: "AED",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  };
  trackEvent("InitiateCheckout", params, eventId);
  trackServerEvent("InitiateCheckout", eventId, params);
}

export function trackInitiateCheckoutDirect(
  productId: string,
  price: number,
  quantity: number,
) {
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: [productId],
    value: price * quantity,
    currency: "AED",
    num_items: quantity,
  };
  trackEvent("InitiateCheckout", params, eventId);
  trackServerEvent("InitiateCheckout", eventId, params);
}

export function trackPurchase(
  orderNumber: string,
  value: number,
  productIds: string[],
  numItems: number,
  eventID?: string,
) {
  const eventId = eventID || uid();
  const params = {
    value,
    currency: "AED",
    content_type: "product",
    content_ids: productIds,
    content_name: `Order #${orderNumber}`,
    num_items: numItems,
    order_id: orderNumber,
  };
  trackEvent("Purchase", params, eventId);
  trackServerEvent("Purchase", eventId, params);
}

export function trackSearch(query: string, productIds: string[]) {
  const eventId = uid();
  const params = {
    search_string: query,
    content_type: "product",
    content_ids: productIds.slice(0, 10),
  };
  trackEvent("Search", params, eventId);
  trackServerEvent("Search", eventId, params);
}

export function trackCompleteRegistration(name: string, eventID?: string) {
  const eventId = eventID || uid();
  const params = {
    status: "registered",
    content_name: name,
  };
  trackEvent("CompleteRegistration", params, eventId);
}

export function trackLogin() {
  const eventId = uid();
  const params = { method: "email" };
  trackCustomEvent("Login", params, eventId);
  trackServerEvent("Login", eventId, params);
}

export function trackRemoveFromCart(item: CartItemLocal) {
  const price = getCartItemPrice(item);
  const eventId = uid();
  const params = {
    content_type: "product",
    content_ids: [item.productId],
    content_name: item.nameEn,
    value: price * item.quantity,
    currency: "AED",
  };
  trackCustomEvent("RemoveFromCart", params, eventId);
  trackServerEvent("RemoveFromCart", eventId, params);
}

export function trackLead(source: string, eventID?: string) {
  const eventId = eventID || uid();
  const params = { content_name: source };
  trackEvent("Lead", params, eventId);
}

export function trackSubscribe() {
  const eventId = uid();
  const params = {};
  trackEvent("Subscribe", params, eventId);
  trackServerEvent("Subscribe", eventId, params);
}
