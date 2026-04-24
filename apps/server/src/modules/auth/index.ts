import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { AuthService } from "./service";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  ChangePasswordBody,
  UpdateProfileBody,
} from "./model";
import { UnauthorizedError } from "@/lib/errors";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
};

const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({
    name: "jwt",
    secret: jwtSecret,
  })
);

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(jwtPlugin)
  .use(bearer())
  .derive({ as: "global" }, async ({ jwt, bearer }): Promise<{ user: AuthUser | null }> => {
    if (!bearer) return { user: null };

    const payload = await jwt.verify(bearer);
    if (!payload || typeof payload.sub !== "string") return { user: null };

    const dbUser = await AuthService.getUserById(payload.sub);
    return { user: dbUser as AuthUser | null };
  });

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authPlugin)
  .macro({
    auth(enabled: boolean) {
      if (!enabled) return;
      return {
        beforeHandle({ user }: { user: AuthUser | null }) {
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }
        },
      };
    },
  });

export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .macro({
    admin(enabled: boolean) {
      if (!enabled) return;
      return {
        beforeHandle({ user }: { user: AuthUser | null }) {
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }
          if (user.role !== "ADMIN") {
            throw new UnauthorizedError("Admin access required");
          }
        },
      };
    },
  });

const publicAuthRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .post(
    "/register",
    async ({ body, jwt }) => {
      const user = await AuthService.register(body);
      const token = await jwt.sign({ sub: user.id, role: user.role });

      return {
        success: true,
        data: { user, token },
      };
    },
    { body: RegisterBody }
  )
  .post(
    "/login",
    async ({ body, jwt }) => {
      const user = await AuthService.login(body);
      const token = await jwt.sign({ sub: user.id, role: user.role });

      return {
        success: true,
        data: { user, token },
      };
    },
    { body: LoginBody }
  )
  .post(
    "/forgot-password",
    async ({ body }) => {
      await AuthService.forgotPassword(body.email);

      return {
        success: true,
        message: "If the email exists, a password reset link has been sent",
      };
    },
    { body: ForgotPasswordBody }
  )
  .post(
    "/reset-password",
    async ({ body }) => {
      await AuthService.resetPassword(body);

      return {
        success: true,
        message: "Password has been reset successfully",
      };
    },
    { body: ResetPasswordBody }
  );

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .onBeforeHandle(({ user }) => {
    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }
  })
  .get("/me", async ({ user }) => {
    const profile = await AuthService.getProfile((user as AuthUser).id);

    return {
      success: true,
      data: profile,
    };
  })
  .patch(
    "/me",
    async ({ user, body }) => {
      const profile = await AuthService.updateProfile((user as AuthUser).id, body);

      return {
        success: true,
        data: profile,
      };
    },
    { body: UpdateProfileBody }
  )
  .post(
    "/change-password",
    async ({ user, body }) => {
      await AuthService.changePassword((user as AuthUser).id, body);

      return {
        success: true,
        message: "Password changed successfully",
      };
    },
    { body: ChangePasswordBody }
  );

export const authRoutes = new Elysia()
  .use(publicAuthRoutes)
  .use(protectedAuthRoutes);
