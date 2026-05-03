import type { User, LoginResponse } from "@repo/types";
import type { LoginResponseDto } from "./dto";

export function transformLoginResponse(dto: LoginResponseDto): LoginResponse {
  return {
    user: {
      id: dto.admin.id,
      email: dto.admin.email,
      firstName: dto.admin.firstName,
      lastName: dto.admin.lastName,
      role: dto.admin.role,
      isActive: true,
    },
    token: dto.token,
  };
}

export function transformUser(dto: LoginResponseDto["admin"]): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: dto.role,
    isActive: true,
  };
}
