import { HeaderClient } from "./HeaderClient";

const API_URL = process.env.API_URL || "http://localhost:3001";

interface HeaderCollection {
  slug: string;
  nameEn: string;
  nameAr: string;
}

async function getHeaderCollections(): Promise<HeaderCollection[]> {
  try {
    const res = await fetch(`${API_URL}/collections/header`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function Header() {
  const headerCollections = await getHeaderCollections();
  return <HeaderClient headerCollections={headerCollections} />;
}
