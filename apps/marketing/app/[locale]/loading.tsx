export default function Loading() {
  return (
    <section className="py-24 sm:py-32 bg-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-[#E8E4DF] rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-[#1A1A1A] rounded-full animate-spin" />
        </div>
        <span className="text-xs tracking-widest uppercase text-[#999] font-light">
          Loading...
        </span>
      </div>
    </section>
  );
}
