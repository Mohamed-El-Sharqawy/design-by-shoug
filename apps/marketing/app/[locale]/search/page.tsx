"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@repo/api-client";
import { ProductCard } from "@/components/ProductCard";

export default function SearchPage() {
  const t = useTranslations("SearchPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const isRtl = locale === "ar";

  const { data: results, isLoading: loading } = useSearch(query);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!query.trim() ? (
          <div className="text-center py-20">
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide">
              {t("title")}
            </h1>
            <p className="mt-4 text-sm text-[#999] font-light">{t("noResultsDesc")}</p>
          </div>
        ) : (
          <>
            <div className="mb-12 sm:mb-16">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
                {loading ? (
                  <span className="text-[#999]">{query}</span>
                ) : (
                  query
                )}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-16 h-px bg-[#8B7355]" />
                {!loading && results && (
                  <span className="text-xs text-[#999] tracking-wide">
                    {results.products.length + results.collections.length}{" "}
                    {locale === "ar" ? "نتيجة" : "results"}
                  </span>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#8B7355] rounded-full animate-spin" />
              </div>
            )}

            {!loading && results && results.collections.length === 0 && results.products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-sm text-[#999] font-light">{t("noResults")}</p>
                <Link
                  href={`/${locale}`}
                  className="inline-block mt-6 px-6 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
                >
                  {t("backToHome")}
                </Link>
              </div>
            )}

            {!loading && results && results.collections.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xs tracking-widest uppercase text-[#8B7355] mb-6">
                  {t("collections")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {results.collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/${locale}/collections/${collection.slug}`}
                      className="group relative aspect-4/3 overflow-hidden bg-[#FAF9F7] rounded-lg"
                    >
                      {collection.imageUrl ? (
                        <Image
                          src={collection.imageUrl}
                          alt={isRtl ? collection.nameAr : collection.nameEn}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#E8E4DF]" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-end p-4">
                        <h3 className="font-serif text-base sm:text-lg text-white tracking-wide">
                          {isRtl ? collection.nameAr : collection.nameEn}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && results && results.products.length > 0 && (
              <div>
                <h2 className="text-xs tracking-widest uppercase text-[#8B7355] mb-6">
                  {t("products")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {results.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
