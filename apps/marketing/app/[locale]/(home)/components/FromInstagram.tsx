import { getTranslations } from "next-intl/server";
import type { InstagramPost } from "@repo/types";
import { InstagramGrid } from "./InstagramGrid";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const res = await fetch(`${API_URL}/content/instagram`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function FromInstagram() {
  const [posts, t] = await Promise.all([
    getInstagramPosts(),
    getTranslations("Home"),
  ]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <InstagramGrid
      posts={posts}
      translations={{
        sectionTitle: t("fromInstagram"),
        followUs: t("followUs"),
      }}
    />
  );
}
