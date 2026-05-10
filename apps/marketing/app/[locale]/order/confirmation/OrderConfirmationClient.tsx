"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderData {
  orderNumber: string;
  id: string;
}

export function OrderConfirmationClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent_id");
    const orderId = searchParams.get("order_id");
    if (!paymentIntentId || !orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "http://localhost:3001";

    fetch(`${API_URL}/orders/verify-payment?payment_intent_id=${paymentIntentId}&order_id=${orderId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrder({
            orderNumber: json.data.orderNumber,
            id: json.data.id,
          });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-[#E8E4DF] border-t-[#8B7355] rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="py-16 sm:py-24 bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-3">
            Payment Verification Failed
          </h1>
          <p className="text-sm text-[#999] font-light mb-8">
            We could not verify your payment. Please contact support if you were
            charged.
          </p>
          <Link
            href={`/${locale}/collections/all`}
            className="inline-block px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-3">
          {t("orderPlaced")}
        </h1>
        <p className="text-sm text-[#999] font-light mb-2">
          {t("orderPlacedDesc")}
        </p>
        <p className="text-sm text-[#1A1A1A] font-light mb-8">
          {t("orderNumber")}:{" "}
          <span className="font-medium">#{order.orderNumber}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
