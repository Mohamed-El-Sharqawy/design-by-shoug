import type { ApiResponse } from "@repo/types";

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
  upload<T>(path: string, formData: FormData): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseUrl, getToken, onUnauthorized } = config;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    isFormData = false
  ): Promise<T> {
    const token = getToken?.();
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      onUnauthorized?.();
      throw new Error("Unauthorized");
    }

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Request failed");
    }

    return data.data as T;
  }

  return {
    get<T>(path: string) {
      return request<T>("GET", path);
    },
    post<T>(path: string, body?: unknown) {
      return request<T>("POST", path, body);
    },
    put<T>(path: string, body?: unknown) {
      return request<T>("PUT", path, body);
    },
    patch<T>(path: string, body?: unknown) {
      return request<T>("PATCH", path, body);
    },
    delete<T>(path: string) {
      return request<T>("DELETE", path);
    },
    upload<T>(path: string, formData: FormData) {
      return request<T>("POST", path, formData, true);
    },
  };
}
