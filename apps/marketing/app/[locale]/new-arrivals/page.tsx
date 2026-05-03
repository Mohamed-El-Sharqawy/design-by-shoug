import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { NewArrivalsClient } from "./NewArrivalsClient";

const API_URL = process.env.API_URL || "http://localhost:3001";

export default async function NewArrivalsPage() {
  const locale = await getLocale();
  setRequestLocale(locale);

  const res = await fetch(
    `${API_URL}/products?sort=newest&limit=24&include=images`,
    { next: { revalidate: 300 } }
  );
  const json = await res.json();
  const products = json.success ? json.data?.products || [] : [];
  const total = json.data?.pagination?.total || 0;

  return <NewArrivalsClient initialProducts={products} initialTotal={total} />;
}
