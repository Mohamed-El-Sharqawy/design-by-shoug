const MAILTRAP_API = "https://send.api.mailtrap.io/api/send";
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || "hello@nabdalqalam.com";
const SENDER_NAME = process.env.MAILTRAP_SENDER_NAME || "Design By Shoug";
const OWNER_EMAIL = process.env.OWNER_EMAIL;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bccOwner?: boolean;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const body: Record<string, unknown> = {
    from: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: options.to }],
    subject: options.subject,
    html: options.html,
    ...(options.text && { text: options.text }),
    ...(options.bccOwner && OWNER_EMAIL && { bcc: [{ email: OWNER_EMAIL }] }),
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
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

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

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: string }>;
    subtotal: string;
    shipping: string;
    total: string;
  }
): Promise<void> {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
      </tr>
    `
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `Order Confirmation #${orderNumber} - DesignByShoug`,
    bccOwner: true,
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
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 16px;">
          <p style="margin: 4px 0;">Subtotal: ${orderDetails.subtotal}</p>
          <p style="margin: 4px 0;">Shipping: ${orderDetails.shipping}</p>
          <p style="margin: 4px 0; font-weight: bold; font-size: 18px;">Total: ${orderDetails.total}</p>
        </div>
        
        <p style="color: #666; margin-top: 24px;">We'll send you another email when your order ships.</p>
      </div>
    `,
  });
}


