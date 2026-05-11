import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";

export function getSiteUrl() {
  return SITE_URL;
}

export function buildMetadata(opts: {
  locale: string;
  path: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  keywordsEn?: string;
  keywordsAr?: string;
  index?: boolean;
}): Metadata {
  const isAr = opts.locale === "ar";
  const canonical = `${SITE_URL}/${opts.locale}${opts.path}`;
  const title = isAr ? opts.titleAr : opts.titleEn;
  const description = isAr ? opts.descAr : opts.descEn;
  const keywords = isAr ? opts.keywordsAr : opts.keywordsEn;
  const index = opts.index ?? true;

  return {
    title,
    description,
    keywords,
    publisher: "Design By Shoug",
    creator: "Design By Shoug",
    robots: {
      index,
      follow: index,
      googleBot: index
        ? {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          }
        : { index: false, follow: false },
    },
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en${opts.path}`,
        ar: `${SITE_URL}/ar${opts.path}`,
        "x-default": `${SITE_URL}/en${opts.path}`,
      },
    },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}
