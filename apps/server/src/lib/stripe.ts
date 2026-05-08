import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const {
    lineItems,
    currency = "aed",
    metadata,
    customerEmail,
    orderNumber,
    locale = "en",
    couponCode,
    discountAmount,
    shippingCost,
  } = params;

  const itemsTotal = lineItems.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0);
  const effectiveDiscount = Math.min(discountAmount || 0, itemsTotal);
  const discountRatio = effectiveDiscount > 0 ? 1 - effectiveDiscount / itemsTotal : 1;

  const stripeLineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; images?: string[] };
      unit_amount: number;
    };
    quantity: number;
  }> = lineItems.map((item) => ({
    price_data: {
      currency,
      product_data: {
        name: effectiveDiscount > 0 ? `${item.name} (${couponCode ? `${couponCode} applied` : 'Discount applied'})` : item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.unitAmount * discountRatio * 100),
    },
    quantity: item.quantity,
  }));

  if (shippingCost && shippingCost > 0) {
    stripeLineItems.push({
      price_data: {
        currency,
        product_data: {
          name: "Shipping",
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: stripeLineItems,
    success_url: `${FRONTEND_URL}/${locale}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/${locale}/checkout`,
    customer_email: customerEmail,
    metadata,
  });
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export { Stripe };
