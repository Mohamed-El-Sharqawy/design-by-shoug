import {
  ProductCarouselSkeleton,
  CollectionGridSkeleton,
} from "@/components/Skeletons";

export default function HomeLoading() {
  return (
    <>
      <section className="relative h-screen bg-[#E8E4DF] animate-pulse" />

      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-start mb-12 sm:mb-16 animate-pulse">
            <div className="h-10 bg-[#E8E4DF] rounded w-48" />
            <div className="mt-4 w-16 h-px bg-[#E8E4DF]" />
          </div>
          <CollectionGridSkeleton />
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-end mb-12 sm:mb-16 animate-pulse">
            <div className="h-10 bg-[#E8E4DF] rounded w-48 ms-auto" />
            <div className="mt-4 w-16 h-px bg-[#E8E4DF] ms-auto" />
          </div>
          <ProductCarouselSkeleton />
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-start mb-12 sm:mb-16 animate-pulse">
            <div className="h-10 bg-[#E8E4DF] rounded w-48" />
            <div className="mt-4 w-16 h-px bg-[#E8E4DF]" />
          </div>
          <ProductCarouselSkeleton />
        </div>
      </section>
    </>
  );
}
