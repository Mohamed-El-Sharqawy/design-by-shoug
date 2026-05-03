import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Collection } from "@repo/types";

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...collectionKeys.lists(), filters] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};

export interface CreateCollectionDto {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCollectionDto = Partial<CreateCollectionDto>;

export function useCollections(includeAll = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: collectionKeys.list({ includeAll }),
    queryFn: () => client.get<Collection[]>(includeAll ? "/collections/all" : "/collections"),
  });
}

export function useCollection(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => client.get<Collection>(`/collections/${id}`),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionDto) => client.post<Collection>("/collections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useUpdateCollection() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionDto }) =>
      client.patch<Collection>(`/collections/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
    },
  });
}

export function useDeleteCollection() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}
