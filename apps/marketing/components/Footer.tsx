"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();

  const shopLinks = [
    { href: "/collections", label: t("collections") },
    { href: "/new-arrivals", label: t("newArrivals") },
    { href: "/collections/all", label: t("allProducts") },
  ];

  const companyLinks = [
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
    { href: "/faq", label: t("faq") },
  ];

  const supportLinks = [
    { href: "/shipping-policy", label: t("shippingPolicy") },
    { href: "/returns-policy", label: t("returnsPolicy") },
    { href: "/size-guide", label: t("sizeGuide") },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl tracking-wide text-white">
                Design By Shoug
              </span>
              <span className="block text-sm text-[#8B7355] tracking-widest mt-0.5">
                تصميم شوق
              </span>
            </Link>
            <p className="mt-5 text-sm text-[#999] leading-relaxed max-w-xs">
              {t("newsletterDesc")}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex"
            >
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#8B7355] transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#8B7355] text-white text-xs tracking-widest uppercase font-light hover:bg-[#7A6348] transition-colors"
              >
                {t("subscribe")}
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#8B7355] mb-5">
              {t("shop")}
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-[#999] hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#8B7355] mb-5">
              {t("company")}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-[#999] hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#8B7355] mb-5">
              {t("support")}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-[#999] hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#8B7355] mb-5">
              {t("followUs")}
            </h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/designbyshoug/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#999] hover:text-white hover:border-[#8B7355] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@designbyshoug"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#999] hover:text-white hover:border-[#8B7355] transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
                </svg>
              </a>
              <a
                href="https://www.snapchat.com/add/designbyshoug"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#999] hover:text-white hover:border-[#8B7355] transition-colors"
                aria-label="Snapchat"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.4-.15.842-.318 1.33-.318.316 0 .598.058.857.17.619.266.939.722.955 1.084.032.73-.619 1.14-1.065 1.428-.1.065-.2.126-.287.183-.398.26-.698.456-.778.698-.042.128-.024.296.057.518.256.69.882 1.677 1.82 2.375.487.363 1.024.647 1.474.843.126.055.237.098.327.13l.016.006c.183.07.312.12.374.222.086.14.048.384-.042.656-.04.12-.088.244-.14.367-.297.697-.737 1.267-1.278 1.609-.34.215-.727.352-1.113.398-.1.012-.19.018-.276.018-.29 0-.521-.063-.737-.122-.226-.062-.438-.12-.722-.12-.156 0-.311.015-.46.044-.403.078-.757.283-1.13.5-.346.202-.704.41-1.118.536a4.16 4.16 0 01-1.288.22h-.092c-.432 0-.86-.074-1.275-.22-.393-.138-.753-.326-1.1-.508l-.047-.025c-.36-.194-.7-.376-1.062-.497a2.74 2.74 0 00-.917-.17c-.302 0-.604.057-.896.17-.384.128-.743.32-1.12.522l-.012.006c-.35.195-.712.397-1.108.53-.43.148-.878.222-1.33.222h-.092a4.21 4.21 0 01-1.313-.224c-.397-.138-.757-.326-1.105-.512l-.022-.012c-.376-.202-.73-.39-1.112-.517a2.68 2.68 0 00-.895-.17c-.312 0-.625.062-.93.184-.374.15-.742.388-1.122.633a4.04 4.04 0 01-1.383.63c-.19.043-.385.065-.58.065a3.54 3.54 0 01-.5-.037 3.04 3.04 0 01-1.388-.637C.754 18.967.29 18.384.02 17.67a3.54 3.54 0 01-.14-.367c-.09-.272-.128-.516-.042-.656.062-.102.19-.152.374-.222l.016-.006c.09-.032.201-.075.327-.13.45-.196.987-.48 1.474-.843.938-.698 1.564-1.686 1.82-2.375.081-.222.1-.39.057-.518-.08-.242-.38-.438-.778-.698a6.41 6.41 0 01-.287-.183C-.305 11.372-.956 10.962-.924 10.232c.016-.362.336-.818.955-1.084.259-.112.54-.17.857-.17.488 0 .93.168 1.33.318.247.093.578.194.863.214.172 0 .292-.038.365-.08-.008-.157-.018-.32-.03-.49l-.003-.06c-.104-1.628-.23-3.654.3-4.847C6.393 1.07 9.75.793 10.74.793h.733z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#666] font-light">
            &copy; {new Date().getFullYear()} Design By Shoug. {t("rights")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}/privacy-policy`}
              className="text-xs text-[#666] hover:text-white transition-colors font-light"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href={`/${locale}/terms-conditions`}
              className="text-xs text-[#666] hover:text-white transition-colors font-light"
            >
              {t("termsConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
