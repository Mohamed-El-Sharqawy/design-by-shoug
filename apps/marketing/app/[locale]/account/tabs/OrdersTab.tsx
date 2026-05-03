"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useMyOrders } from "@repo/api-client";

interface OrderItemDetail {
  id: string;
  productNameEn: string;
  productNameAr: string;
  variantDetails: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    product?: {
      images?: { url: string; isPrimary: boolean }[];
    };
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItemDetail[];
}

const statusKey: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  REFUNDED: "bg-gray-50 text-gray-600",
};

export function OrdersTab({ locale }: { locale: string }) {
  const t = useTranslations("Account");
  const isRtl = locale === "ar";
  const { data, isLoading: loading } = useMyOrders(50);
  const orders: OrderDetail[] = (data as { orders: OrderDetail[] } | undefined)?.orders ?? [];
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    const dateStr = date.toLocaleDateString(isRtl ? "ar-AE" : "en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString(isRtl ? "ar-AE" : "en-AE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} · ${timeStr}`;
  };

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

  if (selectedOrder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedOrder(null)}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light mb-6"
        >
          <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t("backToOrders")}
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide">
            {t("orderNumber")} #{selectedOrder.orderNumber}
          </h2>
          <span className={`px-3 py-1 text-[10px] tracking-widest uppercase ${statusColor[selectedOrder.status] || "bg-gray-50 text-gray-600"}`}>
            {t(statusKey[selectedOrder.status] || "pending")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
          <div className="p-4 bg-[#FAF9F7]">
            <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("date")}</p>
            <p className="text-[#1A1A1A] font-light">{formatDateTime(selectedOrder.createdAt)}</p>
          </div>
          <div className="p-4 bg-[#FAF9F7]">
            <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("paymentMethod")}</p>
            <p className="text-[#1A1A1A] font-light">{selectedOrder.paymentMethod === "CASH_ON_DELIVERY" ? t("cashOnDelivery") : selectedOrder.paymentMethod}</p>
          </div>
          <div className="p-4 bg-[#FAF9F7]">
            <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">{t("orderTotal")}</p>
            <p className="text-[#1A1A1A] font-light">{formatPrice(selectedOrder.total)}</p>
          </div>
        </div>

        <div className="border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
          {selectedOrder.items.map((item) => {
            const img = item.variant?.product?.images?.[0];
            return (
              <div key={item.id} className="flex gap-4 p-4">
                <div className="relative w-16 h-20 shrink-0 bg-[#FAF9F7]">
                  {img ? (
                    <Image src={img.url} alt={isRtl ? item.productNameAr : item.productNameEn} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-[8px]">IMG</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A1A1A] font-light">{isRtl ? item.productNameAr : item.productNameEn}</p>
                  <p className="text-xs text-[#999] font-light mt-0.5">{item.variantDetails} × {item.quantity}</p>
                </div>
                <span className="text-sm text-[#1A1A1A] font-light shrink-0">{formatPrice(item.totalPrice)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 max-w-xs ms-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#999] font-light">{t("subtotal")}</span>
            <span className="text-[#1A1A1A] font-light">{formatPrice(selectedOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#999] font-light">{t("shipping")}</span>
            <span className="text-[#1A1A1A] font-light">{formatPrice(selectedOrder.shippingCost)}</span>
          </div>
          {selectedOrder.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-[#999] font-light">{t("discount")}</span>
              <span className="text-[#8B7355] font-light">-{formatPrice(selectedOrder.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#E8E4DF]">
            <span className="text-[#1A1A1A] tracking-wide uppercase text-xs">{t("total")}</span>
            <span className="text-[#1A1A1A] font-light">{formatPrice(selectedOrder.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-[#E8E4DF] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-sm text-[#1A1A1A] mb-2">{t("noOrders")}</p>
        <p className="text-xs text-[#999] font-light mb-6">{t("noOrdersDesc")}</p>
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
    <div className="space-y-4">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => setSelectedOrder(order)}
          className="w-full text-start border border-[#E8E4DF] p-4 sm:p-6 hover:border-[#1A1A1A] transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs tracking-widest uppercase text-[#8B7355]">{t("orderNumber")}</span>
              <span className="ms-2 text-sm text-[#1A1A1A] font-light">#{order.orderNumber}</span>
            </div>
            <span className={`px-3 py-1 text-[10px] tracking-widest uppercase ${statusColor[order.status] || "bg-gray-50 text-gray-600"}`}>
              {t(statusKey[order.status] || "pending")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#999] font-light">
            <span>{formatDateTime(order.createdAt)}</span>
            <span>{order.items.length} {t("items")}</span>
            <span className="text-sm text-[#1A1A1A]">{formatPrice(order.total)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
