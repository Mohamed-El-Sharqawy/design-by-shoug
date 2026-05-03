export interface AddToCartDto {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface MergeCartDto {
  items: { variantId: string; quantity: number }[];
}
