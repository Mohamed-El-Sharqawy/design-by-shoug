import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

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

async function keyExistsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function downloadAndUploadToR2(url: string, key: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

async function cleanupOrphanedR2Files(cloudinaryKeys: Set<string>) {
  console.log("\n🧹 Step 2: Cleaning orphaned files in R2...\n");

  let orphaned: string[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await r2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: "designbyshoug/",
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of result.Contents ?? []) {
      if (obj.Key && !cloudinaryKeys.has(obj.Key)) {
        orphaned.push(obj.Key);
      }
    }

    continuationToken = result.NextContinuationToken;
  } while (continuationToken);

  if (orphaned.length === 0) {
    console.log("  ✅ No orphaned files found\n");
    return;
  }

  for (let i = 0; i < orphaned.length; i += 1000) {
    const batch = orphaned.slice(i, i + 1000);
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map((k) => ({ Key: k })) },
      })
    );
  }

  console.log(`  🗑️  Deleted ${orphaned.length} orphaned files from R2\n`);
}

async function migrateFilesFromCloudinary() {
  console.log("\n📁 Step 1: Downloading files from Cloudinary → Uploading to R2...\n");

  const cloudinaryKeys = new Set<string>();
  let nextCursor: string | undefined;
  let uploaded = 0;
  let skipped = 0;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "designbyshoug/",
      max_results: 100,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources) {
      const key = cloudinaryUrlToKey(resource.secure_url);
      cloudinaryKeys.add(key);

      const exists = await keyExistsInR2(key);
      if (exists) {
        skipped++;
        continue;
      }

      try {
        console.log(`  ⬇ ${key}`);
        await downloadAndUploadToR2(resource.secure_url, key);
        console.log(`  ⬆ ✓`);
        uploaded++;
      } catch (err) {
        console.error(`  ✗ Failed: ${key}`, err);
      }
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`\n  📊 Uploaded: ${uploaded} | Skipped (already in R2): ${skipped}\n`);

  await cleanupOrphanedR2Files(cloudinaryKeys);
}

async function updateDatabaseUrls() {
  console.log("🗄️  Step 3: Updating database URLs...\n");
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

  console.log(`  ✅ Updated ${updated} URL fields in database\n`);
  await prisma.$disconnect();
}

async function main() {
  console.log("=".repeat(60));
  console.log("  Cloudinary → Cloudflare R2 Migration");
  console.log("=".repeat(60));

  await migrateFilesFromCloudinary();
  await updateDatabaseUrls();

  console.log("=".repeat(60));
  console.log("  Migration complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
