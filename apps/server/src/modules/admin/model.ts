import { t } from "elysia";

export const AdminLoginBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const CreateAdminBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  firstName: t.String(),
  lastName: t.String(),
});

export type AdminLoginInput = typeof AdminLoginBody.static;
export type CreateAdminInput = typeof CreateAdminBody.static;
