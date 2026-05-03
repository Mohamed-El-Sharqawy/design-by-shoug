import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Color } from "@repo/types";

export const colorKeys = {
  all: ["colors"] as const,
  lists: () => [...colorKeys.all, "list"] as const,
  list: (includeInactive: boolean) => [...colorKeys.lists(), { includeInactive }] as const,
  detail: (id: string) => [...colorKeys.all, "detail", id] as const,
};

export interface CreateColorDto {
  code: string;
  nameEn: string;
  nameAr: string;
  hexCode?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateColorDto = Partial<CreateColorDto>;

export function useColors(includeInactive = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: colorKeys.list(includeInactive),
    queryFn: () => client.get<Color[]>(includeInactive ? "/colors/all" : "/colors"),
  });
}

export function useColor(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: colorKeys.detail(id),
    queryFn: () => client.get<Color>(`/colors/${id}`),
    enabled: !!id,
  });
}

export function useCreateColor() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateColorDto) => client.post<Color>("/colors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: colorKeys.lists() });
    },
  });
}

export function useUpdateColor() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateColorDto }) =>
      client.patch<Color>(`/colors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: colorKeys.lists() });
    },
  });
}

export function useDeleteColor() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/colors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: colorKeys.lists() });
    },
  });
}
