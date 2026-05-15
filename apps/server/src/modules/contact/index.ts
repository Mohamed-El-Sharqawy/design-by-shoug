import { Elysia } from "elysia";
import { contactBody } from "./model";
import { ContactService } from "./service";
import { sendMetaEvent } from "@/lib/meta-capi";

export const contactRoutes = new Elysia({ prefix: "/contact", tags: ["Contact"] }).post(
  "/",
  async ({ body, request }) => {
    await ContactService.sendContactEmail(body);

    try {
      await sendMetaEvent({
        eventName: "Lead",
        eventId: body.eventId,
        email: body.email,
        phone: body.phone,
        firstName: body.name?.split(" ")[0] || undefined,
        lastName: body.name?.split(" ").slice(1).join(" ") || undefined,
        fbp: body.fbp,
        fbc: body.fbc,
        userAgent: request.headers.get("user-agent") || undefined,
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          || request.headers.get("x-real-ip") || undefined,
      });
    } catch (err) {
      console.error("Failed to send Meta CAPI Lead event:", err);
    }

    return { success: true, message: "Message sent successfully" };
  },
  { body: contactBody }
);
