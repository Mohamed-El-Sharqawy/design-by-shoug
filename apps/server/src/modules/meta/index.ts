import { Elysia, t } from "elysia";
import { authPlugin, type AuthUser } from "@/modules/auth";
import { sendMetaEvent } from "@/lib/meta-capi";
import { prisma } from "@/lib/prisma";

const TrackBody = t.Object({
  eventName: t.String({ minLength: 1 }),
  eventId: t.String({ minLength: 1 }),
  eventSourceUrl: t.Optional(t.String()),
  fbp: t.Optional(t.String()),
  fbc: t.Optional(t.String()),
  customData: t.Optional(t.Record(t.String(), t.Any())),
});

export const metaRoutes = new Elysia({ prefix: "/meta", tags: ["Meta"] })
  .use(authPlugin)
  .post(
    "/track",
    async ({ body, user, request }) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined;
      const userAgent =
        request.headers.get("user-agent") || undefined;

      let email: string | undefined;
      let phone: string | undefined;
      let firstName: string | undefined;
      let lastName: string | undefined;
      let externalId: string | undefined;

      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as AuthUser).id },
          select: {
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        });
        if (dbUser) {
          email = dbUser.email || undefined;
          phone = dbUser.phone || undefined;
          firstName = dbUser.firstName || undefined;
          lastName = dbUser.lastName || undefined;
          externalId = (user as AuthUser).id;
        }
      }

      const cd = body.customData as Record<string, unknown> | undefined;

      try {
        await sendMetaEvent({
          eventName: body.eventName,
          eventId: body.eventId,
          eventSourceUrl: body.eventSourceUrl,
          email,
          phone,
          firstName,
          lastName,
          externalId,
          ip,
          userAgent,
          fbp: body.fbp,
          fbc: body.fbc,
          value:
            typeof cd?.value === "number"
              ? cd.value
              : undefined,
          currency:
            typeof cd?.currency === "string"
              ? cd.currency
              : undefined,
          contentIds: Array.isArray(cd?.content_ids)
            ? (cd.content_ids as string[])
            : undefined,
          contentType:
            typeof cd?.content_type === "string"
              ? cd.content_type
              : undefined,
          numItems:
            typeof cd?.num_items === "number"
              ? cd.num_items
              : undefined,
        });
      } catch (err) {
        console.error("[Meta CAPI] Failed to send event:", err);
      }

      return { success: true };
    },
    { body: TrackBody }
  );
