import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { NewArrivalsClient } from "./NewArrivalsClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/new-arrivals",
    titleEn: "New Arrivals | Design By Shoug",
    titleAr: "وصل حديثاً | ديزاين باي شوق",
    descEn: "Discover the latest arrivals at Design By Shoug. New luxury abayas and elegant fashion pieces added regularly.",
    descAr: "اكتشفي أحدث الوصولات في ديزاين باي شوق. عبايات فاخرة وتصاميم أنيقة جديدة بإستمرار.",
    keywordsEn: "new arrivals, latest fashion, new abayas, Design By Shoug",
    keywordsAr: "وصل حديثاً, أحدث الأزياء, عبايات جديدة, ديزاين باي شوق",
  });
}

const API_URL = process.env.API_URL || "http://localhost:3001";

export default async function NewArrivalsPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  const res = await fetch(
    `${API_URL}/products?sort=newest&limit=24&include=images`,
    { next: { revalidate: 300 } }
  );
  const json = await res.json();
  const products = json.success ? json.data?.products || [] : [];
  const total = json.data?.pagination?.total || 0;

  return <NewArrivalsClient initialProducts={products} initialTotal={total} />;
}
