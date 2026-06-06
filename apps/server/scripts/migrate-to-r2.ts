/**
 * Utility: Replaces remaining res.cloudinary.com URLs in the database
 * with cdn.designbyshoug.com URLs.
 *
 * Run: bun run scripts/migrate-to-r2.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";

const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://cdn.designbyshoug.com";

function cloudinaryUrlToKey(url: string): string {
  const match = url.match(/\/(?:image|video)\/upload\/(?:v\d+\/)?(.+)$/);
  if (match) return match[1];
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").slice(3).join("/").replace(/^v\d+\//, "");
  } catch {
    return url;
  }
}

function replaceCloudinaryUrl(url: string): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return `${PUBLIC_URL}/${cloudinaryUrlToKey(url)}`;
}

async function main() {
  console.log("=".repeat(60));
  console.log("  Cloudinary → R2: Updating database URLs");
  console.log("=".repeat(60), "\n");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  let updated = 0;

  const productImages = await prisma.productImage.findMany();
  for (const img of productImages) {
    if (img.url?.includes("res.cloudinary.com")) {
      await prisma.productImage.update({ where: { id: img.id }, data: { url: replaceCloudinaryUrl(img.url) } });
      updated++;
    }
  }

  const sizeGuideImages = await prisma.sizeGuideImage.findMany();
  for (const img of sizeGuideImages) {
    if (img.url?.includes("res.cloudinary.com")) {
      await prisma.sizeGuideImage.update({ where: { id: img.id }, data: { url: replaceCloudinaryUrl(img.url) } });
      updated++;
    }
  }

  const banners = await prisma.banner.findMany();
  for (const b of banners) {
    const data: Record<string, string> = {};
    if (b.imageUrl?.includes("res.cloudinary.com")) data.imageUrl = replaceCloudinaryUrl(b.imageUrl);
    if (b.imageMobileUrl?.includes("res.cloudinary.com")) data.imageMobileUrl = replaceCloudinaryUrl(b.imageMobileUrl);
    if (Object.keys(data).length > 0) {
      await prisma.banner.update({ where: { id: b.id }, data });
      updated += Object.keys(data).length;
    }
  }

  const instagramPosts = await prisma.instagramPost.findMany();
  for (const p of instagramPosts) {
    const data: Record<string, string> = {};
    if (p.imageUrl?.includes("res.cloudinary.com")) data.imageUrl = replaceCloudinaryUrl(p.imageUrl);
    if (p.thumbnailUrl?.includes("res.cloudinary.com")) data.thumbnailUrl = replaceCloudinaryUrl(p.thumbnailUrl);
    if (Object.keys(data).length > 0) {
      await prisma.instagramPost.update({ where: { id: p.id }, data });
      updated += Object.keys(data).length;
    }
  }

  const videos = await prisma.shoppableVideo.findMany();
  for (const v of videos) {
    const data: Record<string, string> = {};
    if (v.videoUrl?.includes("res.cloudinary.com")) data.videoUrl = replaceCloudinaryUrl(v.videoUrl);
    if (v.thumbnailUrl?.includes("res.cloudinary.com")) data.thumbnailUrl = replaceCloudinaryUrl(v.thumbnailUrl);
    if (Object.keys(data).length > 0) {
      await prisma.shoppableVideo.update({ where: { id: v.id }, data });
      updated += Object.keys(data).length;
    }
  }

  const collections = await prisma.collection.findMany();
  for (const c of collections) {
    if (c.imageUrl?.includes("res.cloudinary.com")) {
      await prisma.collection.update({ where: { id: c.id }, data: { imageUrl: replaceCloudinaryUrl(c.imageUrl!) } });
      updated++;
    }
  }

  const users = await prisma.user.findMany({ where: { avatarUrl: { contains: "res.cloudinary.com" } } });
  for (const u of users) {
    if (u.avatarUrl?.includes("res.cloudinary.com")) {
      await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: replaceCloudinaryUrl(u.avatarUrl!) } });
      updated++;
    }
  }

  console.log(`  ✅ Updated ${updated} URL fields\n`);
  await prisma.$disconnect();

  console.log("=".repeat(60));
  console.log("  Done!");
  console.log("=".repeat(60));
}

main().catch(console.error);
