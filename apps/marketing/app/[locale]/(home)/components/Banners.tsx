import type { Banner } from "@repo/types";
import { BannerCarousel } from "./BannerCarousel";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_URL}/content/banners`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function Banners() {
  const banners = await getBanners();

  if (banners.length === 0) {
    return null;
  }

  return <BannerCarousel banners={banners} />;
}
