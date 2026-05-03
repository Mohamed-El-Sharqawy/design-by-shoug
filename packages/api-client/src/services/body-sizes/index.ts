import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { BodySize } from "@repo/types";

export const bodySizeKeys = {
  all: ["body-sizes"] as const,
  lists: () => [...bodySizeKeys.all, "list"] as const,
  list: (includeInactive: boolean) => [...bodySizeKeys.lists(), { includeInactive }] as const,
  detail: (id: string) => [...bodySizeKeys.all, "detail", id] as const,
};

export interface CreateBodySizeDto {
  code: string;
  labelEn: string;
  labelAr: string;
  bustInches: number;
  hipInches: number;
  sleevesInches?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateBodySizeDto = Partial<CreateBodySizeDto>;

export function useBodySizes(includeInactive = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: bodySizeKeys.list(includeInactive),
    queryFn: () => client.get<BodySize[]>(includeInactive ? "/body-sizes/all" : "/body-sizes"),
  });
}

export function useBodySize(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: bodySizeKeys.detail(id),
    queryFn: () => client.get<BodySize>(`/body-sizes/${id}`),
    enabled: !!id,
  });
}

export function useCreateBodySize() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBodySizeDto) => client.post<BodySize>("/body-sizes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodySizeKeys.lists() });
    },
  });
}

export function useUpdateBodySize() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBodySizeDto }) =>
      client.patch<BodySize>(`/body-sizes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodySizeKeys.lists() });
    },
  });
}

export function useDeleteBodySize() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/body-sizes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodySizeKeys.lists() });
    },
  });
}
