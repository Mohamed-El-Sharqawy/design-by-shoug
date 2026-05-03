export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  admin: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "ADMIN" | "CUSTOMER";
  };
  token: string;
}
