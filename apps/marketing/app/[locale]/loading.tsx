import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      style={{ backgroundColor: "#F6F1F2" }}
    >
      <div className="text-center space-y-4">
        <Image
          src="/logo.jpeg"
          alt="Design by Shoug"
          width={500}
          height={500}
          priority
          fetchPriority="high"
          className="rounded-lg w-[200px] h-[200px] object-cover"
        />
        <span className="font-serif text-sm md:text-base sm:text-xl tracking-wide text-[#1A1A1A] mx-auto underline underline-offset-8">
          Design By Shoug
        </span>
      </div>
    </div>
  );
}
