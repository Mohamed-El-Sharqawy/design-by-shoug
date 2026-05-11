import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
