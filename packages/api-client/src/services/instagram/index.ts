import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { InstagramPost } from "@repo/types";

export const instagramKeys = {
  all: ["instagram"] as const,
  lists: () => [...instagramKeys.all, "list"] as const,
};

export interface CreateInstagramPostDto {
  postUrl: string;
  imageUrl: string;
  thumbnailUrl?: string;
  captionEn?: string;
  captionAr?: string;
  sortOrder?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export type UpdateInstagramPostDto = Partial<CreateInstagramPostDto>;

export function useInstagramPosts(includeAll = true) {
  const client = useApiClient();
  return useQuery({
    queryKey: instagramKeys.lists(),
    queryFn: () => client.get<InstagramPost[]>(includeAll ? "/content/instagram/all" : "/content/instagram"),
  });
}

export function useCreateInstagramPost() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInstagramPostDto) => client.post<InstagramPost>("/content/instagram", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instagramKeys.lists() });
    },
  });
}

export function useUpdateInstagramPost() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInstagramPostDto }) =>
      client.patch<InstagramPost>(`/content/instagram/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instagramKeys.lists() });
    },
  });
}

export function useDeleteInstagramPost() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/content/instagram/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instagramKeys.lists() });
    },
  });
}
