"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCartHydrate } from "@/lib/cart-hooks";

export function AuthHydrator() {
  const hydrateAuth = useAuth((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
  }, []);

  useCartHydrate();

  return null;
}
