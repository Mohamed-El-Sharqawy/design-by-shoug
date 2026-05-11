"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProfileTab } from "./tabs/ProfileTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { AddressesTab } from "./tabs/AddressesTab";

type Tab = "profile" | "orders" | "addresses";
const VALID_TABS: Tab[] = ["profile", "orders", "addresses"];

export function AccountPageClient({ locale }: { locale: string }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);

  const tabParam = searchParams.get("tab");
  const activeTab: Tab = VALID_TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : "profile";

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(`/${locale}/login`);
    }
  }, [hydrated, token, locale, router]);

  const setActiveTab = (tab: Tab) => {
    if (tab === "profile") {
      router.push(pathname, { scroll: false });
    } else {
      router.push(`${pathname}?tab=${tab}`, { scroll: false });
    }
  };

  if (!hydrated || !user || !token) {
    return (
      <section className="py-24 bg-white flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-[#E8E4DF] rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-[#1A1A1A] rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: t("profile") },
    { key: "orders", label: t("orders") },
    { key: "addresses", label: t("addresses") },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-[#999] font-light tracking-wide mb-8">
          {user.email}
        </p>
        <div className="w-16 h-px bg-[#8B7355] mb-8" />

        <div className="flex gap-1 border-b border-[#E8E4DF] mb-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs tracking-widest uppercase font-light whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-[#1A1A1A] text-[#1A1A1A]"
                  : "border-transparent text-[#999] hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && <ProfileTab locale={locale} />}
        {activeTab === "orders" && <OrdersTab locale={locale} />}
        {activeTab === "addresses" && <AddressesTab />}
      </div>
    </section>
  );
}
