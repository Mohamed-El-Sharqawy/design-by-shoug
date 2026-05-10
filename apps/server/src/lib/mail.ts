const MAILTRAP_API = "https://send.api.mailtrap.io/api/send";
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || "hello@designbyshoug.com";
const SENDER_NAME = process.env.MAILTRAP_SENDER_NAME || "Design By Shoug";
const OWNER_EMAILS = (process.env.OWNER_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string[];
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const toArray = Array.isArray(options.to)
    ? options.to.map((e) => ({ email: e }))
    : [{ email: options.to }];

  const body: Record<string, unknown> = {
    from: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: toArray,
    subject: options.subject,
    html: options.html,
    ...(options.text && { text: options.text }),
    ...(options.bcc && options.bcc.length > 0 && { bcc: options.bcc.map((e) => ({ email: e })) }),
  };

  const res = await fetch(MAILTRAP_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MAILTRAP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailtrap API error ${res.status}: ${text}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || "https://designbyshoug.com";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password - DesignByShoug",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: "VERIFY_EMAIL" | "CHANGE_EMAIL"
): Promise<void> {
  const subject =
    purpose === "CHANGE_EMAIL"
      ? "Verify Your New Email - DesignByShoug"
      : "Verify Your Email - DesignByShoug";

  const message =
    purpose === "CHANGE_EMAIL"
      ? "Use this code to confirm your new email address:"
      : "Use this code to verify your email address:";

  await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Email Verification</h1>
        <p>${message}</p>
        <div style="display: inline-block; background-color: #f5f5f5; padding: 16px 32px; margin: 24px 0; border-radius: 8px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #1A1A1A;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
  });
}

export interface OrderItemDetail {
  name: string;
  size: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  image: string | null;
}

export interface OrderConfirmationDetails {
  items: OrderItemDetail[];
  subtotal: string;
  shipping: string;
  discount?: string;
  total: string;
  paymentMethod: string;
  address?: {
    fullName: string;
    phone: string;
    street: string;
    building?: string | null;
    apartment?: string | null;
    district?: string | null;
    city: string;
    country: string;
  };
  customerNotes?: string | null;
}

function buildItemsHtml(items: OrderItemDetail[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: middle;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px;" />` : '<div style="width: 50px; height: 60px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">No img</div>'}
            <div>
              <div style="font-weight: 500;">${item.name}</div>
              <div style="font-size: 12px; color: #666;">${item.size}</div>
            </div>
          </div>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${item.totalPrice}</td>
      </tr>
    `
    )
    .join("");
}

function buildAddressHtml(address: NonNullable<OrderConfirmationDetails["address"]>): string {
  const parts = [
    address.street,
    address.building,
    address.apartment,
    address.district,
    `${address.city}, ${address.country}`,
  ].filter(Boolean);

  return `
    <div style="margin: 16px 0; padding: 12px; background-color: #f9f9f9; border-radius: 4px;">
      <p style="margin: 0 0 4px; font-weight: 500;">${address.fullName}</p>
      <p style="margin: 0 0 4px; color: #666;">${address.phone}</p>
      <p style="margin: 0; color: #666;">${parts.join(", ")}</p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: OrderConfirmationDetails
): Promise<void> {
  const itemsHtml = buildItemsHtml(orderDetails.items);

  await sendEmail({
    to: email,
    subject: `Order Confirmation #${orderNumber} - DesignByShoug`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank You for Your Order!</h1>
        <p>Your order <strong>#${orderNumber}</strong> has been confirmed.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px 8px; text-align: left;">Item</th>
              <th style="padding: 12px 8px; text-align: center;">Qty</th>
              <th style="padding: 12px 8px; text-align: right;">Price</th>
              <th style="padding: 12px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px;">
          <p style="margin: 4px 0;">Subtotal: ${orderDetails.subtotal}</p>
          ${orderDetails.discount && orderDetails.discount !== "AED 0.00" ? `<p style="margin: 4px 0; color: #8B7355;">Discount: -${orderDetails.discount}</p>` : ""}
          <p style="margin: 4px 0;">Shipping: ${orderDetails.shipping}</p>
          <p style="margin: 4px 0; font-weight: bold; font-size: 18px;">Total: ${orderDetails.total}</p>
        </div>

        <p style="color: #666; margin-top: 24px;">We'll send you another email when your order ships.</p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 13px; margin: 0 0 4px;">Need help? Contact us:</p>
          <p style="color: #555; font-size: 13px; margin: 0 0 2px;">Email: <a href="mailto:ddesignbyshoug@gmail.com" style="color: #8B7355;">ddesignbyshoug@gmail.com</a></p>
          <p style="color: #555; font-size: 13px; margin: 0;">WhatsApp: <a href="https://wa.me/971507397759" style="color: #8B7355;">+971 50 739 7759</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendOwnerOrderNotification(
  orderNumber: string,
  orderDetails: OrderConfirmationDetails
): Promise<void> {
  if (OWNER_EMAILS.length === 0) return;

  const itemsHtml = buildItemsHtml(orderDetails.items);
  const addressHtml = orderDetails.address ? buildAddressHtml(orderDetails.address) : "";

  await sendEmail({
    to: OWNER_EMAILS,
    subject: `New Order #${orderNumber} - DesignByShoug`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Order Received</h1>
        <p>Order <strong>#${orderNumber}</strong></p>

        <h3 style="color: #555; margin-top: 20px;">Customer Details</h3>
        ${addressHtml}

        <h3 style="color: #555; margin-top: 20px;">Payment Method</h3>
        <p>${orderDetails.paymentMethod}</p>

        ${orderDetails.customerNotes ? `<h3 style="color: #555; margin-top: 20px;">Customer Notes</h3><p style="background: #fffbe6; padding: 8px; border-radius: 4px;">${orderDetails.customerNotes}</p>` : ""}

        <h3 style="color: #555; margin-top: 20px;">Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px 8px; text-align: left;">Item</th>
              <th style="padding: 12px 8px; text-align: center;">Qty</th>
              <th style="padding: 12px 8px; text-align: right;">Price</th>
              <th style="padding: 12px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <p style="margin: 4px 0;">Subtotal: ${orderDetails.subtotal}</p>
          ${orderDetails.discount && orderDetails.discount !== "AED 0.00" ? `<p style="margin: 4px 0; color: #8B7355;">Discount: -${orderDetails.discount}</p>` : ""}
          <p style="margin: 4px 0;">Shipping: ${orderDetails.shipping}</p>
          <p style="margin: 4px 0; font-weight: bold; font-size: 18px;">Total: ${orderDetails.total}</p>
        </div>
      </div>
    `,
  });
}
