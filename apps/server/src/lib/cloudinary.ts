import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadFolder =
  | "products"
  | "banners"
  | "instagram"
  | "videos"
  | "size-guides"
  | "avatars";

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

export async function uploadImage(
  file: Buffer | string,
  folder: UploadFolder,
  options?: {
    publicId?: string;
    transformation?: object;
  }
): Promise<UploadResult> {
  const uploadOptions = {
    folder: `designbyshoug/${folder}`,
    resource_type: "image" as const,
    ...options,
  };

  if (Buffer.isBuffer(file)) {
    const base64 = `data:image/png;base64,${file.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, uploadOptions);
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  } else {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  }
}

export async function uploadVideo(
  file: Buffer | string,
  folder: UploadFolder = "videos"
): Promise<UploadResult> {
  const uploadOptions = {
    folder: `designbyshoug/${folder}`,
    resource_type: "video" as const,
  };

  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:video/mp4;base64,${file.toString("base64")}`,
    uploadOptions
  );

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
  };
}

export async function deleteMedia(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop || "fill",
        quality: options?.quality || "auto",
        fetch_format: options?.format || "auto",
      },
    ],
  });
}

export { cloudinary };
