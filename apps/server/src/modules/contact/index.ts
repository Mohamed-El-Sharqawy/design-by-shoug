import { Elysia } from "elysia";
import { contactBody } from "./model";
import { ContactService } from "./service";

export const contactRoutes = new Elysia({ prefix: "/contact", tags: ["Contact"] }).post(
  "/",
  async ({ body }) => {
    await ContactService.sendContactEmail(body);
    return { success: true, message: "Message sent successfully" };
  },
  { body: contactBody }
);
