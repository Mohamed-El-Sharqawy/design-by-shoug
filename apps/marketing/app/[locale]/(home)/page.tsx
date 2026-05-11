import { Suspense } from "react";
import { Banners } from "./components/Banners";
import { Collections } from "./components/Collections";
import { NewArrivals } from "./components/NewArrivals";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { CustomerReviews } from "./components/CustomerReviews";
import { FromInstagram } from "./components/FromInstagram";
import {
  BannerSkeleton,
  CollectionGridSkeleton,
  ProductCarouselSkeleton,
  ReviewsSkeleton,
  InstagramSkeleton,
} from "@/components/Skeletons";

export default async function HomePage() {
  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <Banners />
      </Suspense>
      <Suspense
        fallback={
          <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-start mb-12 sm:mb-16 animate-pulse">
                <div className="h-10 bg-[#E8E4DF] rounded w-48" />
                <div className="mt-4 w-16 h-px bg-[#E8E4DF]" />
              </div>
              <CollectionGridSkeleton />
            </div>
          </section>
        }
      >
        <Collections />
      </Suspense>
      <Suspense
        fallback={
          <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-end mb-12 sm:mb-16 animate-pulse">
                <div className="h-10 bg-[#E8E4DF] rounded w-48 ms-auto" />
                <div className="mt-4 w-16 h-px bg-[#E8E4DF] ms-auto" />
              </div>
              <ProductCarouselSkeleton />
            </div>
          </section>
        }
      >
        <NewArrivals />
      </Suspense>
      <Suspense
        fallback={
          <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-start mb-12 sm:mb-16 animate-pulse">
                <div className="h-10 bg-[#E8E4DF] rounded w-48" />
                <div className="mt-4 w-16 h-px bg-[#E8E4DF]" />
              </div>
              <ProductCarouselSkeleton />
            </div>
          </section>
        }
      >
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <CustomerReviews />
      </Suspense>
      <Suspense fallback={<InstagramSkeleton />}>
        <FromInstagram />
      </Suspense>
    </>
  );
}
