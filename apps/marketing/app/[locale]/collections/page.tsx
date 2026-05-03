import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Collection } from "@repo/types";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | Design By Shoug",
  description: "Browse our curated collections of luxury abayas",
};

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_URL}/collections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function CollectionsPage() {
  const [collections, locale, t] = await Promise.all([
    getCollections(),
    getLocale(),
    getTranslations("CollectionsPage"),
  ]);

  setRequestLocale(locale);

  const getName = (c: Collection) => (locale === "ar" ? c.nameAr : c.nameEn);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wide">
            {t("title")}
          </h1>
          <p className="mt-4 text-sm text-[#999] font-light tracking-wide">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/${locale}/collections/${collection.slug}`}
              className="group relative aspect-3/4 overflow-hidden bg-[#FAF9F7]"
            >
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={getName(collection)}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#E8E4DF]" />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10">
                <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide text-center px-4">
                  {getName(collection)}
                </h2>
                <span className="mt-3 px-6 py-2 border border-white/80 text-white text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t("shopNow")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
