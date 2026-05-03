import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { CustomerReview } from "@repo/types";

export const customerReviewKeys = {
  all: ["customer-reviews"] as const,
  lists: () => [...customerReviewKeys.all, "list"] as const,
  list: (includeInactive: boolean) => [...customerReviewKeys.lists(), { includeInactive }] as const,
  detail: (id: string) => [...customerReviewKeys.all, "detail", id] as const,
};

export interface CreateCustomerReviewDto {
  videoUrl: string;
  thumbnailUrl?: string;
  name: string;
  type?: "CUSTOMER" | "MODEL" | "INFLUENCER";
  relation?: string;
  productId?: string;
  feedbackEn?: string;
  feedbackAr?: string;
  rating?: number;
  sortOrder?: number;
  isActive?: boolean;
  reviewDate?: string;
}

export type UpdateCustomerReviewDto = Partial<CreateCustomerReviewDto>;

export function useCustomerReviews(includeInactive = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: customerReviewKeys.list(includeInactive),
    queryFn: () => client.get<CustomerReview[]>(includeInactive ? "/customer-reviews/all" : "/customer-reviews"),
  });
}

export function useCustomerReview(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: customerReviewKeys.detail(id),
    queryFn: () => client.get<CustomerReview>(`/customer-reviews/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomerReview() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerReviewDto) => client.post<CustomerReview>("/customer-reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerReviewKeys.lists() });
    },
  });
}

export function useUpdateCustomerReview() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerReviewDto }) =>
      client.patch<CustomerReview>(`/customer-reviews/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerReviewKeys.lists() });
    },
  });
}

export function useDeleteCustomerReview() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/customer-reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerReviewKeys.lists() });
    },
  });
}
