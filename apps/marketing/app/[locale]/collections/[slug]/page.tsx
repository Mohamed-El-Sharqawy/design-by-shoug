import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Collection, Product } from "@repo/types";
import { CollectionProductBrowser } from "./CollectionProductBrowser";

const API_URL = process.env.API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

type SortOption = "newest" | "price_asc" | "price_desc" | "best_selling" | "name_asc";
const VALID_SORTS: SortOption[] = ["newest", "price_asc", "price_desc", "best_selling", "name_asc"];

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

interface ProductFilters {
  collectionId?: string;
  isFeatured?: boolean;
  sort: SortOption;
  minPrice?: string;
  maxPrice?: string;
  page: number;
}

async function getFilteredProducts(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
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

function resolveServerFilters(
  searchParams: Record<string, string | string[] | undefined>,
  allCollections: Collection[],
  initialCollectionId?: string
) {
  const urlSort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const sort: SortOption = VALID_SORTS.includes(urlSort as SortOption) ? (urlSort as SortOption) : "newest";

  const urlCollection = typeof searchParams.collection === "string" ? searchParams.collection : undefined;
  let collectionId: string | undefined;
  if (!urlCollection) {
    collectionId = initialCollectionId;
  } else if (urlCollection === "all") {
    collectionId = undefined;
  } else {
    const found = allCollections.find((c) => c.slug === urlCollection);
    collectionId = found?.id;
  }

  const minPrice = typeof searchParams.minPrice === "string" ? searchParams.minPrice : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : undefined;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) || 1 : 1;
  const isFeatured = searchParams.featured === "true" ? true : undefined;

  return { collectionId, isFeatured, sort, minPrice, maxPrice, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const canonical = `${SITE_URL}/${locale}/collections/${slug}`;

  if (slug === "all") {
    return {
      title: "All Products | Design By Shoug",
      description: "Browse our complete collection of luxury abayas",
      alternates: { canonical },
    };
  }

  if (slug === "featured") {
    return {
      title: "Featured Pieces | Design By Shoug",
      description: "Our handpicked selection of standout abayas",
      alternates: { canonical },
    };
  }

  try {
    const res = await fetch(`${API_URL}/collections/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Collection | Design By Shoug", alternates: { canonical } };
    const data = await res.json();
    const collection = data.data as Collection | null;
    if (!collection) return { title: "Collection | Design By Shoug", alternates: { canonical } };

    const isAr = locale === "ar";
    const metaTitle = isAr
      ? collection.metaTitleAr || `${collection.nameAr} | ديزاين باي شوق`
      : collection.metaTitleEn || `${collection.nameEn} | Design By Shoug`;
    const metaDesc = isAr
      ? collection.metaDescAr || collection.descriptionAr || `تصفحي مجموعة ${collection.nameAr} من العبايات الفاخرة`
      : collection.metaDescEn || collection.descriptionEn || `Browse our ${collection.nameEn} collection of luxury abayas`;

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: { canonical },
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        url: canonical,
        images: collection.imageUrl ? [{ url: collection.imageUrl }] : undefined,
      },
      twitter: {
        title: metaTitle,
        description: metaDesc,
      },
    };
  } catch {
    return { title: "Collection | Design By Shoug", alternates: { canonical } };
  }
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp, locale, t, allCollections] = await Promise.all([
    params,
    searchParams,
    getLocale(),
    getTranslations("CollectionsPage"),
    getCollections(),
  ]);

  setRequestLocale(locale);
  const isAll = slug === "all";

  if (isAll) {
    const filters = resolveServerFilters(sp, allCollections);
    const initial = await getFilteredProducts(filters);
    const isFeaturedPage = filters.isFeatured;

    return (
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
          <Suspense>
            <CollectionProductBrowser
              initialProducts={initial.products}
              initialTotal={initial.total}
              allCollections={allCollections}
              locale={locale}
              isFeatured={filters.isFeatured}
            />
          </Suspense>
        </div>
      </section>
    );
  }

  const collection = await getCollection(slug);
  if (!collection) notFound();

  const name = locale === "ar" ? collection.nameAr : collection.nameEn;
  const description = locale === "ar" ? collection.descriptionAr : collection.descriptionEn;
  const filters = resolveServerFilters(sp, allCollections, collection.id);
  const initial = await getFilteredProducts(filters);

  return (
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

        <Suspense>
          <CollectionProductBrowser
            initialProducts={initial.products}
            initialTotal={initial.total}
            collectionId={collection.id}
            allCollections={allCollections}
            locale={locale}
          />
        </Suspense>
      </div>
    </section>
  );
}
