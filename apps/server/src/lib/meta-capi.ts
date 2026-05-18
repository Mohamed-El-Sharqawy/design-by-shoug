import crypto from "node:crypto";

const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export interface MetaEventPayload {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
}

export async function sendMetaEvent(payload: MetaEventPayload): Promise<void> {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.warn(
      "[Meta CAPI] Missing META_PIXEL_ID or META_ACCESS_TOKEN — skipping"
    );
    return;
  }

  const userData: Record<string, string> = {};
  if (payload.email) userData.em = sha256(payload.email);
  if (payload.phone) userData.ph = sha256(payload.phone);
  if (payload.firstName) userData.fn = sha256(payload.firstName);
  if (payload.lastName) userData.ln = sha256(payload.lastName);
  if (payload.ip) userData.client_ip_address = payload.ip;
  if (payload.userAgent) userData.client_user_agent = payload.userAgent;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;
  if (payload.externalId) userData.external_id = sha256(payload.externalId);

  const customData: Record<string, unknown> = {};
  if (payload.value !== undefined) customData.value = payload.value;
  if (payload.currency) customData.currency = payload.currency;
  if (payload.contentIds) customData.content_ids = payload.contentIds;
  if (payload.contentType) customData.content_type = payload.contentType;
  if (payload.numItems !== undefined) customData.num_items = payload.numItems;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: payload.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        event_source_url: payload.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      },
    ],
    access_token: META_ACCESS_TOKEN,
    ...(META_TEST_EVENT_CODE && { test_event_code: META_TEST_EVENT_CODE }),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Meta CAPI] Error ${res.status}: ${text}`);
    } else if (META_TEST_EVENT_CODE) {
      const text = await res.text();
      console.log(`[Meta CAPI] Test event sent (${payload.eventName}):`, text);
    }
  } catch (err) {
    console.error("[Meta CAPI] Request failed:", err);
  }
}
