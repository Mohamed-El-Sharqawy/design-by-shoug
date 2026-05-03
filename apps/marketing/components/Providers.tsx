"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientProvider } from "@repo/api-client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cartKeys } from "@repo/api-client/services/cart";
import type { CartItemLocal } from "@repo/api-client/transformers/cart";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

function ApiProvider({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);

  return (
    <ApiClientProvider
      config={{
        baseUrl: API_URL,
        getToken: () => token,
      }}
    >
      {children}
    </ApiClientProvider>
  );
}

export function Providers({
  children,
  initialCartData,
}: {
  children: React.ReactNode;
  initialCartData?: CartItemLocal[] | null;
}) {
  const [queryClient] = useState(
    () => {
      const qc = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: true,
          },
        },
      });
      if (initialCartData && initialCartData.length > 0) {
        qc.setQueryData(cartKeys.all, initialCartData);
      }
      return qc;
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
