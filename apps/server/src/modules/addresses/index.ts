import { Elysia, t } from "elysia";
import { AddressService } from "./service";
import { authPlugin, type AuthUser } from "@/modules/auth";

const AddressBody = t.Object({
  label: t.Optional(t.String()),
  fullName: t.String(),
  phone: t.String(),
  country: t.String(),
  city: t.String(),
  district: t.Optional(t.String()),
  street: t.String(),
  building: t.Optional(t.String()),
  apartment: t.Optional(t.String()),
  postalCode: t.Optional(t.String()),
  isDefault: t.Optional(t.Boolean()),
});

export const addressRoutes = new Elysia({ prefix: "/addresses" })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    if (!(ctx.user as AuthUser | null)) {
      throw new Error("Authentication required");
    }
  })
  .get("/", async (ctx) => {
    const user = ctx.user as AuthUser;
    const addresses = await AddressService.getAddresses(user.id);
    return { success: true, data: addresses };
  })
  .post(
    "/",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      const address = await AddressService.createAddress(user.id, ctx.body);
      return { success: true, data: address };
    },
    { body: AddressBody }
  )
  .patch(
    "/:id",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      const address = await AddressService.updateAddress(ctx.params.id, user.id, ctx.body);
      return { success: true, data: address };
    },
    { params: t.Object({ id: t.String() }), body: AddressBody }
  )
  .delete(
    "/:id",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      await AddressService.deleteAddress(ctx.params.id, user.id);
      return { success: true, message: "Address deleted" };
    },
    { params: t.Object({ id: t.String() }) }
  );
