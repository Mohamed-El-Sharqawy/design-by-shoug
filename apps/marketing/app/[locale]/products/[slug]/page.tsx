import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@repo/types";
import { ProductDetail } from "./ProductDetail";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?isActive=true&limit=100`);
    if (!res.ok) return [];
    const data = await res.json();
    const slugs: string[] = (data.data?.products || []).map((p: { slug: string }) => p.slug);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data as Product;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [locale, product] = await Promise.all([getLocale(), getProduct(slug)]);
  if (!product) return { title: "Product Not Found" };

  const title =
    locale === "ar"
      ? product.metaTitleAr || product.nameAr
      : product.metaTitleEn || product.nameEn;
  const description =
    locale === "ar"
      ? product.metaDescAr || product.descriptionAr
      : product.metaDescEn || product.descriptionEn;

  return {
    title: `${title} | Design By Shoug`,
    description: description || undefined,
    openGraph: {
      title: `${title} | Design By Shoug`,
      description: description || undefined,
      images: product.images?.[0] || "",
      url: `https://designbyshoug.com/${locale}/products/${product.slug}`,
      type: "website",
    },
    twitter: {
      title: `${title} | Design By Shoug`,
      description: description || undefined,
      images: product.images?.[0] || "",
      card: "summary_large_image",
    },
    alternates: {
      canonical: `https://designbyshoug.com/${locale}/products/${product.slug}`,
    },
  };
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
  const collectionId = product.collections?.[0]?.collectionId;
  if (!collectionId) return [];
  try {
    const params = new URLSearchParams({ isActive: "true", limit: "4", collectionId });
    const res = await fetch(`${API_URL}/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.products || []).filter((p: Product) => p.id !== product.id).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [locale, t, product] = await Promise.all([
    getLocale(),
    getTranslations("Product"),
    getProduct(slug),
  ]);

  setRequestLocale(locale);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);

  return <ProductDetail product={product} locale={locale} relatedProducts={relatedProducts} />;
}
