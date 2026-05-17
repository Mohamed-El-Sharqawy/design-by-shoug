export const UAE_CITIES_FALLBACK: ShippingCity[] = [
  { id: "fallback_0", nameEn: "Dubai", nameAr: "دبي", baseCost: 25, freeShippingMin: 1000, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  { id: "fallback_1", nameEn: "Abu Dhabi", nameAr: "أبوظبي", baseCost: 35, freeShippingMin: 1000, estimatedDaysMin: 2, estimatedDaysMax: 3 },
  { id: "fallback_2", nameEn: "Sharjah", nameAr: "الشارقة", baseCost: 25, freeShippingMin: 1000, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  { id: "fallback_3", nameEn: "Ajman", nameAr: "عجمان", baseCost: 25, freeShippingMin: 1000, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  { id: "fallback_5", nameEn: "Ras Al Khaimah", nameAr: "رأس الخيمة", baseCost: 45, freeShippingMin: 1000, estimatedDaysMin: 2, estimatedDaysMax: 4 },
  { id: "fallback_6", nameEn: "Umm Al Quwain", nameAr: "أم القيوين", baseCost: 45, freeShippingMin: 1000, estimatedDaysMin: 2, estimatedDaysMax: 4 },
  { id: "fallback_7", nameEn: "Fujairah", nameAr: "الفجيرة", baseCost: 45, freeShippingMin: 1000, estimatedDaysMin: 2, estimatedDaysMax: 4 },
];

export interface ShippingCity {
  id: string;
  nameEn: string;
  nameAr: string;
  baseCost: number;
  freeShippingMin: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

let cachedCities: ShippingCity[] | null = null;

export async function fetchShippingCities(): Promise<ShippingCity[]> {
  if (cachedCities) return cachedCities;

  try {
    const res = await fetch(`${API_URL}/shipping/zones`);
    const json = await res.json();
    if (json.success && json.data) {
      cachedCities = json.data.map((z: Record<string, unknown>) => ({
        id: z.id as string,
        nameEn: z.nameEn as string,
        nameAr: z.nameAr as string,
        baseCost: Number(z.baseCost),
        freeShippingMin: z.freeShippingMin ? Number(z.freeShippingMin) : null,
        estimatedDaysMin: (z.estimatedDaysMin as number) ?? 1,
        estimatedDaysMax: (z.estimatedDaysMax as number) ?? 5,
      }));
      return cachedCities || [];
    }
  } catch {
    /* fallback below */
  }

  return UAE_CITIES_FALLBACK;
}
