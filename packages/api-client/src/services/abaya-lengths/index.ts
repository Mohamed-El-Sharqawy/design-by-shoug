import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { AbayaLength } from "@repo/types";

export const abayaLengthKeys = {
  all: ["abaya-lengths"] as const,
  lists: () => [...abayaLengthKeys.all, "list"] as const,
  list: (includeInactive: boolean) => [...abayaLengthKeys.lists(), { includeInactive }] as const,
  detail: (id: string) => [...abayaLengthKeys.all, "detail", id] as const,
};

export interface CreateAbayaLengthDto {
  inches: number;
  labelEn: string;
  labelAr: string;
  idealHeightCm: number;
  idealHeightFt: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateAbayaLengthDto = Partial<CreateAbayaLengthDto>;

export function useAbayaLengths(includeInactive = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: abayaLengthKeys.list(includeInactive),
    queryFn: () => client.get<AbayaLength[]>(includeInactive ? "/abaya-lengths/all" : "/abaya-lengths"),
  });
}

export function useAbayaLength(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: abayaLengthKeys.detail(id),
    queryFn: () => client.get<AbayaLength>(`/abaya-lengths/${id}`),
    enabled: !!id,
  });
}

export function useCreateAbayaLength() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAbayaLengthDto) => client.post<AbayaLength>("/abaya-lengths", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: abayaLengthKeys.lists() });
    },
  });
}

export function useUpdateAbayaLength() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAbayaLengthDto }) =>
      client.patch<AbayaLength>(`/abaya-lengths/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: abayaLengthKeys.lists() });
    },
  });
}

export function useDeleteAbayaLength() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/abaya-lengths/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: abayaLengthKeys.lists() });
    },
  });
}
