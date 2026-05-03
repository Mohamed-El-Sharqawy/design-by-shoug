import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("NotFound");

  setRequestLocale(locale);

  return (
    <section className="py-24 sm:py-32 bg-white min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <span className="font-serif text-8xl sm:text-9xl text-[#E8E4DF] tracking-wider select-none block mb-6">
          404
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
          {t("title")}
        </h1>

        <p className="text-sm text-[#999] font-light tracking-wide leading-relaxed max-w-md mx-auto mb-10">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}`}
            className="inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
          >
            {t("backHome")}
          </Link>
          <Link
            href={`/${locale}/collections/all`}
            className="inline-block px-8 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            {t("browseCollections")}
          </Link>
        </div>
      </div>
    </section>
  );
}
