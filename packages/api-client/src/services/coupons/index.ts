import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Coupon, CouponType } from "@repo/types";

export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
};

export interface CreateCouponDto {
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export function useCoupons() {
  const client = useApiClient();
  return useQuery({
    queryKey: couponKeys.lists(),
    queryFn: () => client.get<Coupon[]>("/coupons"),
  });
}

export function useCoupon(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => client.get<Coupon>(`/coupons/${id}`),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponDto) => client.post<Coupon>("/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useUpdateCoupon() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) =>
      client.patch<Coupon>(`/coupons/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(id) });
    },
  });
}

export function useDeleteCoupon() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export interface ValidateCouponDto {
  code: string;
  orderAmount: number;
}

export interface CouponValidation {
  valid: boolean;
  discount?: number;
  message?: string;
}

export function useValidateCoupon() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (dto: ValidateCouponDto) =>
      client.post<CouponValidation>("/coupons/validate", dto),
  });
}
