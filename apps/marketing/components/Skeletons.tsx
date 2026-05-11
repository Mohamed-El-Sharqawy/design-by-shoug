export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-3/4 bg-[#E8E4DF] rounded-xl mb-4" />
      <div className="text-center space-y-2">
        <div className="h-4 bg-[#E8E4DF] rounded w-3/4 mx-auto" />
        <div className="h-4 bg-[#E8E4DF] rounded w-1/3 mx-auto" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-hidden px-1 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)]">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-3/4 bg-[#E8E4DF] rounded-lg" />
    </div>
  );
}

export function CollectionGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SectionHeaderSkeleton({ align = "center" }: { align?: "center" | "start" | "end" }) {
  return (
    <div className={`mb-12 sm:mb-16 ${align === "center" ? "text-center" : align === "end" ? "text-end" : "text-start"}`}>
      <div className="h-8 sm:h-10 bg-[#E8E4DF] rounded w-48 mx-auto" />
      <div className="mt-6 w-16 h-px bg-[#E8E4DF] mx-auto" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <section className="relative h-screen bg-[#E8E4DF] animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 bg-[#D5D0CB] rounded w-64 mx-auto" />
          <div className="h-4 bg-[#D5D0CB] rounded w-48 mx-auto" />
        </div>
      </div>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-pulse">
          <div className="h-10 bg-[#E8E4DF] rounded w-48 mx-auto" />
          <div className="mt-4 w-16 h-px bg-[#E8E4DF] mx-auto" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-full sm:w-1/2 lg:w-1/3 space-y-4 animate-pulse">
              <div className="aspect-square bg-[#E8E4DF] rounded-xl" />
              <div className="h-4 bg-[#E8E4DF] rounded w-3/4" />
              <div className="h-3 bg-[#E8E4DF] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-12 sm:mb-16 animate-pulse">
          <div className="h-10 bg-[#E8E4DF] rounded w-48" />
          <div className="mt-4 w-16 h-px bg-[#E8E4DF]" />
          <div className="mt-4 h-3 bg-[#E8E4DF] rounded w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-3/4 bg-[#E8E4DF] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-3/4 bg-[#E8E4DF] rounded-xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-[#E8E4DF] rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-[#E8E4DF] rounded w-3/4" />
            <div className="h-6 bg-[#E8E4DF] rounded w-1/4" />
            <div className="h-px bg-[#E8E4DF]" />
            <div className="space-y-3">
              <div className="h-5 bg-[#E8E4DF] rounded w-1/3" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-[#E8E4DF] rounded-full" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-[#E8E4DF] rounded w-1/4" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-12 h-8 bg-[#E8E4DF] rounded" />
                ))}
              </div>
            </div>
            <div className="h-px bg-[#E8E4DF]" />
            <div className="flex gap-4">
              <div className="h-12 bg-[#E8E4DF] rounded w-32" />
              <div className="h-12 bg-[#E8E4DF] rounded flex-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
