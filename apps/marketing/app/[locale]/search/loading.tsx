import { ProductGridSkeleton } from "@/components/Skeletons";

export default function SearchLoading() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 animate-pulse">
          <div className="h-10 bg-[#E8E4DF] rounded w-64" />
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-px bg-[#E8E4DF]" />
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
