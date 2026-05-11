import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@repo/types";
import { ProductDetail } from "./ProductDetail";
import { routing } from "@/i18n/routing";

const API_URL = process.env.API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?isActive=true&limit=100`, {
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products: { slug: string; isActive: boolean }[] = data.data?.products || [];

    return routing.locales.flatMap((locale) =>
      products
        .filter((p) => p.slug && p.isActive)
        .map((p) => ({ locale, slug: p.slug }))
    );
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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const isAr = locale === "ar";
  const title = isAr
    ? product.metaTitleAr || product.nameAr
    : product.metaTitleEn || product.nameEn;
  const description = isAr
    ? product.metaDescAr || product.shortDescAr || product.descriptionAr
    : product.metaDescEn || product.shortDescEn || product.descriptionEn;

  const canonicalUrl = `${SITE_URL}/${locale}/products/${product.slug}`;
  const imageUrl = product.images?.[0]?.url
    ? (product.images[0].url.startsWith("http") ? product.images[0].url : `${SITE_URL}${product.images[0].url}`)
    : `${SITE_URL}/opengraph-image.png`;

  const productName = isAr ? product.nameAr : product.nameEn;
  const baseKeywords = isAr
    ? "عباية, فاخرة, أنيقة, الإمارات, دبي, ديزاين باي شوق"
    : "abaya, luxury, elegant, UAE, Dubai, Design By Shoug";
  const keywords = [productName, baseKeywords].join(", ");

  return {
    title: `${title} | Design By Shoug`,
    description: description || undefined,
    keywords,
    authors: [{ name: "Design By Shoug" }],
    publisher: "Design By Shoug",
    creator: "Design By Shoug",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${title} | Design By Shoug`,
      description: description || undefined,
      url: canonicalUrl,
      siteName: "Design By Shoug",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: productName,
        },
      ],
      type: "website",
      locale: isAr ? "ar_AE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Design By Shoug`,
      description: description || undefined,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${SITE_URL}/en/products/${product.slug}`,
        ar: `${SITE_URL}/ar/products/${product.slug}`,
        "en-US": `${SITE_URL}/en/products/${product.slug}`,
        "ar-SA": `${SITE_URL}/ar/products/${product.slug}`,
        "x-default": `${SITE_URL}/en/products/${product.slug}`,
      },
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [t, product] = await Promise.all([
    getTranslations("Product"),
    getProduct(slug),
  ]);

  setRequestLocale(locale);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);

  const isAr = locale === "ar";
  const productName = isAr ? product.nameAr : product.nameEn;
  const productDescription = isAr
    ? product.shortDescAr || product.descriptionAr
    : product.shortDescEn || product.descriptionEn;
  const imageUrl = product.images?.[0]?.url
    ? (product.images[0].url.startsWith("http") ? product.images[0].url : `${SITE_URL}${product.images[0].url}`)
    : `${SITE_URL}/opengraph-image.png`;
  const productUrl = `${SITE_URL}/${locale}/products/${product.slug}`;
  const price = product.salePrice ?? product.basePrice;
  const availabilityStatus = product.variants?.some((v) => v.stock > 0)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    description: productDescription || undefined,
    image: imageUrl,
    url: productUrl,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Design By Shoug",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "AED",
      price: `${price}`,
      priceValidUntil: "2027-12-31",
      availability: availabilityStatus,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Design By Shoug",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense>
        <ProductDetail product={product} locale={locale} relatedProducts={relatedProducts} />
      </Suspense>
    </>
  );
}
