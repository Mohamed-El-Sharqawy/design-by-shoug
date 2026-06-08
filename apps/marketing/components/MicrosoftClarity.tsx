"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const CLARITY_DEV = process.env.NEXT_PUBLIC_CLARITY_DEV === "true";
const shouldRun = process.env.NODE_ENV === "production" || CLARITY_DEV;

let initialized = false;

export function MicrosoftClarity() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!shouldRun || !CLARITY_PROJECT_ID) return;

    if (!initialized) {
      Clarity.init(CLARITY_PROJECT_ID);
      initialized = true;
      if (CLARITY_DEV) {
        console.log("[Clarity] Initialized in DEV mode");
      }
    }

    const locale = pathname.split("/")[1];
    if (locale === "ar" || locale === "en") {
      Clarity.setTag("locale", locale);
    }
  }, [pathname, searchParams]);

  return null;
}
