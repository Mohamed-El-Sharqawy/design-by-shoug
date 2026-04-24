import { Elysia, t } from "elysia";
import { ContentService } from "./service";
import {
  CreateBannerBody,
  UpdateBannerBody,
  CreateInstagramPostBody,
  UpdateInstagramPostBody,
  CreateShoppableVideoBody,
  UpdateShoppableVideoBody,
  CreateFeaturedProductBody,
  UpdateFeaturedProductBody,
  ContentIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicContentRoutes = new Elysia({ prefix: "/content" })
  .get("/banners", async () => {
    const banners = await ContentService.getBanners();
    return { success: true, data: banners };
  })
  .get("/instagram", async () => {
    const posts = await ContentService.getInstagramPosts();
    return { success: true, data: posts };
  })
  .get("/videos", async () => {
    const videos = await ContentService.getShoppableVideos();
    return { success: true, data: videos };
  })
  .get("/featured", async () => {
    const featured = await ContentService.getFeaturedProducts();
    return { success: true, data: featured };
  });

const adminContentRoutes = new Elysia({ prefix: "/content" })
  .use(requireAdmin)
  .get("/banners/all", async () => {
    const banners = await ContentService.getBanners(true);
    return { success: true, data: banners };
  })
  .post(
    "/banners",
    async ({ body }) => {
      const banner = await ContentService.createBanner(body);
      return { success: true, data: banner };
    },
    { body: CreateBannerBody }
  )
  .patch(
    "/banners/:id",
    async ({ params, body }) => {
      const banner = await ContentService.updateBanner(params.id, body);
      return { success: true, data: banner };
    },
    { params: ContentIdParams, body: UpdateBannerBody }
  )
  .delete(
    "/banners/:id",
    async ({ params }) => {
      await ContentService.deleteBanner(params.id);
      return { success: true, message: "Banner deleted" };
    },
    { params: ContentIdParams }
  )
  .get("/instagram/all", async () => {
    const posts = await ContentService.getInstagramPosts(true);
    return { success: true, data: posts };
  })
  .post(
    "/instagram",
    async ({ body }) => {
      const post = await ContentService.createInstagramPost(body);
      return { success: true, data: post };
    },
    { body: CreateInstagramPostBody }
  )
  .patch(
    "/instagram/:id",
    async ({ params, body }) => {
      const post = await ContentService.updateInstagramPost(params.id, body);
      return { success: true, data: post };
    },
    { params: ContentIdParams, body: UpdateInstagramPostBody }
  )
  .delete(
    "/instagram/:id",
    async ({ params }) => {
      await ContentService.deleteInstagramPost(params.id);
      return { success: true, message: "Instagram post deleted" };
    },
    { params: ContentIdParams }
  )
  .get("/videos/all", async () => {
    const videos = await ContentService.getShoppableVideos(true);
    return { success: true, data: videos };
  })
  .post(
    "/videos",
    async ({ body }) => {
      const video = await ContentService.createShoppableVideo(body);
      return { success: true, data: video };
    },
    { body: CreateShoppableVideoBody }
  )
  .patch(
    "/videos/:id",
    async ({ params, body }) => {
      const video = await ContentService.updateShoppableVideo(params.id, body);
      return { success: true, data: video };
    },
    { params: ContentIdParams, body: UpdateShoppableVideoBody }
  )
  .delete(
    "/videos/:id",
    async ({ params }) => {
      await ContentService.deleteShoppableVideo(params.id);
      return { success: true, message: "Shoppable video deleted" };
    },
    { params: ContentIdParams }
  )
  .get("/featured/all", async () => {
    const featured = await ContentService.getFeaturedProducts(true);
    return { success: true, data: featured };
  })
  .post(
    "/featured",
    async ({ body }) => {
      const featured = await ContentService.createFeaturedProduct(body);
      return { success: true, data: featured };
    },
    { body: CreateFeaturedProductBody }
  )
  .patch(
    "/featured/:id",
    async ({ params, body }) => {
      const featured = await ContentService.updateFeaturedProduct(params.id, body);
      return { success: true, data: featured };
    },
    { params: ContentIdParams, body: UpdateFeaturedProductBody }
  )
  .delete(
    "/featured/:id",
    async ({ params }) => {
      await ContentService.deleteFeaturedProduct(params.id);
      return { success: true, message: "Featured product deleted" };
    },
    { params: ContentIdParams }
  );

export const contentRoutes = new Elysia()
  .use(publicContentRoutes)
  .use(adminContentRoutes);
