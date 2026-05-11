"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientProvider } from "@repo/api-client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

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
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
