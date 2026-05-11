"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

function pageview() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pageview();
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID) return null;

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
      `}
    </Script>
  );
}

const dedupCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 1000;

function isDuplicate(event: string, params?: Record<string, unknown>): boolean {
  const key = `${event}:${JSON.stringify(params ?? {})}`;
  const now = Date.now();
  const last = dedupCache.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  dedupCache.set(key, now);
  return false;
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    if (isDuplicate(event, params)) return;
    window.fbq("track", event, params);
  }
}

export function trackCustomEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    if (isDuplicate(event, params)) return;
    window.fbq("trackCustom", event, params);
  }
}
