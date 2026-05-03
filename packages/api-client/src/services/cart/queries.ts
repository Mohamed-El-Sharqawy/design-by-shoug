import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../../client";
import { cartKeys } from "./keys";
import { transformCartResponse } from "./transformer";

export function cartQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: cartKeys.all,
    queryFn: async () => {
      const raw = await client.get<any>("/cart");
      return transformCartResponse(raw);
    },
    staleTime: 1000 * 60,
  });
}
