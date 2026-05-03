import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../../client";
import type { User } from "@repo/types";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function getMeQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: () => client.get<User>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
