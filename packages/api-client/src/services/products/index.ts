import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Product, ProductListResponse, ProductImage, PaginatedResponse } from "@repo/types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  variant: (variantId: string) => [...productKeys.all, "variant", variantId] as const,
};

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  collectionId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface CreateProductDto {
  sku: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  shortDescEn?: string;
  shortDescAr?: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  hasColorOptions?: boolean;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescEn?: string;
  metaDescAr?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  collectionIds?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductImageDto {
  url: string;
  altTextEn?: string;
  altTextAr?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface VariantDto {
  sku: string;
  abayaLengthId: string;
  bodySizeId: string;
  colorId?: string;
  priceAdjustment?: number;
  stock?: number;
  lowStockAlert?: number;
  isActive?: boolean;
}

export function useSetProductImages() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, images }: { productId: string; images: ProductImageDto[] }) =>
      client.put<ProductImage[]>(`/products/${productId}/images`, images),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useBulkCreateVariants() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variants }: { productId: string; variants: VariantDto[] }) =>
      client.put(`/products/${productId}/variants`, variants),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export interface CreateProductDto {
  sku: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  shortDescEn?: string;
  shortDescAr?: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  hasColorOptions?: boolean;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescEn?: string;
  metaDescAr?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  collectionIds?: string[];
}

export function useProducts(filters: ProductFilters = {}) {
  const client = useApiClient();
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  return useQuery({
    queryKey: productKeys.list(filters as Record<string, unknown>),
    queryFn: () => client.get<ProductListResponse>(`/products?${params}`),
  });
}

export interface ProductPage {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useInfiniteProducts(filters: Omit<ProductFilters, "page" | "limit"> = {}) {
  const client = useApiClient();
  const limit = 20;

  return useInfiniteQuery<ProductPage, Error, InfiniteData<ProductPage>, readonly unknown[], number>({
    queryKey: [...productKeys.list(filters as Record<string, unknown>), "infinite"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(pageParam));
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      return client.get<ProductPage>(`/products?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export function useProduct(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => client.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => client.post<Product>("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      client.patch<Product>(`/products/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export interface ProductVariantDetail {
  id: string;
  priceAdjustment: number;
  stock: number;
  abayaLength?: { id: string; labelEn: string; labelAr: string };
  bodySize?: { id: string; labelEn: string; labelAr: string };
  color?: { id: string; nameEn: string; nameAr: string; hex: string };
  product: Product;
}

export function useProductVariant(variantId: string | null) {
  const client = useApiClient();
  return useQuery({
    queryKey: productKeys.variant(variantId!),
    queryFn: () => client.get<ProductVariantDetail>(`/products/variant/${variantId}`),
    enabled: !!variantId,
  });
}
