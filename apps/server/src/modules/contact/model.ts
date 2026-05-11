import { t } from "elysia";

export const contactBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  subject: t.String({ minLength: 1 }),
  message: t.String({ minLength: 10 }),
});

export type ContactInput = typeof contactBody.static;
