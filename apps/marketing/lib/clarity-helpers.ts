import Clarity from "@microsoft/clarity";

const shouldTrack = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_CLARITY_DEV === "true";

/**
 * Log a custom event in Clarity for session filtering.
 * Events appear in Filters, Dashboard, and Recordings.
 * Keep events minimal — only funnel-critical moments.
 */
export function clarityEvent(name: string) {
  if (!shouldTrack) return;
  try {
    Clarity.event(name);
  } catch {
    // Clarity not initialized — safe to ignore
  }
}

/**
 * Upgrade a session so Clarity never discards it.
 * Use for high-value actions (checkout, purchase).
 * Clarity caps at 100k recordings/day and samples the rest —
 * upgraded sessions are always kept.
 */
export function clarityUpgrade(reason: string) {
  if (!shouldTrack) return;
  try {
    Clarity.upgrade(reason);
  } catch {
    // Clarity not initialized — safe to ignore
  }
}

/**
 * Tag the current session with the user's auth ID (hashed by Clarity).
 * Call after login/registration so you can find a specific user's sessions.
 */
export function clarityIdentify(userId: string, friendlyName?: string) {
  if (!shouldTrack) return;
  try {
    Clarity.identify(userId, undefined, undefined, friendlyName);
  } catch {
    // Clarity not initialized — safe to ignore
  }
}
