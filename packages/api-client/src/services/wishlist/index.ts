import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";

export interface WishlistProduct {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  basePrice: number;
  salePrice: number | null;
  images: { url: string; isPrimary: boolean }[];
  variants: { priceAdjustment: number }[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: () => [...wishlistKeys.all, "list"] as const,
};

export function useWishlist() {
  const client = useApiClient();
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: () => client.get<WishlistItem[]>("/wishlist"),
  });
}

export function useRemoveFromWishlist() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => client.delete(`/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}
