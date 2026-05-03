import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import { cartKeys } from "./keys";
import { cartQueryOptions } from "./queries";
import {
  createAddToCartMutation,
  createUpdateCartItemMutation,
  createRemoveCartItemMutation,
  createClearCartMutation,
  createMergeCartMutation,
} from "./mutations";
import type { CartItemLocal } from "./transformer";

export { type CartItemLocal, transformCartResponse } from "./transformer";
export { cartKeys } from "./keys";
export { cartQueryOptions } from "./queries";

export function useCart() {
  const client = useApiClient();
  return useQuery(cartQueryOptions(client));
}

export function useAddToCart() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createAddToCartMutation(client),
    onSuccess: (items: CartItemLocal[]) => {
      queryClient.setQueryData(cartKeys.all, items);
    },
  });
}

export function useUpdateCartItem() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createUpdateCartItemMutation(client),
    onSuccess: (items: CartItemLocal[]) => {
      queryClient.setQueryData(cartKeys.all, items);
    },
  });
}

export function useRemoveCartItem() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createRemoveCartItemMutation(client),
    onSuccess: (items: CartItemLocal[]) => {
      queryClient.setQueryData(cartKeys.all, items);
    },
  });
}

export function useClearCart() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createClearCartMutation(client),
    onSuccess: (items: CartItemLocal[]) => {
      queryClient.setQueryData(cartKeys.all, items);
    },
  });
}

export function useMergeCart() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...createMergeCartMutation(client),
    onSuccess: (items: CartItemLocal[]) => {
      queryClient.setQueryData(cartKeys.all, items);
    },
  });
}
