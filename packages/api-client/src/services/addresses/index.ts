import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";

export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district: string | null;
  street: string;
  building: string | null;
  apartment: string | null;
  postalCode: string | null;
  isDefault: boolean;
}

export interface CreateAddressDto {
  label?: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district?: string;
  street: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export type UpdateAddressDto = Partial<CreateAddressDto>;

export const addressKeys = {
  all: ["addresses"] as const,
  list: () => [...addressKeys.all, "list"] as const,
};

export function useAddresses(options?: { enabled?: boolean }) {
  const client = useApiClient();
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: () => client.get<Address[]>("/addresses"),
    enabled: options?.enabled !== false,
  });
}

export function useCreateAddress() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressDto) => client.post<Address>("/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

export function useUpdateAddress() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) =>
      client.patch<Address>(`/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

export function useDeleteAddress() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}
