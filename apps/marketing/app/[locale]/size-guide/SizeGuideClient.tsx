"use client";

import { useTranslations } from "next-intl";

const lengths = [
  { label: "petite", cm: "140" },
  { label: "standard", cm: "150" },
  { label: "tall", cm: "158" },
  { label: "extraTall", cm: "165" },
];

const measurements = [
  { key: "bust", icon: "M21 10.5c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 6 3 8.015 3 10.5c0 5.053 7.5 10.5 9 11.5 1.5-1 9-6.447 9-11.5z" },
  { key: "waist", icon: "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" },
  { key: "hips", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" },
  { key: "length", icon: "M3 3v18m0-18l3 3m-3-3l3-3M3 21l3-3m-3 3l-3-3" },
  { key: "shoulder", icon: "M3.75 3.75h16.5M3.75 3.75l3 3m-3-3l3-3M20.25 3.75l-3 3m3-3l-3-3" },
  { key: "sleeve", icon: "M4.5 12.75l7.5-7.5 7.5 7.5" },
];

export function SizeGuideClient({ locale }: { locale: string }) {
  const t = useTranslations("SizeGuide");
  const isRtl = locale === "ar";

  return (
    <section className="py-16 sm:py-20 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-[#999] font-light tracking-wide max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="mb-20">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] tracking-wide mb-3">
            {t("howToMeasure")}
          </h2>
          <p className="text-sm text-[#999] font-light leading-relaxed mb-8">
            {t("howToMeasureDesc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {measurements.map((m) => (
              <div key={m.key} className="bg-[#FAF9F7] p-6 border border-[#E8E4DF]">
                <div className="w-10 h-10 mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                  </svg>
                </div>
                <h3 className="text-sm tracking-widest uppercase text-[#1A1A1A] mb-2">
                  {t(`${m.key}Title`)}
                </h3>
                <p className="text-sm text-[#666] font-light leading-relaxed">
                  {t(`${m.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] tracking-wide mb-3">
            {t("lengthChart")}
          </h2>
          <p className="text-sm text-[#999] font-light leading-relaxed mb-6">
            {t("lengthNote")}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF9F7]">
                  <th className="px-4 py-3 text-xs tracking-widest uppercase text-[#8B7355] text-start border-b border-[#E8E4DF]">
                    {t("lengthLabel")}
                  </th>
                  <th className="px-4 py-3 text-xs tracking-widest uppercase text-[#8B7355] text-start border-b border-[#E8E4DF]">
                    {t("lengthCm")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lengths.map((l) => (
                  <tr key={l.label} className="border-b border-[#E8E4DF]">
                    <td className="px-4 py-3 text-sm text-[#1A1A1A] font-light">{t(l.label)}</td>
                    <td className="px-4 py-3 text-sm text-[#555] font-light">{l.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-20">
          <div className="bg-[#FAF9F7] p-8 sm:p-12 border border-[#E8E4DF]">
            <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-3">
              {t("whereToSpecify")}
            </h2>
            <p className="text-sm text-[#555] font-light leading-relaxed mb-6">
              {t("whereToSpecifyDesc")}
            </p>
            <div className="border-t border-[#E8E4DF] pt-6">
              <h3 className="text-sm tracking-widest uppercase text-[#8B7355] mb-3">
                {t("customOption")}
              </h3>
              <p className="text-sm text-[#555] font-light leading-relaxed">
                {t("customDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide mb-3">
            {t("videoTitle")}
          </h2>
          <p className="text-sm text-[#999] font-light leading-relaxed mb-8 max-w-lg mx-auto">
            {t("videoDesc")}
          </p>
          <div className="aspect-video max-w-3xl mx-auto bg-[#FAF9F7] border border-[#E8E4DF] flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-[#E8E4DF] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              <p className="text-xs text-[#C4C4C4] font-light">Video coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
