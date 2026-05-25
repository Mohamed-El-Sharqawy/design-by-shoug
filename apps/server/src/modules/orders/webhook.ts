import { Elysia } from "elysia";
import {
  verifyWebhookSignature,
  type ZiinaWebhookPayload,
} from "@/lib/ziina";
import { prisma } from "@/lib/prisma";

async function handlePaymentIntentUpdated(data: ZiinaWebhookPayload["data"]) {
  if (data.status !== "completed") return;

  const metadata = data as ZiinaWebhookPayload["data"] & {
    metadata?: { orderId?: string };
  };
  const orderId = metadata.metadata?.orderId;

  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      });
    }
  }
}

export const webhookRoutes = new Elysia({ prefix: "/webhooks" }).post(
  "/ziina",
  async ({ request, body, headers }) => {
    const signature = headers["x-hmac-signature"] as string | undefined;
    if (!signature) {
      return { success: false, error: "Missing signature" };
    }

    const rawBody =
      body instanceof ReadableStream || typeof body === "object"
        ? JSON.stringify(body)
        : String(body);

    const valid = verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return { success: false, error: "Invalid signature" };
    }

    const payload = (typeof body === "object" ? body : JSON.parse(String(body))) as ZiinaWebhookPayload;

    if (payload.event === "payment_intent.status.updated") {
      await handlePaymentIntentUpdated(payload.data);
    }

    return { success: true };
  }
);
