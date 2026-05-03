"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { InstagramPost } from "@repo/types";

interface Translations {
  sectionTitle: string;
  followUs: string;
}

interface InstagramGridProps {
  posts: InstagramPost[];
  translations: Translations;
}

function InstagramCard({ post, locale }: { post: InstagramPost; locale: string }) {
  const [hovered, setHovered] = useState(false);
  const caption = locale === "ar" ? post.captionAr : post.captionEn;

  return (
    <a
      href={post.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-[3/4] overflow-hidden bg-[#E8E4DF] rounded-xl block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt={caption || "Instagram post"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
      )}

      <div
        className={`absolute inset-0 bg-black/0 transition-colors duration-300 flex items-center justify-center ${hovered ? "bg-black/30" : ""}`}
      >
        <div
          className={`flex flex-col items-center gap-3 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          {caption && (
            <p className="text-white text-xs text-center px-4 line-clamp-3 font-light leading-relaxed">
              {caption}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

export function InstagramGrid({ posts, translations: t }: InstagramGridProps) {
  const locale = useLocale();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t.sectionTitle}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355]" />
          <p className="mt-4 text-sm text-[#999] tracking-widest uppercase font-light">
            @designbyshoug
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {posts.slice(0, 8).map((post) => (
            <InstagramCard key={post.id} post={post} locale={locale} />
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/designbyshoug/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            {t.followUs}
          </a>
        </div>
      </div>
    </section>
  );
}
