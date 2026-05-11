import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designbyshoug.com";
const API_URL = process.env.API_URL || "http://localhost:3001";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>`).join("\n")}
</urlset>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  try {
    const { locale } = await params;
    const urls: SitemapUrl[] = [];
    const currentDate = new Date().toISOString().split("T")[0];

    urls.push({
      loc: `${BASE_URL}/${locale}`,
      lastmod: currentDate,
      changefreq: "daily",
      priority: "1.0",
    });

    const staticPages = [
      { path: "/about", priority: "0.7" },
      { path: "/contact", priority: "0.7" },
      { path: "/collections", priority: "0.8" },
      { path: "/new-arrivals", priority: "0.8" },
      { path: "/faq", priority: "0.5" },
      { path: "/size-guide", priority: "0.5" },
      { path: "/privacy-policy", priority: "0.3" },
      { path: "/terms-conditions", priority: "0.3" },
      { path: "/shipping-policy", priority: "0.3" },
      { path: "/returns-policy", priority: "0.3" },
    ];

    staticPages.forEach((page) => {
      urls.push({
        loc: `${BASE_URL}/${locale}${page.path}`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: page.priority,
      });
    });

    try {
      const res = await fetch(`${API_URL}/products?isActive=true&limit=200`);
      if (res.ok) {
        const data = await res.json();
        const products: { slug: string; updatedAt?: string; createdAt?: string }[] =
          data.data?.products || [];
        products.forEach((product) => {
          urls.push({
            loc: `${BASE_URL}/${locale}/products/${product.slug}`,
            lastmod: product.updatedAt
              ? new Date(product.updatedAt).toISOString().split("T")[0]
              : product.createdAt
                ? new Date(product.createdAt).toISOString().split("T")[0]
                : currentDate,
            changefreq: "weekly",
            priority: "0.9",
          });
        });
      }
    } catch {}

    try {
      const res = await fetch(`${API_URL}/collections`);
      if (res.ok) {
        const data = await res.json();
        const collections: { slug: string }[] = data.data || [];
        [...collections.map((c) => c.slug), "all", "featured"].forEach((slug) => {
          urls.push({
            loc: `${BASE_URL}/${locale}/collections/${slug}`,
            lastmod: currentDate,
            changefreq: "weekly",
            priority: "0.8",
          });
        });
      }
    } catch {}

    return new NextResponse(generateSitemapXML(urls), {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    const { locale } = await params;
    const fallback = generateSitemapXML([
      {
        loc: `${BASE_URL}/${locale}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "daily",
        priority: "1.0",
      },
    ]);

    return new NextResponse(fallback, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    });
  }
}
