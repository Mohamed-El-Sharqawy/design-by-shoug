import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "../../context";

export type UploadFolder =
  | "products"
  | "banners"
  | "instagram"
  | "videos"
  | "size-guides"
  | "avatars";

export type VideoUploadFolder = "videos" | "reviews";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export function useUploadImage() {
  const client = useApiClient();

  return useMutation({
    mutationFn: async ({
      file,
      folder,
    }: {
      file: File;
      folder: UploadFolder;
    }): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      return client.upload<UploadResult>("/upload/image", formData);
    },
  });
}

export function useUploadVideo() {
  const client = useApiClient();

  return useMutation({
    mutationFn: async ({
      file,
      folder,
    }: {
      file: File;
      folder: VideoUploadFolder;
    }): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      return client.upload<UploadResult>("/upload/video", formData);
    },
  });
}
