"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAddToCart as useAddToCartMutation,
  useUpdateCartItem as useUpdateCartItemMutation,
  useRemoveCartItem as useRemoveCartItemMutation,
  useClearCart as useClearCartMutation,
  cartKeys,
  cartQueryOptions,
  type CartItemLocal,
} from "@repo/api-client/services/cart";
import { useApiClient } from "@repo/api-client";
import { useCart, computeSubtotal } from "./cart";
import { useAuth } from "./auth";

export type { CartItemLocal } from "./cart";
export { cartKeys } from "@repo/api-client/services/cart";

export function useCartHydrate() {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const cartToken = useCart((s) => s.token);
  const setCartToken = useCart((s) => s.setToken);
  const queryClient = useQueryClient();
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (hydrated) {
      setCartToken(token);
    }
  }, [hydrated, token, setCartToken]);

  useEffect(() => {
    const prev = prevTokenRef.current;
    prevTokenRef.current = cartToken;

    if (prev && !cartToken) {
      queryClient.removeQueries({ queryKey: cartKeys.all });
    } else if (!prev && cartToken) {
      const hasSSRData = !!queryClient.getQueryData(cartKeys.all);
      if (!hasSSRData) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all });
      }
    }
  }, [cartToken, queryClient]);

  return null;
}

export function useCartItems() {
  const token = useCart((s) => s.token);
  const setItems = useCart((s) => s.setItems);
  const client = useApiClient();

  const query = useQuery({
    ...cartQueryOptions(client),
    enabled: !!token,
  });

  useEffect(() => {
    if (query.data) {
      setItems(query.data);
    }
  }, [query.data, setItems]);

  const items = useCart((s) => s.items);

  if (items.length === 0 && query.data && query.data.length > 0) {
    return query.data;
  }

  return items;
}

export function useCartCount() {
  const items = useCart((s) => s.items);
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function useCartSubtotal() {
  const items = useCart((s) => s.items);
  return computeSubtotal(items);
}

export function useAddToCart() {
  const token = useCart((s) => s.token);
  const setItems = useCart((s) => s.setItems);
  const queryClient = useQueryClient();
  const mutation = useAddToCartMutation();

  return {
    mutate: (
      item: Omit<CartItemLocal, "quantity" | "id">,
      quantity: number = 1
    ) => {
      const current =
        queryClient.getQueryData<CartItemLocal[]>(cartKeys.all) ??
        useCart.getState().items;

      const optimistic = [...current];
      const existing = optimistic.find(
        (i) => i.variantId === item.variantId
      );
      if (existing) {
        existing.quantity = existing.quantity + quantity;
      } else {
        optimistic.push({
          id: "",
          variantId: item.variantId,
          productId: item.productId,
          productSlug: item.productSlug,
          nameEn: item.nameEn,
          nameAr: item.nameAr,
          image: item.image,
          basePrice: item.basePrice,
          salePrice: item.salePrice,
          priceAdjustment: item.priceAdjustment,
          abayaLengthLabelEn: item.abayaLengthLabelEn,
          abayaLengthLabelAr: item.abayaLengthLabelAr,

          colorNameEn: item.colorNameEn,
          colorNameAr: item.colorNameAr,
          colorHex: item.colorHex,
          sku: item.sku,
          quantity,
        });
      }

      setItems(optimistic);
      queryClient.setQueryData(cartKeys.all, optimistic);

      if (token) {
        mutation.mutate(
          { variantId: item.variantId, quantity },
          {
            onSuccess: (serverItems) => {
              setItems(serverItems);
              queryClient.setQueryData(cartKeys.all, serverItems);
            },
            onError: () => {
              setItems(current);
              queryClient.setQueryData(cartKeys.all, current);
            },
          }
        );
      }
    },
  };
}

export function useUpdateCartQuantity() {
  const token = useCart((s) => s.token);
  const items = useCart((s) => s.items);
  const setItems = useCart((s) => s.setItems);
  const queryClient = useQueryClient();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();

  return {
    mutate: (variantId: string, quantity: number) => {
      const current = [...items];
      let optimistic: CartItemLocal[];

      if (quantity <= 0) {
        optimistic = current.filter((i) => i.variantId !== variantId);
      } else {
        optimistic = current.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        );
      }

      setItems(optimistic);
      queryClient.setQueryData(cartKeys.all, optimistic);

      if (token) {
        const cartItem = current.find((i) => i.variantId === variantId);
        if (!cartItem) return;

        if (quantity <= 0) {
          removeMutation.mutate(cartItem.id, {
            onSuccess: (serverItems) => {
              setItems(serverItems);
              queryClient.setQueryData(cartKeys.all, serverItems);
            },
            onError: () => {
              setItems(current);
              queryClient.setQueryData(cartKeys.all, current);
            },
          });
        } else {
          updateMutation.mutate(
            { itemId: cartItem.id, dto: { quantity } },
            {
              onSuccess: (serverItems) => {
                setItems(serverItems);
                queryClient.setQueryData(cartKeys.all, serverItems);
              },
              onError: () => {
                setItems(current);
                queryClient.setQueryData(cartKeys.all, current);
              },
            }
          );
        }
      }
    },
  };
}

export function useRemoveCartItem() {
  const token = useCart((s) => s.token);
  const items = useCart((s) => s.items);
  const setItems = useCart((s) => s.setItems);
  const queryClient = useQueryClient();
  const mutation = useRemoveCartItemMutation();

  return {
    mutate: (variantId: string) => {
      const current = [...items];
      const optimistic = current.filter((i) => i.variantId !== variantId);

      setItems(optimistic);
      queryClient.setQueryData(cartKeys.all, optimistic);

      if (token) {
        const cartItem = current.find((i) => i.variantId === variantId);
        if (cartItem) {
          mutation.mutate(cartItem.id, {
            onSuccess: (serverItems) => {
              setItems(serverItems);
              queryClient.setQueryData(cartKeys.all, serverItems);
            },
            onError: () => {
              setItems(current);
              queryClient.setQueryData(cartKeys.all, current);
            },
          });
        }
      }
    },
  };
}

export function useClearCart() {
  const token = useCart((s) => s.token);
  const setItems = useCart((s) => s.setItems);
  const queryClient = useQueryClient();
  const mutation = useClearCartMutation();

  return {
    mutate: () => {
      const current = useCart.getState().items;
      setItems([]);
      queryClient.setQueryData(cartKeys.all, []);

      if (token) {
        mutation.mutate(undefined, {
          onSuccess: (serverItems) => {
            setItems(serverItems);
            queryClient.setQueryData(cartKeys.all, serverItems);
          },
          onError: () => {
            setItems(current);
            queryClient.setQueryData(cartKeys.all, current);
          },
        });
      }
    },
  };
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

export async function mergeLocalCartToServer(token: string) {
  const { items } = useCart.getState();
  if (items.length === 0) return;

  const mergePayload = items.map((i) => ({
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  try {
    const res = await fetch(`${API_URL}/cart/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: mergePayload }),
    });
    const json = await res.json();
    if (json.success && json.data?.items) {
      const { transformCartResponse } = await import(
        "@repo/api-client/services/cart"
      );
      const serverItems = transformCartResponse(json.data);
      useCart.setState({ items: serverItems, token });
    } else {
      useCart.setState({ token });
    }
  } catch {
    useCart.setState({ token });
  }
}
