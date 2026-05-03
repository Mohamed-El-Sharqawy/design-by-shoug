import type { ApiClient } from "../../client";
import type { LoginDto, LoginResponseDto } from "./dto";
import { transformLoginResponse } from "./transformer";

export function createLoginMutation(client: ApiClient) {
  return {
    mutationFn: async (data: LoginDto) => {
      const response = await client.post<LoginResponseDto>("/admin/login", data);
      return transformLoginResponse(response);
    },
  };
}

export function createLogoutMutation(_client: ApiClient) {
  return {
    mutationFn: async () => {
      return Promise.resolve();
    },
  };
}
