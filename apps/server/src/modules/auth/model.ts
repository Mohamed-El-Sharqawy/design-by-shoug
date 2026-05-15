import { t } from "elysia";

export const RegisterBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  eventId: t.Optional(t.String()),
  fbp: t.Optional(t.String()),
  fbc: t.Optional(t.String()),
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

export const SendOtpBody = t.Object({
  email: t.String({ format: "email" }),
});

export const VerifyEmailBody = t.Object({
  email: t.String({ format: "email" }),
  otp: t.String({ minLength: 6, maxLength: 6 }),
});

export const RequestEmailChangeBody = t.Object({
  newEmail: t.String({ format: "email" }),
});

export const VerifyEmailChangeBody = t.Object({
  otp: t.String({ minLength: 6, maxLength: 6 }),
});

export type RegisterInput = typeof RegisterBody.static;
export type LoginInput = typeof LoginBody.static;
export type ForgotPasswordInput = typeof ForgotPasswordBody.static;
export type ResetPasswordInput = typeof ResetPasswordBody.static;
export type ChangePasswordInput = typeof ChangePasswordBody.static;
export type UpdateProfileInput = typeof UpdateProfileBody.static;
export type SendOtpInput = typeof SendOtpBody.static;
export type VerifyEmailInput = typeof VerifyEmailBody.static;
export type RequestEmailChangeInput = typeof RequestEmailChangeBody.static;
export type VerifyEmailChangeInput = typeof VerifyEmailChangeBody.static;
