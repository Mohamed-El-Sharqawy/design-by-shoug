import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { ShippingZone } from "@repo/types";

export const shippingKeys = {
  all: ["shipping"] as const,
  lists: () => [...shippingKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...shippingKeys.lists(), filters] as const,
  details: () => [...shippingKeys.all, "detail"] as const,
  detail: (id: string) => [...shippingKeys.details(), id] as const,
};

export interface CreateShippingZoneDto {
  nameEn: string;
  nameAr: string;
  countries: string[];
  cities: string[];
  baseCost: number;
  freeShippingMin?: number;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  isActive?: boolean;
}

export type UpdateShippingZoneDto = Partial<CreateShippingZoneDto>;

export function useShippingZones(includeAll = true) {
  const client = useApiClient();
  return useQuery({
    queryKey: shippingKeys.list({ includeAll }),
    queryFn: () => client.get<ShippingZone[]>(includeAll ? "/shipping/zones/all" : "/shipping/zones"),
  });
}

export function useShippingZone(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: shippingKeys.detail(id),
    queryFn: () => client.get<ShippingZone>(`/shipping/zones/${id}`),
    enabled: !!id,
  });
}

export function useCreateShippingZone() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShippingZoneDto) => client.post<ShippingZone>("/shipping/zones", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() });
    },
  });
}

export function useUpdateShippingZone() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShippingZoneDto }) =>
      client.patch<ShippingZone>(`/shipping/zones/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shippingKeys.detail(id) });
    },
  });
}

export function useDeleteShippingZone() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/shipping/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() });
    },
  });
}

export interface CalculateShippingDto {
  city: string;
  orderAmount: number;
}

export interface ShippingCalculation {
  cost: number;
  shippingCost?: number;
}

export function useCalculateShipping() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (dto: CalculateShippingDto) =>
      client.post<ShippingCalculation>("/shipping/calculate", dto),
  });
}
