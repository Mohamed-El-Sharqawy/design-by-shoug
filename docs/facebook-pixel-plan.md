# Facebook Pixel Integration Plan — Design By Shoug

Pixel ID: `1188988136586687`

---

## Current State

| Status | Detail |
|---|---|
| Pixel loaded | `components/FacebookPixel.tsx` — fires `PageView` on every route change |
| Phase 1 | **Done** — ViewContent (product + collection), AddToCart, InitiateCheckout, Purchase |
| Phase 2 | **Done** — Search |
| Phase 3 | **Done** — CompleteRegistration, Login |
| Phase 4 | **Done** — RemoveFromCart (cart page + quantity control) |
| Phase 5 | **Partial** — RemoveFromWishlist done; Lead/Subscribe blocked (no backend); AddToWishlist blocked (no UI) |

---

## Phase 1 — Core Commerce Events (Highest Impact)

These directly feed Facebook's ad optimization algorithm for purchases.

### 1.1 `ViewContent` — Product Page

- **File:** `app/[locale]/products/[slug]/ProductDetail.tsx`
- **Trigger:** Component mount (`useEffect` on first render)
- **Data:**
  ```
  content_type: "product"
  content_ids: [product.id]
  content_name: product.nameEn | product.nameAr
  value: salePrice ?? basePrice
  currency: "AED"
  ```
- **Implementation:** Add `useEffect(() => { trackEvent(...) }, [product.id])` at top of component

### 1.2 `ViewContent` — Collection Page

- **File:** `app/[locale]/collections/[slug]/CollectionProductBrowser.tsx`
- **Trigger:** Component mount
- **Data:**
  ```
  content_type: "product_group"
  content_name: collection name or "All Products" / "Featured"
  content_ids: [product.id, ...] (first 10 from initialProducts)
  ```

### 1.3 `AddToCart`

Three trigger points — extract a shared helper to avoid duplication:

| # | File | Handler | Notes |
|---|---|---|---|
| A | `components/QuickView.tsx:144` | `handleAddToCart` | Quantity = 1 |
| B | `app/[locale]/products/[slug]/ProductDetail.tsx:192` | `handleAddToCart` | Variable quantity |
| C | `components/CartQuantityControl.tsx:30` | `+` button | Increment (optional, low priority) |

- **Data:**
  ```
  content_type: "product"
  content_ids: [product.id]
  content_name: product.nameEn
  value: effectivePrice * quantity
  currency: "AED"
  num_items: quantity
  ```

### 1.4 `InitiateCheckout`

- **File:** `app/[locale]/checkout/CheckoutPageClient.tsx`
- **Trigger:** Component mount (checkout page loads)
- **Data:**
  ```
  content_type: "product"
  content_ids: [item.productId, ...]
  value: subtotal
  currency: "AED"
  num_items: total quantity across all items
  ```

### 1.5 `Purchase`

Two paths — both need the event:

| # | File | Trigger | Data available |
|---|---|---|---|
| A | `app/[locale]/checkout/CheckoutPageClient.tsx:230-264` | COD success (`setOrderResult`) | items, total, orderNumber |
| B | `app/[locale]/order/confirmation/OrderConfirmationClient.tsx:38-42` | Credit card return | orderNumber only — needs API call to get items/total |

- **Data:**
  ```
  value: total
  currency: "AED"
  content_type: "product"
  content_ids: [item.productId, ...]
  content_name: "Order #orderNumber"
  num_items: total quantity
  order_id: orderNumber
  ```

**Note:** For path B (credit card), the verification endpoint only returns `orderNumber` and `id`. Two options:
  1. Fetch full order from `GET /orders/:id` after verification and fire event with full data
  2. Fire a minimal event with just `value: 0` and `order_id` — less optimal for ad tuning

**Recommendation:** Option 1. Add a fetch to get order details, then fire the event.

---

## Phase 2 — Search & Navigation Events

### 2.1 `Search`

| # | File | Trigger | Priority |
|---|---|---|---|
| A | `app/[locale]/search/page.tsx:15` | Page load with `?q=...` | High |
| B | `components/HeaderClient.tsx:99` | Search input (debounced) | Medium |

- **Data:**
  ```
  search_string: query
  content_type: "product"
  content_ids: [product.id, ...] (result IDs)
  ```

- **Implementation A (recommended):** Fire on search results page mount — captures all searches including deep links
- **Implementation B (optional):** Fire from header drawer after debounce — captures searches that don't lead to full results page

---

## Phase 3 — User Account Events

### 3.1 `CompleteRegistration`

- **File:** `app/[locale]/(auth)/register/RegisterPageClient.tsx`
- **Trigger:** After successful `register()` call (line 43), before redirect
- **Data:**
  ```
  status: "registered"
  content_name: firstName + lastName
  ```

### 3.2 `Login` (custom event)

- **File:** `app/[locale]/(auth)/login/LoginPageClient.tsx`
- **Trigger:** After successful `login()` call (line 29), before redirect
- **Data:**
  ```
  method: "email"
  ```

---

## Phase 4 — Cart Interaction Events

### 4.1 `RemoveFromCart` (custom event)

| # | File | Trigger |
|---|---|---|
| A | `app/[locale]/cart/CartPageClient.tsx:199` | Remove button (X) |
| B | `components/CartQuantityControl.tsx:20` | Decrement to 0 |

- **Data:**
  ```
  content_type: "product"
  content_ids: [item.productId]
  content_name: item.nameEn
  value: effectivePrice * item.quantity
  currency: "AED"
  ```

---

## Phase 5 — Future Events (Blocked / Low Priority)

| Event | Blocker |
|---|---|
| `AddToWishlist` | No UI exists yet for adding to wishlist |
| `RemoveFromWishlist` | WishlistTab exists but low priority |
| `Lead` | Contact form has no backend |
| `Subscribe` | Newsletter form has no backend |
| `AddPaymentInfo` | No separate payment step with info entry — payment is handled externally |

These can be added when the underlying features are built.

---

## Implementation Strategy

### Shared helper

Create a helper that converts a `CartItemLocal` or `Product` into Facebook Pixel format:

```ts
// lib/fb-helpers.ts
export function productToFBItem(product: Product, locale: string) {
  return {
    id: product.id,
    name: locale === "ar" ? product.nameAr : product.nameEn,
    price: (product.salePrice ?? product.basePrice) / 100, // adjust if prices are in cents
  };
}

export function cartItemToFBItem(item: CartItemLocal) {
  const price = item.salePrice ?? item.basePrice;
  return {
    id: item.productId,
    variant_id: item.variantId,
    name: item.nameEn,
    price: price + (item.priceAdjustment ?? 0),
    quantity: item.quantity,
  };
}
```

### Tree-shaking note

The existing `FacebookPixel.tsx` already imports `next/script` and `next/navigation` — these are client-only. All event calls happen in `"use client"` components so no SSR issues.

### Testing checklist per event

For each event in Phase 1:
1. Open browser DevTools → Network tab → filter by `facebook`
2. Perform the action
3. Verify the `collect` request is sent with correct parameters
4. Verify in Meta Events Manager (https://business.facebook.com/events_manager) that the event appears with correct data
5. Test with Meta Pixel Helper Chrome extension

---

## File Change Summary

| Phase | Files to modify | Events |
|---|---|---|
| 1 | `ProductDetail.tsx`, `CollectionProductBrowser.tsx`, `QuickView.tsx`, `CheckoutPageClient.tsx`, `OrderConfirmationClient.tsx` + new `lib/fb-helpers.ts` | ViewContent, AddToCart, InitiateCheckout, Purchase |
| 2 | `search/page.tsx` | Search |
| 3 | `RegisterPageClient.tsx`, `LoginPageClient.tsx` | CompleteRegistration, Login |
| 4 | `CartPageClient.tsx`, `CartQuantityControl.tsx` | RemoveFromCart |

**Estimated scope:** ~8 files modified, 1 new file created, ~150 lines of tracking code total.
