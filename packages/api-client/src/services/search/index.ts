import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Product, Collection } from "@repo/types";

export interface SearchResults {
  products: Product[];
  collections: Collection[];
}

export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
};

export function useSearch(q: string, limit = 20) {
  const client = useApiClient();
  return useQuery({
    queryKey: searchKeys.query(q),
    queryFn: () => client.get<SearchResults>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
    enabled: !!q.trim(),
  });
}
