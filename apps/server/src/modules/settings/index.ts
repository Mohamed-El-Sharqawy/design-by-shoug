import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/modules/auth";

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .get("/maintenance", async () => {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "maintenance_mode" },
    });
    return {
      success: true,
      data: {
        enabled: setting?.value === "true",
        message: (await prisma.siteSettings.findUnique({ where: { key: "maintenance_message" } }))?.value || null,
      },
    };
  })
  .use(requireAdmin)
  .patch(
    "/maintenance",
    async ({ body }) => {
      await prisma.siteSettings.upsert({
        where: { key: "maintenance_mode" },
        update: { value: String(body.enabled) },
        create: { key: "maintenance_mode", value: String(body.enabled) },
      });

      if (body.message !== undefined) {
        await prisma.siteSettings.upsert({
          where: { key: "maintenance_message" },
          update: { value: body.message },
          create: { key: "maintenance_message", value: body.message },
        });
      }

      return {
        success: true,
        data: {
          enabled: body.enabled,
          message: body.message ?? null,
        },
      };
    },
    {
      body: t.Object({
        enabled: t.Boolean(),
        message: t.Optional(t.String()),
      }),
    }
  );
