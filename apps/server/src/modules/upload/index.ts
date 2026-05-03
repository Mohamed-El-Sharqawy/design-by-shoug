import { Elysia, t } from "elysia";
import { requireAdmin } from "@/modules/auth";
import { uploadImage, uploadVideo, type UploadFolder } from "@/lib/cloudinary";

const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(requireAdmin)
  .post(
    "/image",
    async ({ body }) => {
      const { file, folder } = body;

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadImage(buffer, folder as UploadFolder);

      return {
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        },
      };
    },
    {
      body: t.Object({
        file: t.File(),
        folder: t.Union([
          t.Literal("products"),
          t.Literal("banners"),
          t.Literal("instagram"),
          t.Literal("videos"),
          t.Literal("size-guides"),
          t.Literal("avatars"),
        ]),
      }),
    }
  )
  .post(
    "/video",
    async ({ body }) => {
      const { file, folder } = body;

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadVideo(buffer, folder as UploadFolder);

      return {
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        },
      };
    },
    {
      body: t.Object({
        file: t.File({ type: ["video/mp4", "video/quicktime", "video/webm"] }),
        folder: t.Union([
          t.Literal("videos"),
          t.Literal("reviews"),
        ]),
      }),
    }
  );

export { uploadRoutes };
