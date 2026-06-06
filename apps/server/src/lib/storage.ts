import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

export type UploadFolder =
  | "products"
  | "banners"
  | "instagram"
  | "videos"
  | "size-guides"
  | "avatars"
  | "reviews";

export interface UploadResult {
  key: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: string;
}

function buildKey(folder: UploadFolder, filename: string): string {
  return `designbyshoug/${folder}/${filename}`;
}

export async function uploadImage(
  file: Buffer,
  folder: UploadFolder,
  options?: { filename?: string }
): Promise<UploadResult> {
  const ext = options?.filename?.split(".").pop() || "png";
  const name = options?.filename?.replace(/\.[^.]+$/, "") || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = buildKey(folder, `${name}.${ext}`);

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
    resourceType: "image",
  };
}

export async function uploadVideo(
  file: Buffer,
  folder: UploadFolder = "videos",
  options?: { filename?: string }
): Promise<UploadResult> {
  const ext = options?.filename?.split(".").pop() || "mp4";
  const name = options?.filename?.replace(/\.[^.]+$/, "") || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = buildKey(folder, `${name}.${ext}`);

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: `video/${ext}`,
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
    resourceType: "video",
  };
}

export async function deleteMedia(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export { r2, BUCKET, PUBLIC_URL };
