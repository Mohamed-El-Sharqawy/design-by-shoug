"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { useInfiniteProducts, type ProductFilters } from "@repo/api-client";
import type { Collection, Product } from "@repo/types";

type SortOption = "newest" | "price_asc" | "price_desc" | "best_selling" | "name_asc";
const VALID_SORTS: SortOption[] = ["newest", "price_asc", "price_desc", "best_selling", "name_asc"];

interface CollectionProductBrowserProps {
  initialProducts: Product[];
  initialTotal: number;
  collectionId?: string;
  isFeatured?: boolean;
  allCollections: Collection[];
  locale: string;
}

function BottomDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-70 sm:hidden" onClick={onClose} />}
      <div
        className={`fixed inset-x-0 bottom-0 z-80 sm:hidden bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E8E4DF]">
          <h3 className="text-sm tracking-widest uppercase text-[#1A1A1A] font-light">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#999] hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export function CollectionProductBrowser({
  initialProducts,
  initialTotal,
  collectionId: initialCollectionId,
  isFeatured: initialIsFeatured,
  allCollections,
  locale,
}: CollectionProductBrowserProps) {
  const t = useTranslations("CollectionsPage");
  const isRtl = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const collectionSlugToId = useCallback(
    (slug: string) => allCollections.find((c) => c.slug === slug)?.id ?? null,
    [allCollections]
  );
  const collectionIdToSlug = useCallback(
    (id: string) => allCollections.find((c) => c.id === id)?.slug ?? null,
    [allCollections]
  );

  const urlSort = searchParams.get("sort");
  const urlCollectionSlug = searchParams.get("collection");
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");

  const sort: SortOption = VALID_SORTS.includes(urlSort as SortOption) ? (urlSort as SortOption) : "newest";
  const selectedCollectionId = (() => {
    if (!urlCollectionSlug) return initialCollectionId || null;
    if (urlCollectionSlug === "all") return null;
    return collectionSlugToId(urlCollectionSlug);
  })();
  const appliedMinPrice = urlMinPrice || "";
  const appliedMaxPrice = urlMaxPrice || "";

  const [minPrice, setMinPrice] = useState(appliedMinPrice);
  const [maxPrice, setMaxPrice] = useState(appliedMaxPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => { setMinPrice(appliedMinPrice); }, [appliedMinPrice]);
  useEffect(() => { setMaxPrice(appliedMaxPrice); }, [appliedMaxPrice]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: t("newest") },
    { value: "price_asc", label: t("priceLowHigh") },
    { value: "price_desc", label: t("priceHighLow") },
    { value: "best_selling", label: t("bestSelling") },
    { value: "name_asc", label: t("nameAZ") },
  ];

  const buildSortParams = useCallback(
    (s: SortOption): { sortBy: string; sortOrder: string } => {
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
    },
    []
  );

  const buildUrl = useCallback(
    (overrides: { sort?: SortOption; collectionId?: string | null; minPrice?: string; maxPrice?: string } = {}) => {
      const params = new URLSearchParams();
      const s = overrides.sort ?? sort;
      const cId = overrides.collectionId !== undefined ? overrides.collectionId : selectedCollectionId;
      const min = overrides.minPrice !== undefined ? overrides.minPrice : appliedMinPrice;
      const max = overrides.maxPrice !== undefined ? overrides.maxPrice : appliedMaxPrice;

      if (s !== "newest") params.set("sort", s);
      if (cId) {
        if (cId !== initialCollectionId) {
          const slug = collectionIdToSlug(cId);
          if (slug) params.set("collection", slug);
        }
      } else if (initialCollectionId) {
        params.set("collection", "all");
      }
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [sort, selectedCollectionId, appliedMinPrice, appliedMaxPrice, pathname, initialCollectionId, collectionIdToSlug]
  );

  const setSortUrl = (value: SortOption) => {
    router.replace(buildUrl({ sort: value }));
  };

  const setCollectionUrl = (id: string | null) => {
    router.replace(buildUrl({ collectionId: id }));
  };

  const handleApplyFilters = () => {
    router.replace(buildUrl({ minPrice: minPrice || "", maxPrice: maxPrice || "" }));
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.replace(pathname);
    setFiltersOpen(false);
  };

  const { sortBy, sortOrder } = buildSortParams(sort);
  const productFilters: Omit<ProductFilters, "page" | "limit"> = {
    isActive: true,
    collectionId: selectedCollectionId || undefined,
    isFeatured: initialIsFeatured,
    sortBy,
    sortOrder,
    minPrice: appliedMinPrice || undefined,
    maxPrice: appliedMaxPrice || undefined,
  };

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteProducts(productFilters);

  const allProducts: Product[] = infiniteData?.pages
    ? infiniteData.pages.flatMap((p) => p.products)
    : initialProducts;

  const total: number = infiniteData?.pages?.[0]?.pagination?.total ?? initialTotal;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isCollectionChanged = selectedCollectionId !== (initialCollectionId || null);
  const hasActiveFilters = appliedMinPrice || appliedMaxPrice || sort !== "newest" || isCollectionChanged;

  const selectedCollectionName = selectedCollectionId
    ? allCollections.find((c) => c.id === selectedCollectionId)
      ? isRtl
        ? allCollections.find((c) => c.id === selectedCollectionId)!.nameAr
        : allCollections.find((c) => c.id === selectedCollectionId)!.nameEn
      : null
    : t("allProducts");

  const filterContent = (
    <>
      {allCollections.length > 0 && (
        <div className="mb-5">
          <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-3">
            {t("collectionFilter")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCollectionUrl(null)}
              className={`px-3 py-2 text-xs tracking-wide border transition-all duration-200 ${
                !selectedCollectionId
                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                  : "border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A]"
              }`}
            >
              {t("allProducts")}
            </button>
            {allCollections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => setCollectionUrl(collection.id)}
                className={`px-3 py-2 text-xs tracking-wide border transition-all duration-200 ${
                  selectedCollectionId === collection.id
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                    : "border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A]"
                }`}
              >
                {isRtl ? collection.nameAr : collection.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-3">{t("priceRange")}</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] text-[#999] uppercase tracking-wider mb-1 block">{t("min")} (AED)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-[#E8E4DF] text-sm outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>
          <span className="text-[#E8E4DF] mt-4">—</span>
          <div className="flex-1">
            <label className="text-[10px] text-[#999] uppercase tracking-wider mb-1 block">{t("max")} (AED)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="9999"
              className="w-full px-3 py-2 border border-[#E8E4DF] text-sm outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApplyFilters}
          className="flex-1 py-2.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
        >
          {t("apply")}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2.5 border border-[#E8E4DF] text-xs tracking-widest uppercase font-light text-[#999] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
          >
            {t("clearAll")}
          </button>
        )}
      </div>
    </>
  );

  const sortContent = (
    <div className="space-y-1">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            setSortUrl(option.value);
            setSortOpen(false);
          }}
          className={`w-full text-start px-4 py-3 text-sm tracking-wide font-light transition-colors rounded-lg ${
            sort === option.value
              ? "text-[#8B7355] bg-[#FAF9F7]"
              : "text-[#1A1A1A] hover:bg-[#FAF9F7]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <p className="text-xs text-[#999] tracking-wide font-light">
          {t("showing", { count: allProducts.length, total })}
        </p>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFiltersOpen(!filtersOpen);
                setSortOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase font-light border transition-colors ${
                hasActiveFilters
                  ? "border-[#8B7355] text-[#8B7355]"
                  : "border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              {t("filters")}
            </button>

            {filtersOpen && (
              <div className="hidden sm:block absolute top-full mt-2 inset-e-0 z-20 bg-white border border-[#E8E4DF] shadow-lg p-5 w-80 max-h-[70vh] overflow-y-auto">
                {filterContent}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen(!sortOpen);
                setFiltersOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase font-light border border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-3L16.5 18m0 0L12 13.5m4.5 4.5V4.5" />
              </svg>
              {sortOptions.find((o) => o.value === sort)?.label}
            </button>

            {sortOpen && (
              <div className="hidden sm:block absolute top-full mt-2 inset-e-0 z-20 bg-white border border-[#E8E4DF] shadow-lg w-52 py-1">
                {sortContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {(filtersOpen || sortOpen) && (
        <div className="hidden sm:block fixed inset-0 z-10" onClick={() => { setFiltersOpen(false); setSortOpen(false); }} />
      )}

      <BottomDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t("filters")}>
        {filterContent}
      </BottomDrawer>

      <BottomDrawer open={sortOpen} onClose={() => setSortOpen(false)} title={t("sortBy")}>
        {sortContent}
      </BottomDrawer>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {isCollectionChanged && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F7] border border-[#E8E4DF] text-xs text-[#1A1A1A] font-light">
              {selectedCollectionName}
              <button type="button" onClick={() => setCollectionUrl(initialCollectionId || null)} className="text-[#999] hover:text-[#1A1A1A]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {appliedMinPrice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F7] border border-[#E8E4DF] text-xs text-[#1A1A1A] font-light">
              {t("min")}: AED {appliedMinPrice}
              <button type="button" onClick={() => { setMinPrice(""); router.replace(buildUrl({ minPrice: "" })); }} className="text-[#999] hover:text-[#1A1A1A]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {appliedMaxPrice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F7] border border-[#E8E4DF] text-xs text-[#1A1A1A] font-light">
              {t("max")}: AED {appliedMaxPrice}
              <button type="button" onClick={() => { setMaxPrice(""); router.replace(buildUrl({ maxPrice: "" })); }} className="text-[#999] hover:text-[#1A1A1A]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {sort !== "newest" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F7] border border-[#E8E4DF] text-xs text-[#1A1A1A] font-light">
              {sortOptions.find((o) => o.value === sort)?.label}
            </span>
          )}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-[#8B7355] hover:text-[#7A6348] tracking-wide font-light underline underline-offset-2"
          >
            {t("clearFilters")}
          </button>
        </div>
      )}

      {allProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <span className="w-6 h-6 border-2 border-[#E8E4DF] border-t-[#8B7355] rounded-full animate-spin" />
            )}
          </div>
        </>
      ) : isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="text-center py-16">
          <p className="text-sm text-[#999] font-light">{t("noProducts")}</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 text-xs text-[#8B7355] hover:text-[#7A6348] tracking-wide font-light underline underline-offset-2"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
