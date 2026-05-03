"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, type ProductFilters } from "@repo/api-client";
import type { Product } from "@repo/types";

export function NewArrivalsClient({
  initialProducts,
  initialTotal,
}: {
  initialProducts: Product[];
  initialTotal: number;
}) {
  const t = useTranslations("NewArrivals");
  const [page, setPage] = useState(1);
  const filters: ProductFilters = {
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 24 * page,
    page: 1,
    isActive: true,
  };
  const { data: productData, isLoading: loading } = useProducts(filters);
  const products: Product[] = (productData as unknown as { products?: Product[] })?.products ?? initialProducts;
  const total: number = (productData as unknown as { pagination?: { total?: number } })?.pagination?.total ?? initialTotal;
  const hasMore = products.length < total;

  const loadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <section className="py-16 sm:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-[#999] font-light tracking-wide max-w-lg mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#999] font-light">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors disabled:opacity-60"
                >
                  {loading ? "..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
