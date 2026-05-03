import { createContext, useContext, type ReactNode } from "react";
import { createApiClient, type ApiClient, type ApiClientConfig } from "./client";

const ApiClientContext = createContext<ApiClient | null>(null);

export function ApiClientProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: ApiClientConfig;
}) {
  const client = createApiClient(config);
  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("useApiClient must be used within ApiClientProvider");
  }
  return client;
}
