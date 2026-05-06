import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { errorHandler } from "@/lib/errors";
import { health } from "@/modules/health";
import { authRoutes } from "@/modules/auth";
import { adminRoutes } from "@/modules/admin";
import { productRoutes } from "@/modules/products";
import { collectionRoutes } from "@/modules/collections";
import { cartRoutes } from "@/modules/cart";
import { orderRoutes } from "@/modules/orders";
import { contentRoutes } from "@/modules/content";
import { couponRoutes } from "@/modules/coupons";
import { shippingRoutes } from "@/modules/shipping";
import { colorRoutes } from "@/modules/colors";
import { abayaLengthRoutes } from "@/modules/abaya-lengths";
import { bodySizeRoutes } from "@/modules/body-sizes";
import { customerReviewRoutes } from "@/modules/customer-reviews";
import { uploadRoutes } from "@/modules/upload";
import { searchRoutes } from "@/modules/search";
import { wishlistRoutes } from "@/modules/wishlist";
import { addressRoutes } from "@/modules/addresses";

const app = new Elysia()
  .use(errorHandler)
  .use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") || ["https://designbyshoug.com", "https://dashboard.designbyshoug.com"],
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "DesignByShoug API",
          version: "1.0.0",
          description: "Backend API for DesignByShoug Abaya E-commerce Platform",
        },
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Auth", description: "Customer authentication" },
          { name: "Admin", description: "Admin authentication and management" },
          { name: "Products", description: "Product management" },
          { name: "Collections", description: "Collection management" },
          { name: "Cart", description: "Shopping cart" },
          { name: "Orders", description: "Order management" },
          { name: "Content", description: "CMS content (banners, instagram, videos)" },
          { name: "Coupons", description: "Coupon management" },
          { name: "Shipping", description: "Shipping zones" },
          { name: "Colors", description: "Color management" },
          { name: "AbayaLengths", description: "Abaya length management" },
          { name: "BodySizes", description: "Body size management" },
          { name: "CustomerReviews", description: "Customer video reviews" },
          { name: "Search", description: "Search products and collections" },
        ],
      },
    })
  )
  .use(health)
  .use(authRoutes)
  .use(adminRoutes)
  .use(productRoutes)
  .use(collectionRoutes)
  .use(cartRoutes)
  .use(orderRoutes)
  .use(contentRoutes)
  .use(couponRoutes)
  .use(shippingRoutes)
  .use(colorRoutes)
  .use(abayaLengthRoutes)
  .use(bodySizeRoutes)
  .use(customerReviewRoutes)
  .use(uploadRoutes)
  .use(searchRoutes)
  .use(wishlistRoutes)
  .use(addressRoutes)
  .listen(process.env.PORT || 3001);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
