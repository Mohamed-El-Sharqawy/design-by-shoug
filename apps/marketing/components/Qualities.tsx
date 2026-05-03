"use client";

import { useTranslations } from "next-intl";

const icons = {
  shipping: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  fabric: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  tailoring: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a2.5 2.5 0 113.54-3.54l1.06 1.06 1.06-1.06a2.5 2.5 0 113.54 3.54l-5.1 5.1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l3 3L9 15l2.25 4.5" />
    </svg>
  ),
  support: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
};

interface QualityItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QualityCard({ item }: { item: QualityItem }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-6 sm:p-8">
      <div className="w-14 h-14 rounded-full border border-[#E8E4DF] flex items-center justify-center text-[#8B7355]">
        {item.icon}
      </div>
      <h3 className="font-light text-sm tracking-widest uppercase text-[#1A1A1A]">
        {item.title}
      </h3>
      <p className="text-xs text-[#999] leading-relaxed max-w-[220px]">
        {item.description}
      </p>
    </div>
  );
}

export function Qualities() {
  const t = useTranslations("Home");

  const qualities: QualityItem[] = [
    { icon: icons.shipping, title: t("qualityShipping"), description: t("qualityShippingDesc") },
    { icon: icons.fabric, title: t("qualityFabric"), description: t("qualityFabricDesc") },
    { icon: icons.tailoring, title: t("qualityTailoring"), description: t("qualityTailoringDesc") },
    { icon: icons.support, title: t("qualitySupport"), description: t("qualitySupportDesc") },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-wide">
            {t("qualitiesTitle")}
          </h2>
          <div className="mt-4 w-16 h-px bg-[#8B7355]" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {qualities.map((item, i) => (
            <QualityCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
