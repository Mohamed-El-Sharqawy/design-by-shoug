import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/returns-policy",
    titleEn: "Returns & Exchange Policy | Design By Shoug",
    titleAr: "سياسة الإرجاع والاستبدال | ديزاين باي شوق",
    descEn: "Understand our returns and exchange policy for a smooth shopping experience at Design By Shoug.",
    descAr: "تعرفي على سياسة الإرجاع والاستبدال لتجربة تسوق سلسة في ديزاين باي شوق.",
  });
}

export default async function ReturnsPolicyPage() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("Policies.returns");
  const tp = await getTranslations("Policies");

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-wide mb-4">{t("title")}</h1>
        <p className="text-xs text-[#999] font-light mb-8">{tp("lastUpdated")}</p>
        <div className="w-16 h-px bg-[#8B7355] mb-8" />
        <p className="text-sm text-[#555] font-light leading-relaxed mb-8">{t("intro")}</p>
        <div className="space-y-8">
          <Section title={t("s1Title")} body={t("s1Body")} />
          <Section title={t("s2Title")} body={t("s2Body")} />
          <Section title={t("s3Title")} body={t("s3Body")} />
          <Section title={t("s4Title")} body={t("s4Body")} />
          <Section title={t("s5Title")} body={t("s5Body")} />
        </div>
      </div>
    </section>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-[#1A1A1A] mb-3">{title}</h2>
      <p className="text-sm text-[#555] font-light leading-relaxed">{body}</p>
    </div>
  );
}
