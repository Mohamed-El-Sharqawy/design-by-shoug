export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  orders?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductListResponse {
  products: import("./models").Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
}

export interface CartResponse {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: import("./models").CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponId: string | null;
  coupon: any | null;
}
