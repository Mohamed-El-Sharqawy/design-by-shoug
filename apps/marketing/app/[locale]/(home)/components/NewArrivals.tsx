import { getLocale, getTranslations } from "next-intl/server";
import type { Product } from "@repo/types";
import { ProductCarousel } from "@/components/ProductCarousel";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getNewArrivalsProducts(): Promise<Product[]> {
  try {
    const colRes = await fetch(`${API_URL}/collections/slug/new-arrivals`, {
      next: { revalidate: 60 },
    });
    if (!colRes.ok) return [];
    const colData = await colRes.json();
    const collectionId = colData.data?.id;
    if (!collectionId) return [];

    const prodRes = await fetch(
      `${API_URL}/products?collectionId=${collectionId}&isActive=true&limit=12`,
      { next: { revalidate: 60 } }
    );
    if (!prodRes.ok) return [];
    const prodData = await prodRes.json();
    return prodData.data?.products || [];
  } catch {
    return [];
  }
}

export async function NewArrivals() {
  const [products, locale, t] = await Promise.all([
    getNewArrivalsProducts(),
    getLocale(),
    getTranslations("Home"),
  ]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-end mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t("newArrivals")}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355] ms-auto" />
        </div>

        <ProductCarousel products={products} locale={locale} />

        <div className="text-end mt-12">
          <a
            href={`/${locale}/collections/new-arrivals`}
            className="inline-block px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            {t("viewAll")}
          </a>
        </div>
      </div>
    </section>
  );
}
