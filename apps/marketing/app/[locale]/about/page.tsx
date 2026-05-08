import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function AboutPage() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <section className="py-16 sm:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wide mb-4">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-[#999] font-light tracking-wide max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-6 w-16 h-px bg-[#8B7355] mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          <div className="aspect-4/5 bg-[#FAF9F7] relative">
            <Image src="/about.png" alt="About Image" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-6">
              {t("storyTitle")}
            </h2>
            <p className="text-sm sm:text-base text-[#555] leading-relaxed font-light mb-4">
              {t("story")}
            </p>
            <p className="text-sm sm:text-base text-[#555] leading-relaxed font-light">
              {t("story2")}
            </p>
          </div>
        </div>

        <div className="bg-[#FAF9F7] p-10 sm:p-16 mb-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide mb-4">
              {t("missionTitle")}
            </h2>
            <div className="w-12 h-px bg-[#8B7355] mx-auto mb-6" />
            <p className="text-sm sm:text-base text-[#555] leading-relaxed font-light">
              {t("mission")}
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide text-center mb-12">
            {t("valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t("value1Title"), desc: t("value1Desc"), icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
              { title: t("value2Title"), desc: t("value2Desc"), icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" },
              { title: t("value3Title"), desc: t("value3Desc"), icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
              { title: t("value4Title"), desc: t("value4Desc"), icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((v, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-sm tracking-widest uppercase text-[#1A1A1A] mb-2">{v.title}</h3>
                <p className="text-xs text-[#999] font-light leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
