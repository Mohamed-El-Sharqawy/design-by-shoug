import { OrderConfirmationClient } from "./OrderConfirmationClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationClient />;
}
