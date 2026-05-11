import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Collection, Product } from "@repo/types";
import { CollectionProductBrowser } from "./CollectionProductBrowser";
import { routing } from "@/i18n/routing";

const API_URL = process.env.API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

type SortOption = "newest" | "price_asc" | "price_desc" | "best_selling" | "name_asc";
const VALID_SORTS: SortOption[] = ["newest", "price_asc", "price_desc", "best_selling", "name_asc"];

export const revalidate = 900;
export const dynamicParams = true;

const VIRTUAL_SLUGS = ["all", "featured"];

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/collections`, {
      cache: "force-cache",
    });
    if (!res.ok) {
      return routing.locales.flatMap((locale) =>
        VIRTUAL_SLUGS.map((slug) => ({ locale, slug }))
      );
    }
    const data = await res.json();
    const collections: { slug: string; isActive: boolean }[] = data.data || [];
    const dbSlugs = collections
      .filter((c) => c.slug && c.isActive)
      .map((c) => c.slug);

    return routing.locales.flatMap((locale) =>
      [...dbSlugs, ...VIRTUAL_SLUGS].map((slug) => ({ locale, slug }))
    );
  } catch {
    return routing.locales.flatMap((locale) =>
      VIRTUAL_SLUGS.map((slug) => ({ locale, slug }))
    );
  }
}

async function getCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_URL}/collections?showAll=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getCollection(slug: string) {
  try {
    const res = await fetch(`${API_URL}/collections/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data as Collection & {
      products: { product: Product; sortOrder: number }[];
    } | null;
  } catch {
    return null;
  }
}

function buildSortParams(s: SortOption): { sortBy: string; sortOrder: string } {
  switch (s) {
    case "newest":
      return { sortBy: "createdAt", sortOrder: "desc" };
    case "price_asc":
      return { sortBy: "price", sortOrder: "asc" };
    case "price_desc":
      return { sortBy: "price", sortOrder: "desc" };
    case "best_selling":
      return { sortBy: "soldCount", sortOrder: "desc" };
    case "name_asc":
      return { sortBy: "name", sortOrder: "asc" };
  }
}

async function getFilteredProducts(filters: {
  collectionId?: string;
  isFeatured?: boolean;
  sort: SortOption;
  minPrice?: string;
  maxPrice?: string;
  page: number;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const params = new URLSearchParams({ isActive: "true", limit: "20" });
    if (filters.collectionId) params.set("collectionId", filters.collectionId);
    if (filters.isFeatured) params.set("isFeatured", "true");
    if (filters.page > 1) params.set("page", String(filters.page));
    const { sortBy, sortOrder } = buildSortParams(filters.sort);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    const res = await fetch(`${API_URL}/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { products: [], total: 0 };
    const data = await res.json();
    return { products: data.data?.products || [], total: data.data?.pagination?.total || 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

function resolveFilters(
  searchParams: Record<string, string | string[] | undefined>,
  allCollections: Collection[],
  initialCollectionId?: string,
  initialIsFeatured?: boolean,
) {
  const urlSort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const sort: SortOption = VALID_SORTS.includes(urlSort as SortOption) ? (urlSort as SortOption) : "newest";

  const urlCollection = typeof searchParams.collection === "string" ? searchParams.collection : undefined;
  let collectionId: string | undefined;
  let isFeatured = initialIsFeatured;

  if (!urlCollection) {
    collectionId = initialCollectionId;
  } else if (urlCollection === "all") {
    collectionId = undefined;
    isFeatured = undefined;
  } else {
    const found = allCollections.find((c) => c.slug === urlCollection);
    collectionId = found?.id;
  }

  const minPrice = typeof searchParams.minPrice === "string" ? searchParams.minPrice : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : undefined;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) || 1 : 1;

  return { collectionId, isFeatured, sort, minPrice, maxPrice, page };
}

const SPECIAL_SLUG_META: Record<
  string,
  Record<"en" | "ar", { title: string; description: string }>
> = {
  all: {
    en: {
      title: "Shop All Abayas in UAE | Design By Shoug",
      description:
        "Explore the full Design By Shoug catalogue — handcrafted luxury abayas, modern cuts and timeless silhouettes shipped across the UAE and GCC.",
    },
    ar: {
      title: "تسوّقي جميع العبايات في الإمارات | ديزاين باي شوق",
      description:
        "استعرضي الكتالوج الكامل لديزاين باي شوق — عبايات فاخرة مصنوعة بعناية، بأساليب عصرية وخامات راقية، توصيل في الإمارات ودول الخليج.",
    },
  },
  featured: {
    en: {
      title: "Featured Abayas — Editor's Picks | Design By Shoug",
      description:
        "Discover our curated edit of standout abayas — statement pieces chosen for their craftsmanship, elegance and modern Saudi-Gulf aesthetic.",
    },
    ar: {
      title: "عبايات مميزة — اختيارات المحررة | ديزاين باي شوق",
      description:
        "اكتشفي أبرز عباياتنا المختارة بعناية — قطع استثنائية تجمع بين الحرفية الرفيعة والأناقة العصرية بلمسة خليجية أصيلة.",
    },
  },
};

function buildDefaultTitle(name: string, isAr: boolean): string {
  if (isAr) {
    return `عبايات ${name} في الإمارات | ديزاين باي شوق`;
  }
  const candidate = `${name} Abayas in UAE | Design By Shoug`;
  return candidate.length <= 60 ? candidate : `${name} | Design By Shoug`;
}

function buildDefaultDescription(name: string, isAr: boolean): string {
  if (isAr) {
    return `تصفحي مجموعة ${name} من ديزاين باي شوق — عبايات فاخرة بتصاميم عصرية وخامات عالية الجودة، مثالية للمرأة الخليجية الأنيقة.`;
  }
  const desc = `Shop ${name} by Design By Shoug — luxury abayas with premium fabrics and modern silhouettes, crafted for the discerning woman.`;
  return desc.length <= 155 ? desc : desc.slice(0, 152) + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const canonical = `${SITE_URL}/${locale}/collections/${slug}`;
  const isAr = locale === "ar";
  const lang: "en" | "ar" = isAr ? "ar" : "en";

  if (SPECIAL_SLUG_META[slug]) {
    const m = SPECIAL_SLUG_META[slug][lang];
    return {
      title: m.title,
      description: m.description,
      authors: [{ name: "Design By Shoug" }],
      publisher: "Design By Shoug",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: m.title,
        description: m.description,
        url: canonical,
        siteName: "Design By Shoug",
        type: "website",
        locale: isAr ? "ar_AE" : "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: m.title,
        description: m.description,
      },
      alternates: {
        canonical,
        languages: {
          en: `${SITE_URL}/en/collections/${slug}`,
          ar: `${SITE_URL}/ar/collections/${slug}`,
          "en-US": `${SITE_URL}/en/collections/${slug}`,
          "ar-SA": `${SITE_URL}/ar/collections/${slug}`,
          "x-default": `${SITE_URL}/en/collections/${slug}`,
        },
      },
    };
  }

  try {
    const res = await fetch(`${API_URL}/collections/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const fallbackTitle = isAr
        ? "مجموعة فاخرة | ديزاين باي شوق"
        : "Luxury Abaya Collection | Design By Shoug";
      return { title: fallbackTitle, alternates: { canonical } };
    }

    const data = await res.json();
    const collection = data.data as Collection | null;
    if (!collection) {
      const fallbackTitle = isAr
        ? "مجموعة فاخرة | ديزاين باي شوق"
        : "Luxury Abaya Collection | Design By Shoug";
      return { title: fallbackTitle, alternates: { canonical } };
    }

    const collectionName = isAr ? collection.nameAr : collection.nameEn;
    const metaTitle = isAr
      ? collection.metaTitleAr || buildDefaultTitle(collectionName, true)
      : collection.metaTitleEn || buildDefaultTitle(collectionName, false);
    const metaDesc = isAr
      ? collection.metaDescAr || buildDefaultDescription(collectionName, true)
      : collection.metaDescEn || buildDefaultDescription(collectionName, false);

    const imageUrl = collection.imageUrl
      ? (collection.imageUrl.startsWith("http") ? collection.imageUrl : `${SITE_URL}${collection.imageUrl}`)
      : `${SITE_URL}/opengraph-image.png`;

    return {
      title: metaTitle,
      description: metaDesc,
      authors: [{ name: "Design By Shoug" }],
      publisher: "Design By Shoug",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        url: canonical,
        siteName: "Design By Shoug",
        images: collection.imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: collectionName }] : undefined,
        type: "website",
        locale: isAr ? "ar_AE" : "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDesc,
        images: collection.imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical,
        languages: {
          en: `${SITE_URL}/en/collections/${slug}`,
          ar: `${SITE_URL}/ar/collections/${slug}`,
          "en-US": `${SITE_URL}/en/collections/${slug}`,
          "ar-SA": `${SITE_URL}/ar/collections/${slug}`,
          "x-default": `${SITE_URL}/en/collections/${slug}`,
        },
      },
    };
  } catch {
    const fallbackTitle = isAr
      ? "مجموعة فاخرة | ديزاين باي شوق"
      : "Luxury Abaya Collection | Design By Shoug";
    return { title: fallbackTitle, alternates: { canonical } };
  }
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, slug }, sp, t, allCollections] = await Promise.all([
    params,
    searchParams,
    getTranslations("CollectionsPage"),
    getCollections(),
  ]);

  setRequestLocale(locale);
  const isAll = slug === "all";
  const isFeatured = slug === "featured";

  if (isAll || isFeatured) {
    const filters = resolveFilters(sp, allCollections, undefined, isFeatured);
    const initial = await getFilteredProducts(filters);
    const isFeaturedPage = isFeatured || filters.isFeatured;
    const isAr = locale === "ar";

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      name: isFeaturedPage
        ? (isAr ? "عبايات مميزة | ديزاين باي شوق" : "Featured Abayas | Design By Shoug")
        : (isAr ? "جميع العبايات | ديزاين باي شوق" : "All Abayas | Design By Shoug"),
      url: `${SITE_URL}/${locale}/collections/${slug}`,
      isPartOf: {
        "@type": "WebSite",
        name: "Design By Shoug",
        url: SITE_URL,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Suspense>
          <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12 sm:mb-16">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wide">
                  {isFeaturedPage ? t("featured") : t("allProducts")}
                </h1>
                <p className="mt-4 text-sm text-[#999] font-light tracking-wide">
                  {isFeaturedPage ? t("featuredDesc") : t("allProductsDesc")}
                </p>
                <div className="mt-6 w-16 h-px bg-[#8B7355]" />
              </div>
              <CollectionProductBrowser
                initialProducts={initial.products}
                initialTotal={initial.total}
                allCollections={allCollections}
                locale={locale}
                isFeatured={isFeaturedPage}
              />
            </div>
          </section>
        </Suspense>
      </>
    );
  }

  const collection = await getCollection(slug);
  if (!collection) notFound();

  const name = locale === "ar" ? collection.nameAr : collection.nameEn;
  const description = locale === "ar" ? collection.descriptionAr : collection.descriptionEn;
  const filters = resolveFilters(sp, allCollections, collection.id);
  const initial = await getFilteredProducts(filters);

  const imageUrl = collection.imageUrl
    ? (collection.imageUrl.startsWith("http") ? collection.imageUrl : `${SITE_URL}${collection.imageUrl}`)
    : `${SITE_URL}/opengraph-image.png`;

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    name,
    description: description || undefined,
    image: imageUrl,
    url: `${SITE_URL}/${locale}/collections/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Design By Shoug",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense>
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-16">
              <a
                href={`/${locale}/collections`}
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors font-light mb-6"
              >
                <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t("allCollections")}
              </a>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wide">
                {name}
              </h1>
              {description && (
                <p className="mt-4 text-sm text-[#999] font-light tracking-wide max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
              <div className="mt-6 w-16 h-px bg-[#8B7355]" />
            </div>

            <CollectionProductBrowser
              initialProducts={initial.products}
              initialTotal={initial.total}
              collectionId={collection.id}
              allCollections={allCollections}
              locale={locale}
            />
          </div>
        </section>
      </Suspense>
    </>
  );
}
