import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import { authKeys, getMeQueryOptions } from "./queries";
import { createLoginMutation, createLogoutMutation } from "./mutations";
import type { LoginDto } from "./dto";

export function useMe() {
  const client = useApiClient();
  return useQuery(getMeQueryOptions(client));
}

export function useLogin() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createLoginMutation(client),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useLogout() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createLogoutMutation(client),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export type { LoginDto };
