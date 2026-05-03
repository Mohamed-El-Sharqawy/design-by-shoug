"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCartCount } from "@/lib/cart-hooks";
import { useAuth } from "@/lib/auth";
import { useSearch } from "@repo/api-client";

interface HeaderCollection {
  slug: string;
  nameEn: string;
  nameAr: string;
}

interface HeaderClientProps {
  headerCollections: HeaderCollection[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchDrawer({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
}) {
  const t = useTranslations("Header");
  const isRtl = locale === "ar";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { data: searchData, isLoading: loading } = useSearch(debouncedQuery, 5);
  const results = searchData ?? { products: [], collections: [] };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const hasResults =
    results.products.length > 0 || results.collections.length > 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isRtl ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-70"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-0 z-80 bg-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <svg
              className="w-5 h-5 text-[#8B7355] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 text-sm font-light outline-none bg-transparent placeholder:text-[#999]"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {query.trim() && (
          <div className="border-t border-[#E8E4DF] max-h-[60vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 border-2 border-[#E8E4DF] rounded-full" />
                    <div className="absolute inset-0 border-2 border-transparent border-t-[#1A1A1A] rounded-full animate-spin" />
                  </div>
                </div>
              ) : hasResults ? (
                <div className="space-y-8">
                  {results.collections.length > 0 && (
                    <div>
                      <h3 className="text-xs tracking-widest uppercase text-[#8B7355] mb-4">
                        {t("collections")}
                      </h3>
                      <div className="space-y-2">
                        {results.collections.map((collection) => (
                          <Link
                            key={collection.id}
                            href={`/${locale}/collections/${collection.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 py-2 hover:bg-[#FAF9F7] transition-colors px-2 -mx-2"
                          >
                            <div className="w-10 h-12 bg-[#FAF9F7] relative overflow-hidden shrink-0">
                              {collection.imageUrl && (
                                <Image
                                  src={collection.imageUrl}
                                  alt={
                                    isRtl
                                      ? collection.nameAr
                                      : collection.nameEn
                                  }
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              )}
                            </div>
                            <span className="text-sm text-[#1A1A1A] font-light">
                              {isRtl ? collection.nameAr : collection.nameEn}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.products.length > 0 && (
                    <div>
                      <h3 className="text-xs tracking-widest uppercase text-[#8B7355] mb-4">
                        {t("products")}
                      </h3>
                      <div className="space-y-2">
                        {results.products.map((product) => {
                          const primaryImage = product.images?.[0];
                          return (
                            <Link
                              key={product.id}
                              href={`/${locale}/products/${product.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3 py-2 hover:bg-[#FAF9F7] transition-colors px-2 -mx-2"
                            >
                              <div className="w-10 h-12 bg-[#FAF9F7] relative overflow-hidden shrink-0">
                                {primaryImage ? (
                                  <Image
                                    src={primaryImage.url}
                                    alt={
                                      isRtl
                                        ? product.nameAr
                                        : product.nameEn
                                    }
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[#C4C4C4] text-[8px]">
                                    IMG
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1A1A1A] font-light truncate">
                                  {isRtl
                                    ? product.nameAr
                                    : product.nameEn}
                                </p>
                                <p className="text-xs text-[#8B7355] font-light">
                                  {product.salePrice ? (
                                    <>
                                      <span>
                                        {formatPrice(product.salePrice)}
                                      </span>
                                      <span className="text-[#999] line-through ms-2">
                                        {formatPrice(product.basePrice)}
                                      </span>
                                    </>
                                  ) : (
                                    formatPrice(product.basePrice)
                                  )}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#999]">{t("noResults")}</p>
                </div>
              )}
            </div>
            {hasResults && (
              <div className="border-t border-[#E8E4DF]">
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block text-center py-4 text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#7A6348] transition-colors"
                >
                  {t("viewAll")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function HeaderClient({ headerCollections }: HeaderClientProps) {
  const t = useTranslations("Header");
  const tAuth = useTranslations("Auth");
  const tAccount = useTranslations("Account");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const cartItemCount = useCartCount();
  const authUser = useAuth((s) => s.user);
  const authLogout = useAuth((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }, [locale, pathname, router]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userMenuOpen]);

  const leftLinks = [
    { href: "/collections", label: t("collections") },
    ...headerCollections.map((c) => ({
      href: `/collections/${c.slug}`,
      label: locale === "ar" ? c.nameAr : c.nameEn,
    })),
  ];

  const rightLinks = [
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FAF9F7] border-b border-[#E8E4DF]">
        <div className="bg-[#1A1A1A] text-white text-center py-2 px-4 text-xs tracking-widest uppercase">
          {t("announcement")}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              {leftLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link href={`/${locale}`} className="absolute left-1/2 -translate-x-1/2">
              <span className="font-serif text-xl tracking-wide text-[#1A1A1A]">
                Design By Shoug
              </span>
            </Link>

            <div className="flex items-center gap-6">
              {rightLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1 text-[#1A1A1A] hover:text-[#8B7355] transition-colors"
                aria-label={t("search")}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
              <Link
                href={`/${locale}/cart`}
                className="relative p-1 text-[#1A1A1A] hover:text-[#8B7355] transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              {authUser ? (
                <div className="relative" data-user-menu>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`p-1 transition-colors ${userMenuOpen ? "text-[#8B7355]" : "text-[#1A1A1A] hover:text-[#8B7355]"}`}
                    aria-label={tAuth("myAccount")}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute inset-e-0 top-full mt-2 w-48 bg-white border border-[#E8E4DF] shadow-lg py-2 z-50">
                      <p className="px-4 py-2 text-xs text-[#999] font-light truncate">{authUser.email}</p>
                      <div className="h-px bg-[#E8E4DF] mx-3 my-1" />
                      <Link
                        href={`/${locale}/account`}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#FAF9F7] font-light transition-colors"
                      >
                        {tAuth("myAccount")}
                      </Link>
                      <Link
                        href={`/${locale}/account?tab=orders`}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#FAF9F7] font-light transition-colors"
                      >
                        {tAccount("orders")}
                      </Link>
                      <Link
                        href={`/${locale}/account?tab=wishlist`}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#FAF9F7] font-light transition-colors"
                      >
                        {tAccount("wishlist")}
                      </Link>
                      <Link
                        href={`/${locale}/account?tab=addresses`}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#FAF9F7] font-light transition-colors"
                      >
                        {tAccount("addresses")}
                      </Link>
                      <div className="h-px bg-[#E8E4DF] mx-3 my-1" />
                      <button
                        type="button"
                        onClick={() => { authLogout(); setUserMenuOpen(false); }}
                        className="block w-full text-start px-4 py-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#FAF9F7] font-light transition-colors"
                      >
                        {tAuth("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="p-1 text-[#1A1A1A] hover:text-[#8B7355] transition-colors"
                  aria-label={tAuth("login")}
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}
              <button
                type="button"
                onClick={toggleLocale}
                className="text-xs tracking-wider text-[#8B7355] hover:text-[#7A6348] transition-colors font-light uppercase"
              >
                {locale === "en" ? "عربي" : "EN"}
              </button>
            </div>
          </nav>

          <div className="flex lg:hidden items-center justify-between h-14">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-[#1A1A1A]"
              aria-label={t("menu")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <Link href={`/${locale}`}>
              <span className="font-serif text-lg tracking-wide text-[#1A1A1A]">
                Design By Shoug
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1 text-[#1A1A1A]"
                aria-label={t("search")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
              <Link
                href={`/${locale}${authUser ? "/account" : "/login"}`}
                className="p-1 text-[#1A1A1A]"
                aria-label={tAuth("myAccount")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
              <Link
                href={`/${locale}/cart`}
                className="relative p-1 text-[#1A1A1A]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-60" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 inset-e-0 w-80 max-w-[85vw] bg-white z-70 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-serif text-lg tracking-wide">Design By Shoug</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#999] hover:text-[#1A1A1A]"
                  aria-label={t("closeMenu")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {leftLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors font-light border-b border-[#F5F3F0]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 space-y-1">
                {rightLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors font-light border-b border-[#F5F3F0]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 space-y-1">
                {authUser ? (
                  <>
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-3 text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] font-light border-b border-[#F5F3F0]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {tAuth("myAccount")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { authLogout(); setMobileMenuOpen(false); }}
                      className="block py-3 text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] font-light border-b border-[#F5F3F0]"
                    >
                      {tAuth("logout")}
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-3 text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] font-light border-b border-[#F5F3F0]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {tAuth("login")}
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={toggleLocale}
                className="mt-6 text-xs tracking-wider text-[#8B7355] hover:text-[#7A6348] transition-colors font-light uppercase"
              >
                {locale === "en" ? "عربي" : "English"}
              </button>
            </div>
          </div>
        </>
      )}

      <SearchDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
      />
    </>
  );
}
