import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../context";

export interface MaintenanceSettings {
  enabled: boolean;
  message: string | null;
}

export function useMaintenanceStatus() {
  const client = useApiClient();

  return useQuery({
    queryKey: ["maintenance"],
    queryFn: () => client.get<MaintenanceSettings>("/settings/maintenance"),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useUpdateMaintenance() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { enabled: boolean; message?: string }) =>
      client.patch<MaintenanceSettings>("/settings/maintenance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
  });
}
