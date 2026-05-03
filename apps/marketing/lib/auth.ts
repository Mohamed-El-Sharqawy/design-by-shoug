import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mergeLocalCartToServer } from "./cart-hooks";
import { setAuthCookie, removeAuthCookie } from "./cookie-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  emailVerified?: boolean;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  hydrate: () => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  requestEmailChange: (newEmail: string) => Promise<void>;
  verifyEmailChange: (otp: string) => Promise<void>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      hydrated: false,

      hydrate: async () => {
        const { token, hydrated } = get();
        if (hydrated) return;
        if (token) {
          try {
            const res = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success && json.data) {
              set({ user: json.data, hydrated: true });
              setAuthCookie(token);
              return;
            }
          } catch {
            /* ignore */
          }
          set({ token: null, hydrated: true });
          removeAuthCookie();
        } else {
          set({ hydrated: true });
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!json.success) {
            const msg = json.error?.message || json.message || "Login failed";
            throw new Error(msg);
          }
          const { token, user } = json.data;
          set({ token, user: { ...user, emailVerified: user.emailVerified ?? false }, loading: false });
          setAuthCookie(token);
          await mergeLocalCartToServer(token);
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          if (!json.success) {
            const msg = json.error?.message || json.message || "Registration failed";
            throw new Error(msg);
          }
          const { token, user } = json.data;
          set({ token, user: { ...user, emailVerified: false }, loading: false });
          setAuthCookie(token);
          await mergeLocalCartToServer(token);
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        set({ token: null, user: null });
        removeAuthCookie();
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success && json.data) {
            set({ user: json.data });
          }
        } catch {
          /* ignore */
        }
      },

      sendOtp: async (email) => {
        const res = await fetch(`${API_URL}/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Failed to send code");
        }
      },

      verifyEmail: async (email, otp) => {
        const res = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Verification failed");
        }
        const { user } = get();
        if (user) {
          set({ user: { ...user, emailVerified: true } });
        }
      },

      requestEmailChange: async (newEmail) => {
        const { token } = get();
        const res = await fetch(`${API_URL}/auth/request-email-change`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newEmail }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Failed to request email change");
        }
      },

      verifyEmailChange: async (otp) => {
        const { token, user } = get();
        const res = await fetch(`${API_URL}/auth/verify-email-change`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Verification failed");
        }
        if (user && json.data?.email) {
          set({ user: { ...user, email: json.data.email, emailVerified: true } });
        }
      },
    }),
    {
      name: "dbs_auth",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
