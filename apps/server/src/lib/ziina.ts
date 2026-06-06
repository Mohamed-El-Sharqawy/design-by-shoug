import crypto from "node:crypto";

const ZIINA_API_URL = "https://api-v2.ziina.com/api";
const ZIINA_SECRET_KEY = process.env.ZIINA_SECRET_KEY!;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export interface CheckoutLineItem {
  name: string;
  image?: string;
  unitAmount: number;
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  lineItems: CheckoutLineItem[];
  currency?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  orderNumber: string;
  locale?: string;
  couponCode?: string | null;
  discountAmount?: number;
  shippingCost?: number;
}

export interface ZiinaPaymentIntent {
  id: string;
  account_id: string;
  amount: number;
  tip_amount: number;
  fee_amount: number;
  currency_code: string;
  created_at: string;
  status:
  | "requires_payment_instrument"
  | "requires_user_action"
  | "pending"
  | "completed"
  | "failed"
  | "canceled";
  operation_id: string;
  redirect_url: string;
  embedded_url: string;
  success_url?: string;
  cancel_url?: string;
  message?: string;
  latest_error?: { message: string; code: string };
}

async function ziinaRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${ZIINA_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZIINA_SECRET_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ziina API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<ZiinaPaymentIntent> {
  const {
    lineItems,
    currency = "AED",
    metadata,
    orderNumber,
    locale = "en",
    discountAmount,
    shippingCost,
  } = params;

  const itemsTotal = lineItems.reduce(
    (sum, i) => sum + i.unitAmount * i.quantity,
    0
  );
  const effectiveDiscount = Math.min(discountAmount || 0, itemsTotal);
  const total = itemsTotal - effectiveDiscount + (shippingCost || 0);

  const amountFils = Math.round(total * 100);

  const orderId = metadata?.orderId || "";
  const successUrl = `${FRONTEND_URL}/${locale}/order/confirmation?payment_intent_id={PAYMENT_INTENT_ID}&order_id=${orderId}`;
  const cancelUrl = `${FRONTEND_URL}/${locale}/checkout`;

  return ziinaRequest<ZiinaPaymentIntent>("/payment_intent", {
    method: "POST",
    body: JSON.stringify({
      amount: amountFils,
      currency_code: currency.toUpperCase(),
      success_url: successUrl,
      cancel_url: cancelUrl,
      message: `Order ${orderNumber}`,
      test: process.env.NODE_ENV !== "production",
    }),
  });
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<ZiinaPaymentIntent> {
  return ziinaRequest<ZiinaPaymentIntent>(
    `/payment_intent/${paymentIntentId}`
  );
}

export interface ZiinaWebhookPayload {
  event: string;
  data: ZiinaPaymentIntent & Record<string, unknown>;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): boolean {
  if (!process.env.ZIINA_WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.ZIINA_WEBHOOK_SECRET)
    .update(typeof payload === "string" ? payload : Buffer.from(payload))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export type { ZiinaPaymentIntent as PaymentIntent };
