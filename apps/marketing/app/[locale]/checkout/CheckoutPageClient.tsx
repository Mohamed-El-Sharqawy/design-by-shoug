"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCartItems, useCartSubtotal, useClearCart, type CartItemLocal } from "@/lib/cart-hooks";
import { useAuth } from "@/lib/auth";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import {
  trackInitiateCheckout,
  trackInitiateCheckoutDirect,
  trackPurchase,
} from "@/lib/fb-helpers";
import { getFbp, getFbc } from "@/lib/meta-cookies";
import { fetchShippingCities, type ShippingCity, UAE_CITIES_FALLBACK } from "@/lib/uae-cities";
import {
  useAddresses,
  useCreateAddress,
  useCalculateShipping,
  useValidateCoupon,
  useProductVariant,
} from "@repo/api-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

interface DirectItem {
  variantId: string;
  productId: string;
  productSlug: string;
  nameEn: string;
  nameAr: string;
  image: string | null;
  basePrice: number;
  salePrice: number | null;
  priceAdjustment: number;
  unitPrice: number;
  quantity: number;
  variantLabel: string;
}

type Step = "address" | "review";

const STORAGE_KEY = "dbs_checkout";
const INIT_CHECKOUT_KEY = "dbs_init_checkout_sent";

function loadCheckoutState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCheckoutState(state: Record<string, unknown>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function clearCheckoutState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(INIT_CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

const emptyAddress = {
  label: "",
  fullName: "",
  phone: "",
  country: "United Arab Emirates",
  city: "",
  district: "",
  street: "",
  building: "",
  apartment: "",
  postalCode: "",
};

export function CheckoutPageClient({ locale }: { locale: string }) {
  const t = useTranslations("Checkout");
  const isRtl = locale === "ar";
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const cartItems = useCartItems();
  const cartSubtotal = useCartSubtotal();
  const clearCart = useClearCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const addressFormRef = useRef<HTMLFormElement>(null);

  const buyNowVariantId = searchParams.get("variant");
  const buyNowQty = searchParams.get("qty") ? parseInt(searchParams.get("qty")!) : 1;
  const isBuyNow = !!buyNowVariantId;
  const urlOrderId = searchParams.get("order_id");

  const isGuest = !token;
  const saved = loadCheckoutState();
  const [step, setStep] = useState<Step>((saved?.step as Step) || "address");
  const { data: addresses = [] } = useAddresses({ enabled: !!token });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(saved?.selectedAddressId || null);
  const [showNewAddress, setShowNewAddress] = useState(isGuest);
  const [newAddress, setNewAddress] = useState<typeof emptyAddress>((saved?.newAddress as typeof emptyAddress) || emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "CREDIT_CARD">((saved?.paymentMethod as "CASH_ON_DELIVERY" | "CREDIT_CARD") || "CASH_ON_DELIVERY");
  const [guestEmail, setGuestEmail] = useState((saved?.guestEmail as string) || "");
  const [couponCode, setCouponCode] = useState((saved?.couponCode as string) || "");
  const [discount, setDiscount] = useState((saved?.discount as number) || 0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [notes, setNotes] = useState((saved?.notes as string) || "");
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; orderId: string } | null>(
    (() => {
      if (!urlOrderId) return null;
      try {
        const raw = sessionStorage.getItem("dbs_order_result");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.orderId === urlOrderId) return parsed;
        }
      } catch { /* ignore */ }
      return null;
    })(),
  );
  const [shippingCities, setShippingCities] = useState<ShippingCity[]>([]);
  const variantQuery = useProductVariant(isBuyNow ? buyNowVariantId : null);
  const directLoading = isBuyNow ? variantQuery.isLoading : false;
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    saveCheckoutState({
      step,
      newAddress,
      paymentMethod,
      guestEmail,
      couponCode,
      discount,
      selectedAddressId,
      notes,
    });
  }, [step, newAddress, paymentMethod, guestEmail, couponCode, discount, selectedAddressId, notes]);

  useEffect(() => {
    const contentKey = isBuyNow
      ? `direct_${buyNowVariantId}_${buyNowQty}`
      : `cart_${items.map((i) => `${i.variantId}_${i.quantity}`).join("|")}`;

    try {
      const stored = sessionStorage.getItem(INIT_CHECKOUT_KEY);
      if (stored === contentKey) return;
    } catch {
      /* ignore */
    }

    if (isBuyNow && directItem) {
      trackInitiateCheckoutDirect(directItem.productId, directItem.unitPrice, directItem.quantity);
    } else if (!isBuyNow && items.length > 0) {
      trackInitiateCheckout(items, cartSubtotal);
    }

    try {
      sessionStorage.setItem(INIT_CHECKOUT_KEY, contentKey);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchShippingCities().then(setShippingCities);
  }, []);

  const guestAddressReady = isGuest
    ? !!(newAddress.fullName && newAddress.phone && newAddress.country && newAddress.city && newAddress.street)
    : false;

  // Map variant query data to DirectItem
  const directItem: DirectItem | null = (() => {
    if (!isBuyNow || !variantQuery.data) return null;
    const v = variantQuery.data;
    const basePrice = +(v.product.salePrice || v.product.basePrice);
    const priceAdjustment = +(v.priceAdjustment || 0);
    const unitPrice = basePrice + priceAdjustment;
    const primaryImage = v.product.images?.find((img) => img.isPrimary) || v.product.images?.[0];
    const parts = [
      v.abayaLength?.labelEn,
      v.color ? v.color.nameEn : null,
    ].filter(Boolean).join(" / ");
    return {
      variantId: v.id,
      productId: v.product.id,
      productSlug: v.product.slug,
      nameEn: v.product.nameEn,
      nameAr: v.product.nameAr,
      image: primaryImage?.url || null,
      basePrice: +v.product.basePrice,
      salePrice: v.product.salePrice ? +v.product.salePrice : null,
      priceAdjustment,
      unitPrice,
      quantity: buyNowQty,
      variantLabel: parts,
    };
  })();

  const items: CartItemLocal[] = isBuyNow ? [] : cartItems;
  const subtotal = isBuyNow
    ? (directItem ? directItem.unitPrice * directItem.quantity : 0)
    : cartSubtotal;

  const validateCoupon = useValidateCoupon();
  const calculateShipping = useCalculateShipping();

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;

  const activeCity = selectedAddress?.city || newAddress.city || "";

  useEffect(() => {
    if (!activeCity) {
      setShippingCost(null);
      return;
    }
    let cancelled = false;
    calculateShipping.mutateAsync(
      { city: activeCity, orderAmount: subtotal - discount },
    ).then((result) => {
      if (!cancelled && result) {
        setShippingCost(result.cost ?? result.shippingCost ?? null);
      }
    }).catch(() => {
      if (!cancelled) setShippingCost(null);
    });
    return () => { cancelled = true; };
  }, [activeCity, subtotal, discount]);

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess(false);
    try {
      const result = await validateCoupon.mutateAsync({ code: couponCode, orderAmount: subtotal });
      if (result.valid) {
        setDiscount(result.discount ?? 0);
        setCouponSuccess(true);
      } else {
        setDiscount(0);
        setCouponError(result.message || t("couponInvalid"));
      }
    } catch {
      setDiscount(0);
      setCouponError(t("couponInvalid"));
    }
  };

  const createAddress = useCreateAddress();

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      setStep("review");
      return;
    }
    createAddress.mutate(
      { ...newAddress, isDefault: addresses.length === 0 },
      {
        onSuccess: (data) => {
          setSelectedAddressId(data.id);
          setShowNewAddress(false);
          setNewAddress(emptyAddress);
        },
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !guestAddressReady) return;

    if (user && !user.emailVerified) {
      setShowVerifyModal(true);
      return;
    }

    const addressPayload = isGuest
      ? {
        address: {
          fullName: newAddress.fullName,
          phone: `+971${newAddress.phone}`,
          country: newAddress.country,
          city: newAddress.city,
          district: newAddress.district || undefined,
          street: newAddress.street,
          building: newAddress.building || undefined,
          apartment: newAddress.apartment || undefined,
          postalCode: newAddress.postalCode || undefined,
        },
        email: guestEmail || undefined,
      }
      : { addressId: selectedAddress!.id };

    setPlacing(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const metaCookies = { fbp: getFbp(), fbc: getFbc() };

      if (isBuyNow && directItem) {
        const res = await fetch(`${API_URL}/orders/direct`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            variantId: directItem.variantId,
            quantity: directItem.quantity,
            ...addressPayload,
            paymentMethod,
            notesCustomer: notes || undefined,
            couponCode: couponCode || undefined,
            locale,
            ...metaCookies,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.order) {
          if (json.data.checkoutUrl) {
            window.location.href = json.data.checkoutUrl;
            return;
          }
          const eventId = `order_${json.data.order.id}`;
          trackPurchase(
            json.data.order.orderNumber,
            total,
            [directItem.productId],
            directItem.quantity,
            eventId,
          );
          clearCheckoutState();
          const result = {
            orderNumber: json.data.order.orderNumber,
            orderId: json.data.order.id,
          };
          sessionStorage.setItem("dbs_order_result", JSON.stringify(result));
          router.replace(`${pathname}?order_id=${json.data.order.id}`, { scroll: false });
          setOrderResult(result);
        } else {
          const msg = json.data?.message || json.message || "Order failed";
          setCouponError(msg);
        }
      } else {
        const guestItems = isGuest
          ? { items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) }
          : {};
        const res = await fetch(`${API_URL}/orders/`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...addressPayload,
            ...guestItems,
            paymentMethod,
            notesCustomer: notes || undefined,
            couponCode: couponCode || undefined,
            locale,
            ...metaCookies,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.order) {
          if (json.data.checkoutUrl) {
            clearCart.mutate();
            window.location.href = json.data.checkoutUrl;
            return;
          }
          const eventId = `order_${json.data.order.id}`;
          trackPurchase(
            json.data.order.orderNumber,
            total,
            items.map((i) => i.productId),
            items.reduce((s, i) => s + i.quantity, 0),
            eventId,
          );
          clearCart.mutate();
          clearCheckoutState();
          const result = {
            orderNumber: json.data.order.orderNumber,
            orderId: json.data.order.id,
          };
          sessionStorage.setItem("dbs_order_result", JSON.stringify(result));
          router.replace(`${pathname}?order_id=${json.data.order.id}`, { scroll: false });
          setOrderResult(result);
        } else {
          const msg = json.data?.message || json.message || "Order failed";
          setCouponError(msg);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setPlacing(false);
    }
  };

  const isEmpty = isBuyNow ? !directItem : items.length === 0;

  if (directLoading) {
    return (
      <section className="bg-white min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-[#E8E4DF] border-t-[#8B7355] rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (isEmpty && !orderResult) {
    return (
      <section className="bg-white min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-[#999] font-light mb-8">{t("cartEmptyDesc")}</p>
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

  if (orderResult) {
    return (
      <section className="bg-white min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-3">
            {t("orderPlaced")}
          </h1>
          <p className="text-sm text-[#999] font-light mb-2">{t("orderPlacedDesc")}</p>
          <p className="text-sm text-[#1A1A1A] font-light mb-2">
            {t("orderNumber")}: <span className="font-medium">#{orderResult.orderNumber}</span>
          </p>
          <div className="my-6 pt-4 border-t border-[#E8E4DF]">
            <p className="text-xs text-[#999] font-light mb-1">
              {locale === "ar" ? "لم تتلقى البريد الإلكتروني؟ تحقق من البريد المزعج أو" : "Didn't receive the email? Check your spam folder or"}
              {" "}
              <a href="mailto:ddesignbyshoug@gmail.com" className="text-[#8B7355] hover:underline">ddesignbyshoug@gmail.com</a>
            </p>
            <p className="text-xs text-[#999] font-light">
              {locale === "ar" ? "للدعم والشكاوى:" : "Support & complaints:"}
              {" "}
              <a href="https://wa.me/971507397759" className="text-[#8B7355] hover:underline" dir="ltr">+971 50 739 7759</a>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {token && (
              <Link
                href={`/${locale}/account`}
                className="inline-block px-6 py-3 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
              >
                {t("viewOrders")}
              </Link>
            )}
            <Link
              href={`/${locale}/collections/all`}
              className="inline-block px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const total = subtotal - discount + (shippingCost ?? 0);

  return (
    <>
      <section className="py-16 sm:py-20 bg-white min-h-[60vh] md:min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            {!isBuyNow && (
              <Link
                href={`/${locale}/cart`}
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light mb-4"
              >
                <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t("backToCart")}
              </Link>
            )}
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide">
              {t("title")}
            </h1>
            <div className="mt-4 w-16 h-px bg-[#8B7355]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-2">
              <StepIndicator step={step} setStep={setStep} t={t} />

              {step === "address" && (
                <div>
                  <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-6">{t("shippingAddress")}</h2>

                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${selectedAddressId === addr.id
                            ? "border-[#1A1A1A] bg-[#FAF9F7]"
                            : "border-[#E8E4DF] hover:border-[#999]"
                            }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 w-4 h-4 accent-[#1A1A1A] shrink-0"
                          />
                          <div className="flex-1">
                            {addr.label && (
                              <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{addr.label}</p>
                            )}
                            <p className="text-sm text-[#1A1A1A] font-light">{addr.fullName}</p>
                            <p className="text-xs text-[#999] font-light mt-0.5" dir="ltr">{addr.phone}</p>
                            <p className="text-sm text-[#555] font-light mt-1">
                              {addr.street}{addr.building ? `, ${addr.building}` : ""}{addr.apartment ? `, ${addr.apartment}` : ""}
                              {addr.district ? `, ${addr.district}` : ""}, {addr.city}, {addr.country}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(!showNewAddress)}
                      className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light mb-4"
                    >
                      + {t("addNewAddress")}
                    </button>
                  )}

                  {showNewAddress && (
                    <form ref={addressFormRef} onSubmit={handleAddAddress} className="p-6 border border-[#E8E4DF] bg-[#FAF9F7] mb-6">
                      <h3 className="text-sm tracking-widest uppercase text-[#1A1A1A] mb-4">{t("newAddress")}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("fullName")} *</label>
                          <input required value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("phone")} *</label>
                          <div className="flex" dir="ltr">
                            <span className="inline-flex items-center px-3 py-2.5 border border-e-0 border-[#E8E4DF] bg-[#f5f4f2] text-sm text-[#999] font-light select-none">+971</span>
                            <input
                              required
                              type="tel"
                              maxLength={9}
                              value={newAddress.phone}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                                setNewAddress((a) => ({ ...a, phone: digits }));
                              }}
                              placeholder="501234567"
                              dir="ltr"
                              className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("country")} *</label>
                          <input required readOnly value="United Arab Emirates" className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light bg-[#f5f4f2] cursor-default" />
                          <input type="hidden" value={newAddress.country} />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("city")} *</label>
                          <select
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] bg-white"
                          >
                            <option value="">{isRtl ? "اختر المدينة" : "Select city"}</option>
                            {(shippingCities.length > 0 ? shippingCities : UAE_CITIES_FALLBACK).map((c) => (
                              <option key={c.id} value={c.nameEn}>
                                {isRtl ? c.nameAr : c.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("district")}</label>
                          <input value={newAddress.district} onChange={(e) => setNewAddress((a) => ({ ...a, district: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("street")} *</label>
                          <input required value={newAddress.street} onChange={(e) => setNewAddress((a) => ({ ...a, street: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("building")}</label>
                          <input value={newAddress.building} onChange={(e) => setNewAddress((a) => ({ ...a, building: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("apartment")}</label>
                          <input value={newAddress.apartment} onChange={(e) => setNewAddress((a) => ({ ...a, apartment: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="mt-6 pt-6 border-t border-[#E8E4DF]">
                    {isGuest && (
                      <div className="mb-6">
                        <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("email")}</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder={t("emailPlaceholder")}
                          className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
                        />
                      </div>
                    )}

                    <h3 className="text-sm tracking-widest uppercase text-[#1A1A1A] mb-4">{t("paymentMethod")}</h3>
                    <div className="space-y-3 mb-6">
                      <label
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === "CASH_ON_DELIVERY"
                          ? "border-[#1A1A1A] bg-[#FAF9F7]"
                          : "border-[#E8E4DF] hover:border-[#999]"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "CASH_ON_DELIVERY"}
                          onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                          className="mt-1 w-4 h-4 accent-[#1A1A1A] shrink-0"
                        />
                        <div>
                          <p className="text-sm text-[#1A1A1A] font-light">{t("cashOnDelivery")}</p>
                          <p className="text-xs text-[#999] font-light mt-0.5">{t("cashOnDeliveryDesc")}</p>
                        </div>
                      </label>
                      <label
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === "CREDIT_CARD"
                          ? "border-[#1A1A1A] bg-[#FAF9F7]"
                          : "border-[#E8E4DF] hover:border-[#999]"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "CREDIT_CARD"}
                          onChange={() => setPaymentMethod("CREDIT_CARD")}
                          className="mt-1 w-4 h-4 accent-[#1A1A1A] shrink-0"
                        />
                        <div>
                          <p className="text-sm text-[#1A1A1A] font-light">{t("creditCard")}</p>
                          <p className="text-xs text-[#999] font-light mt-0.5">{t("creditCardDesc")}</p>
                        </div>
                      </label>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("orderNotes")}</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("orderNotesPlaceholder")}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!selectedAddressId && !guestAddressReady}
                      onClick={() => {
                        if (isGuest && showNewAddress && addressFormRef.current) {
                          addressFormRef.current.requestSubmit();
                        } else if (!isGuest && showNewAddress) {
                          addressFormRef.current?.requestSubmit();
                        } else {
                          setStep("review");
                        }
                      }}
                      className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t("orderSummary")}
                    </button>
                  </div>
                </div>
              )}

              {step === "review" && (
                <div>
                  <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-6">{t("orderSummary")}</h2>

                  {(selectedAddress || guestAddressReady) && (
                    <div className="p-4 border border-[#E8E4DF] mb-6">
                      <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2">{t("shippingAddress")}</p>
                      <p className="text-sm text-[#1A1A1A] font-light">{selectedAddress?.fullName || newAddress.fullName}</p>
                      <p className="text-xs text-[#999] font-light" dir="ltr">{selectedAddress?.phone || newAddress.phone}</p>
                      <p className="text-sm text-[#555] font-light mt-1">
                        {(selectedAddress?.street || newAddress.street)}{((selectedAddress?.building || newAddress.building) ? `, ${selectedAddress?.building || newAddress.building}` : "")}, {selectedAddress?.city || newAddress.city}, {selectedAddress?.country || newAddress.country}
                      </p>
                    </div>
                  )}

                  <div className="p-4 border border-[#E8E4DF] mb-6">
                    <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2">{t("paymentMethod")}</p>
                    <p className="text-sm text-[#1A1A1A] font-light">
                      {paymentMethod === "CASH_ON_DELIVERY" ? t("cashOnDelivery") : t("creditCard")}
                    </p>
                  </div>

                  {notes && (
                    <div className="p-4 border border-[#E8E4DF] mb-6">
                      <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2">{t("orderNotes")}</p>
                      <p className="text-sm text-[#555] font-light">{notes}</p>
                    </div>
                  )}

                  <div className="border border-[#E8E4DF] divide-y divide-[#E8E4DF] mb-6">
                    {isBuyNow && directItem ? (
                      <DirectItemRow item={directItem} isRtl={isRtl} formatPrice={formatPrice} />
                    ) : (
                      items.map((item) => {
                        const name = isRtl ? item.nameAr : item.nameEn;
                        const hasDiscount = item.salePrice != null && +item.salePrice < +item.basePrice;
                        const unitPrice = (hasDiscount ? +item.salePrice! : +item.basePrice) + +item.priceAdjustment;
                        return (
                          <div key={item.variantId} className="flex gap-4 p-4">
                            <div className="relative w-14 h-18 shrink-0 bg-[#FAF9F7]">
                              {item.image ? (
                                <Image src={item.image} alt={name} fill className="object-cover" sizes="56px" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-[8px]">IMG</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1A1A1A] font-light">{name}</p>
                              <p className="text-xs text-[#999] font-light mt-0.5">× {item.quantity}</p>
                            </div>
                            <span className="text-sm text-[#1A1A1A] font-light shrink-0">{formatPrice(unitPrice * item.quantity)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("address")}
                      className="px-6 py-3.5 border border-[#E8E4DF] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:border-[#1A1A1A] transition-colors"
                    >
                      {t("shippingAddress")}
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors disabled:opacity-60"
                    >
                      {placing ? t("placing") : t("placeOrder")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#FAF9F7] p-6 sm:p-8 sticky top-28">
                <h2 className="font-serif text-xl text-[#1A1A1A] tracking-wide mb-6">
                  {t("orderSummary")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#999] font-light">{t("subtotal")}</span>
                    <span className="text-sm text-[#1A1A1A] font-light">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#999] font-light">{t("shipping")}</span>
                    <span className="text-sm text-[#1A1A1A] font-light">
                      {shippingCost === null ? t("calculatedAtNextStep") : shippingCost === 0 ? t("freeShipping") : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#999] font-light">{t("discount")}</span>
                      <span className="text-sm text-[#8B7355] font-light">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="w-full h-px bg-[#E8E4DF]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1A1A] tracking-wide uppercase">{t("total")}</span>
                    <span className="text-lg text-[#1A1A1A] font-light">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); setCouponSuccess(false); setDiscount(0); }}
                    placeholder={t("couponPlaceholder")}
                    className="flex-1 px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A] bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-colors"
                  >
                    {t("applyCoupon")}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mb-2">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-green-600 mb-2">{t("couponApplied")}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <EmailVerificationModal
        locale={locale}
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={() => { setShowVerifyModal(false); handlePlaceOrder(); }}
      />
    </>
  );
}

function DirectItemRow({ item, isRtl, formatPrice }: { item: DirectItem; isRtl: boolean; formatPrice: (p: number) => string }) {
  const name = isRtl ? item.nameAr : item.nameEn;
  return (
    <div className="flex gap-4 p-4">
      <div className="relative w-14 h-18 shrink-0 bg-[#FAF9F7]">
        {item.image ? (
          <Image src={item.image} alt={name} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-[8px]">IMG</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1A1A] font-light">{name}</p>
        {item.variantLabel && (
          <p className="text-xs text-[#999] font-light mt-0.5">{item.variantLabel}</p>
        )}
        <p className="text-xs text-[#999] font-light mt-0.5">× {item.quantity}</p>
      </div>
      <span className="text-sm text-[#1A1A1A] font-light shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
    </div>
  );
}

function StepIndicator({ step, setStep, t }: { step: Step; setStep: (s: Step) => void; t: (k: string) => string }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: "address", label: t("shippingAddress"), num: 1 },
    { key: "review", label: t("orderSummary"), num: 2 },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-0 mb-8 border-b border-[#E8E4DF] pb-4">
      {steps.map((s, i) => (
        <button
          key={s.key}
          type="button"
          onClick={() => { if (i <= currentIndex) setStep(s.key); }}
          disabled={i > currentIndex}
          className={`flex items-center gap-2 text-xs tracking-widest uppercase font-light transition-colors ${i === currentIndex
            ? "text-[#1A1A1A]"
            : i < currentIndex
              ? "text-[#8B7355] cursor-pointer hover:text-[#7A6348]"
              : "text-[#C4C4C4] cursor-not-allowed"
            } ${i < steps.length - 1 ? "me-6" : ""}`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i <= currentIndex ? "bg-[#1A1A1A] text-white" : "bg-[#E8E4DF] text-[#999]"
            }`}>
            {s.num}
          </span>
          <span className="hidden sm:inline">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
