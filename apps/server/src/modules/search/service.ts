import { prisma } from "@/lib/prisma";

export class SearchService {
  static async search(query: string) {
    const [products, collections] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { nameEn: { contains: query, mode: "insensitive" } },
            { nameAr: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 20,
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
          basePrice: true,
          salePrice: true,
          isNewArrival: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altTextEn: true, altTextAr: true, isPrimary: true },
          },
          variants: {
            where: { isActive: true },
            include: {
              abayaLength: true,
              bodySize: true,
              color: true,
            },
          },
        },
        orderBy: { soldCount: "desc" },
      }),
      prisma.collection.findMany({
        where: {
          isActive: true,
          OR: [
            { nameEn: { contains: query, mode: "insensitive" } },
            { nameAr: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
          imageUrl: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return { products, collections };
  }
}
