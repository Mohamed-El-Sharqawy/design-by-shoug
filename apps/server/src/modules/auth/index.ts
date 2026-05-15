import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { AuthService } from "./service";
import { AppError } from "@/lib/errors";
import { sendMetaEvent } from "@/lib/meta-capi";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  ChangePasswordBody,
  UpdateProfileBody,
  SendOtpBody,
  VerifyEmailBody,
  RequestEmailChangeBody,
  VerifyEmailChangeBody,
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
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      set.headers["content-type"] = "application/json";
      return JSON.stringify({ success: false, error: { message: error.message, code: error.code } });
    }
    if (error instanceof Error) {
      console.error("Unhandled auth error:", error);
      set.status = 500;
      set.headers["content-type"] = "application/json";
      return JSON.stringify({ success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } });
    }
  })
  .post(
    "/register",
    async ({ body, jwt, request }) => {
      const user = await AuthService.register(body);
      const token = await jwt.sign({ sub: user.id, role: user.role });

      try {
        await sendMetaEvent({
          eventName: "CompleteRegistration",
          eventId: body.eventId || `register_${user.id}`,
          email: body.email,
          firstName: body.firstName || undefined,
          lastName: body.lastName || undefined,
          fbp: body.fbp,
          fbc: body.fbc,
          userAgent: request.headers.get("user-agent") || undefined,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip") || undefined,
        });
      } catch (err) {
        console.error("Failed to send Meta CAPI CompleteRegistration event:", err);
      }

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
  )
  .post(
    "/send-otp",
    async ({ body }) => {
      await AuthService.sendOtp(body.email);

      return {
        success: true,
        message: "If the email exists and is unverified, a verification code has been sent",
      };
    },
    { body: SendOtpBody }
  )
  .post(
    "/verify-email",
    async ({ body }) => {
      const user = await AuthService.verifyEmail(body);

      return {
        success: true,
        data: { user },
        message: "Email verified successfully",
      };
    },
    { body: VerifyEmailBody }
  );

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      set.headers["content-type"] = "application/json";
      return JSON.stringify({ success: false, error: { message: error.message, code: error.code } });
    }
    if (error instanceof Error) {
      console.error("Unhandled auth error:", error);
      set.status = 500;
      set.headers["content-type"] = "application/json";
      return JSON.stringify({ success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } });
    }
  })
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
  )
  .post(
    "/request-email-change",
    async ({ user, body }) => {
      await AuthService.requestEmailChange((user as AuthUser).id, body);

      return {
        success: true,
        message: "Verification code sent to your new email",
      };
    },
    { body: RequestEmailChangeBody }
  )
  .post(
    "/verify-email-change",
    async ({ user, body }) => {
      const result = await AuthService.verifyEmailChange((user as AuthUser).id, body);

      return {
        success: true,
        data: result,
        message: "Email changed successfully",
      };
    },
    { body: VerifyEmailChangeBody }
  );

export const authRoutes = new Elysia()
  .use(publicAuthRoutes)
  .use(protectedAuthRoutes);
