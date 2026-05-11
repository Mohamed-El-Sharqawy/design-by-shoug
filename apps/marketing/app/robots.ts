import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/en/cart",
          "/en/checkout",
          "/en/account",
          "/en/search",
          "/en/order",
          "/en/login",
          "/en/register",
          "/en/forgot-password",
          "/en/reset-password",
          "/en/verify-email",
          "/ar/cart",
          "/ar/checkout",
          "/ar/account",
          "/ar/search",
          "/ar/order",
          "/ar/login",
          "/ar/register",
          "/ar/forgot-password",
          "/ar/reset-password",
          "/ar/verify-email",
          "/api/",
        ],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/en/sitemap.xml`,
      `${siteUrl}/ar/sitemap.xml`,
    ],
  };
}
