import { ProductGridSkeleton } from "@/components/Skeletons";

export default function NewArrivalsLoading() {
  return (
    <section className="py-16 sm:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-10 bg-[#E8E4DF] rounded w-48 mx-auto" />
          <div className="mt-4 h-4 bg-[#E8E4DF] rounded w-64 mx-auto" />
          <div className="mt-6 w-16 h-px bg-[#E8E4DF] mx-auto" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </section>
  );
}
