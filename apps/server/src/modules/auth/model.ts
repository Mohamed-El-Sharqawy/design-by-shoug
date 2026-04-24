import { t } from "elysia";

export const RegisterBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
  phone: t.Optional(t.String()),
});

export const LoginBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const ForgotPasswordBody = t.Object({
  email: t.String({ format: "email" }),
});

export const ResetPasswordBody = t.Object({
  token: t.String(),
  password: t.String({ minLength: 8 }),
});

export const ChangePasswordBody = t.Object({
  currentPassword: t.String(),
  newPassword: t.String({ minLength: 8 }),
});

export const UpdateProfileBody = t.Object({
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
  phone: t.Optional(t.String()),
});

export type RegisterInput = typeof RegisterBody.static;
export type LoginInput = typeof LoginBody.static;
export type ForgotPasswordInput = typeof ForgotPasswordBody.static;
export type ResetPasswordInput = typeof ResetPasswordBody.static;
export type ChangePasswordInput = typeof ChangePasswordBody.static;
export type UpdateProfileInput = typeof UpdateProfileBody.static;
