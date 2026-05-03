import type { ApiClient } from "../../client";
import type { AddToCartDto, UpdateCartItemDto, MergeCartDto } from "./dto";
import { transformCartResponse, type CartItemLocal } from "./transformer";

export function createAddToCartMutation(client: ApiClient) {
  return {
    mutationFn: async (dto: AddToCartDto): Promise<CartItemLocal[]> => {
      const raw = await client.post<any>("/cart/items", dto);
      return transformCartResponse(raw);
    },
  };
}

export function createUpdateCartItemMutation(client: ApiClient) {
  return {
    mutationFn: async ({
      itemId,
      dto,
    }: {
      itemId: string;
      dto: UpdateCartItemDto;
    }): Promise<CartItemLocal[]> => {
      const raw = await client.patch<any>(`/cart/items/${itemId}`, dto);
      return transformCartResponse(raw);
    },
  };
}

export function createRemoveCartItemMutation(client: ApiClient) {
  return {
    mutationFn: async (itemId: string): Promise<CartItemLocal[]> => {
      const raw = await client.delete<any>(`/cart/items/${itemId}`);
      return transformCartResponse(raw);
    },
  };
}

export function createClearCartMutation(client: ApiClient) {
  return {
    mutationFn: async (): Promise<CartItemLocal[]> => {
      const raw = await client.delete<any>("/cart");
      return transformCartResponse(raw);
    },
  };
}

export function createMergeCartMutation(client: ApiClient) {
  return {
    mutationFn: async (dto: MergeCartDto): Promise<CartItemLocal[]> => {
      const raw = await client.post<any>("/cart/merge", dto);
      return transformCartResponse(raw);
    },
  };
}
