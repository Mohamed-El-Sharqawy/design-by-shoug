import { CollectionGridSkeleton, SectionHeaderSkeleton } from "@/components/Skeletons";

export default function CollectionsLoading() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeaderSkeleton align="center" />
        <CollectionGridSkeleton count={6} />
      </div>
    </section>
  );
}
