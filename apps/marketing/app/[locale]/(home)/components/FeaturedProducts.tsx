import { getLocale, getTranslations } from "next-intl/server";
import type { Product } from "@repo/types";
import { ProductCard } from "@/components/ProductCard";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?isFeatured=true&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.products || [];
  } catch {
    return [];
  }
}

export async function FeaturedProducts() {
  const [products, locale, t] = await Promise.all([
    getFeaturedProducts(),
    getLocale(),
    getTranslations("Home"),
  ]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-start mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t("featured")}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355]" />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <a
            href={`/${locale}/shop`}
            className="inline-block px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            {t("shopAll")}
          </a>
        </div>
      </div>
    </section>
  );
}
