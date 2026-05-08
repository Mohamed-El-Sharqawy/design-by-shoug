import { Elysia, t } from "elysia";
import { AdminService } from "./service";
import { AdminLoginBody, CreateAdminBody } from "./model";
import { jwtPlugin, requireAdmin } from "@/modules/auth";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(jwtPlugin)
  .post(
    "/login",
    async ({ body, jwt }) => {
      const admin = await AdminService.login(body);
      const token = await jwt.sign({ sub: admin.id, role: admin.role });

      return {
        success: true,
        data: { admin, token },
      };
    },
    { body: AdminLoginBody }
  )
  .use(requireAdmin)
  .get("/stats", async () => {
    const stats = await AdminService.getStats();
    return { success: true, data: stats };
  })
  .get("/admins", async () => {
    const admins = await AdminService.listAdmins();

    return {
      success: true,
      data: admins,
    };
  })
  .post(
    "/admins",
    async ({ body }) => {
      const admin = await AdminService.createAdmin(body);

      return {
        success: true,
        data: admin,
      };
    },
    { body: CreateAdminBody }
  )
  .patch(
    "/admins/:id/status",
    async ({ params, body }) => {
      const admin = await AdminService.toggleAdminStatus(params.id, body.isActive);

      return {
        success: true,
        data: admin,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ isActive: t.Boolean() }),
    }
  );
