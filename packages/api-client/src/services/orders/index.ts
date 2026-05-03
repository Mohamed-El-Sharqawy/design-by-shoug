import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";
import type { Order, PaginatedResponse, OrderStatus } from "@repo/types";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notesAdmin?: string;
}

export function useOrders(filters: OrderFilters = {}) {
  const client = useApiClient();
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  return useQuery({
    queryKey: orderKeys.list(filters as Record<string, unknown>),
    queryFn: () => client.get<PaginatedResponse<Order>>(`/orders/all?${params}`),
  });
}

export function useOrder(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => client.get<Order>(`/orders/admin/${id}`),
    enabled: !!id,
  });
}

export function useMyOrders(limit = 50) {
  const client = useApiClient();
  return useQuery({
    queryKey: [...orderKeys.lists(), "my", { limit }],
    queryFn: () => client.get<PaginatedResponse<Order>>(`/orders/my-orders?limit=${limit}`),
  });
}

export function useUpdateOrderStatus() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      client.patch<Order>(`/orders/${id}/status`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
    },
  });
}
