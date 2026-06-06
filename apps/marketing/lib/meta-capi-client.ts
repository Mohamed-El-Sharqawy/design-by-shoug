import { getFbp, getFbc } from "./meta-cookies";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("dbs_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

const dedupCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 1000;

export async function trackServerEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
): Promise<void> {
  const dedupKey = `${eventName}:${eventId}`;
  const now = Date.now();
  const last = dedupCache.get(dedupKey);
  if (last && now - last < DEDUP_WINDOW_MS) return;
  dedupCache.set(dedupKey, now);

  const fbp = getFbp();
  const fbc = getFbc();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    await fetch(`${API_URL}/meta/track`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
        fbp,
        fbc,
        customData,
      }),
      keepalive: true,
    });
  } catch {
    /* fire-and-forget */
  }
}
