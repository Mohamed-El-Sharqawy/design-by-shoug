import { ProductGridSkeleton } from "@/components/Skeletons";

export default function CollectionDetailLoading() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 animate-pulse">
          <div className="h-10 bg-[#E8E4DF] rounded w-64" />
          <div className="mt-4 h-4 bg-[#E8E4DF] rounded w-96" />
          <div className="mt-6 w-16 h-px bg-[#E8E4DF]" />
        </div>
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-4 bg-[#E8E4DF] rounded w-24" />
          <div className="flex gap-3">
            <div className="h-9 bg-[#E8E4DF] rounded w-20" />
            <div className="h-9 bg-[#E8E4DF] rounded w-20" />
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
