import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Banner } from "@repo/types";

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...bannerKeys.lists(), filters] as const,
};

export interface CreateBannerDto {
  imageUrl: string;
  imageMobileUrl?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
  href?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateBannerDto = Partial<CreateBannerDto>;

export function useBanners(includeAll = true) {
  const client = useApiClient();
  return useQuery({
    queryKey: bannerKeys.list({ includeAll }),
    queryFn: () => client.get<Banner[]>(includeAll ? "/content/banners/all" : "/content/banners"),
  });
}

export function useCreateBanner() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerDto) => client.post<Banner>("/content/banners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

export function useUpdateBanner() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) =>
      client.patch<Banner>(`/content/banners/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

export function useDeleteBanner() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.delete(`/content/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}
