import { t } from "elysia";

export const contactBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  phone: t.Optional(t.String()),
  subject: t.String({ minLength: 1 }),
  message: t.String({ minLength: 10 }),
  eventId: t.Optional(t.String()),
  fbp: t.Optional(t.String()),
  fbc: t.Optional(t.String()),
});

export type ContactInput = typeof contactBody.static;
