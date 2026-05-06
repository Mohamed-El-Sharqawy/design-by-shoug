import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  console.log("🧹 Cleaning existing data...");

  await prisma.shoppableVideoProduct.deleteMany();
  await prisma.shoppableVideo.deleteMany();
  await prisma.instagramPost.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.featuredProduct.deleteMany();
  await prisma.customerReview.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.sizeGuideImage.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.abayaLength.deleteMany();
  await prisma.color.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.shippingZone.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany({
    where: { role: "CUSTOMER" },
  });

  console.log("  ✅ Database cleaned\n");
}

async function seedAbayaLengths() {
  console.log("📏 Seeding abaya lengths...");

  const lengths = [
    { inches: 52, labelEn: '52"', labelAr: '52 بوصة', idealHeightCm: 152.4, idealHeightFt: "5'0\"", sortOrder: 1 },
    { inches: 54, labelEn: '54"', labelAr: '54 بوصة', idealHeightCm: 157.48, idealHeightFt: "5'2\"", sortOrder: 2 },
    { inches: 56, labelEn: '56"', labelAr: '56 بوصة', idealHeightCm: 162.56, idealHeightFt: "5'4\"", sortOrder: 3 },
    { inches: 58, labelEn: '58"', labelAr: '58 بوصة', idealHeightCm: 167.64, idealHeightFt: "5'6\"", sortOrder: 4 },
    { inches: 60, labelEn: '60"', labelAr: '60 بوصة', idealHeightCm: 172.72, idealHeightFt: "5'8\"", sortOrder: 5 },
    { inches: 62, labelEn: '62"', labelAr: '62 بوصة', idealHeightCm: 177.8, idealHeightFt: "5'10\"", sortOrder: 6 },
    { inches: 64, labelEn: '64"', labelAr: '64 بوصة', idealHeightCm: 182.88, idealHeightFt: "6'0\"", sortOrder: 7 },
  ];

  for (const l of lengths) {
    await prisma.abayaLength.create({ data: l });
  }

  console.log(`  ✅ Created ${lengths.length} abaya lengths\n`);
  return await prisma.abayaLength.findMany({ orderBy: { sortOrder: "asc" } });
}

async function seedColors() {
  console.log("🎨 Seeding colors...");

  const colors = [
    { code: "BLK", nameEn: "Black", nameAr: "أسود", hexCode: "#000000", sortOrder: 1 },
    { code: "NAV", nameEn: "Navy", nameAr: "كحلي", hexCode: "#1B2A4A", sortOrder: 2 },
    { code: "BRG", nameEn: "Burgundy", nameAr: "عنابي", hexCode: "#800020", sortOrder: 3 },
    { code: "FGR", nameEn: "Forest Green", nameAr: "أخضر داكن", hexCode: "#228B22", sortOrder: 4 },
    { code: "DRS", nameEn: "Dusty Rose", nameAr: "وردي غباري", hexCode: "#DCAE96", sortOrder: 5 },
    { code: "CHR", nameEn: "Charcoal", nameAr: "فحمي", hexCode: "#36454F", sortOrder: 6 },
    { code: "IVR", nameEn: "Ivory", nameAr: "عاجي", hexCode: "#FFFFF0", sortOrder: 7 },
    { code: "MCH", nameEn: "Mocha", nameAr: "موكا", hexCode: "#7B6B5D", sortOrder: 8 },
    { code: "SAJ", nameEn: "Sage", nameAr: "مريمية", hexCode: "#BCB88A", sortOrder: 9 },
    { code: "WHT", nameEn: "White", nameAr: "أبيض", hexCode: "#FFFFFF", sortOrder: 10 },
  ];

  for (const c of colors) {
    await prisma.color.create({ data: c });
  }

  console.log(`  ✅ Created ${colors.length} colors\n`);
  return await prisma.color.findMany({ orderBy: { sortOrder: "asc" } });
}

async function seedCollections() {
  console.log("📂 Seeding collections...");

  const collections = [
    {
      slug: "everyday-essentials",
      nameEn: "Everyday Essentials",
      nameAr: "الأساسيات اليومية",
      descriptionEn: "Comfortable and elegant abayas for everyday wear",
      descriptionAr: "عبايات مريحة وأنيقة للارتداء اليومي",
      imageUrl: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=800",
      sortOrder: 1,
    },
    {
      slug: "occasion-wear",
      nameEn: "Occasion Wear",
      nameAr: "عبايات المناسبات",
      descriptionEn: "Stunning abayas for special occasions and events",
      descriptionAr: "عبايات رائعة للمناسبات والفعاليات الخاصة",
      imageUrl: "https://images.pexels.com/photos/14933144/pexels-photo-14933144.jpeg?auto=compress&cs=tinysrgb&w=800",
      sortOrder: 2,
    },
    {
      slug: "new-arrivals",
      nameEn: "New Arrivals",
      nameAr: "وصل حديثاً",
      descriptionEn: "The latest additions to our collection",
      descriptionAr: "أحدث الإضافات إلى مجموعتنا",
      imageUrl: "https://images.pexels.com/photos/35324626/pexels-photo-35324626.jpeg?auto=compress&cs=tinysrgb&w=800",
      sortOrder: 3,
    },
    {
      slug: "best-sellers",
      nameEn: "Best Sellers",
      nameAr: "الأكثر مبيعاً",
      descriptionEn: "Our most popular and loved abayas",
      descriptionAr: "العبايات الأكثر شعبية ومحبة",
      imageUrl: "https://images.pexels.com/photos/14850599/pexels-photo-14850599.jpeg?auto=compress&cs=tinysrgb&w=800",
      sortOrder: 4,
    },
  ];

  for (const c of collections) {
    await prisma.collection.create({ data: c });
  }

  console.log(`  ✅ Created ${collections.length} collections\n`);
  return await prisma.collection.findMany({ orderBy: { sortOrder: "asc" } });
}

interface ProductSeed {
  sku: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescEn: string;
  shortDescAr: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  hasColorOptions: boolean;
  colorCodes: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  images: { url: string; altTextEn: string; altTextAr: string; isPrimary: boolean; sortOrder: number }[];
  sizeGuideImages: { url: string; titleEn: string; titleAr: string; sortOrder: number }[];
  collectionSlugs: string[];
  featuredTitleEn?: string;
  featuredTitleAr?: string;
}

async function seedProducts(
  abayaLengths: Awaited<ReturnType<typeof seedAbayaLengths>>,
  colors: Awaited<ReturnType<typeof seedColors>>,
  collections: Awaited<ReturnType<typeof seedCollections>>,
) {
  console.log("👗 Seeding products...");

  const colorMap = new Map(colors.map((c) => [c.code, c]));

  const products: ProductSeed[] = [
    {
      sku: "ABY-001",
      slug: "classic-black-abaya",
      nameEn: "Classic Black Abaya",
      nameAr: "عباية سوداء كلاسيكية",
      descriptionEn:
        "A timeless black abaya crafted from premium crepe fabric. Features a clean, flowing silhouette with subtle bell sleeves. Perfect for everyday elegance.",
      descriptionAr:
        "عباية سوداء خالدة مصنوعة من قماش كريب فاخر. تتميز بتصميم انسيابي أنيق مع أكمام واسعة. مثالية للأناقة اليومية.",
      shortDescEn: "Premium crepe classic black abaya",
      shortDescAr: "عباية سوداء كلاسيكية من الكريب الفاخر",
      basePrice: 350,
      salePrice: 299,
      costPrice: 120,
      hasColorOptions: false,
      colorCodes: [],
      isFeatured: true,
      isNewArrival: false,
      images: [
        { url: "https://images.pexels.com/photos/8422430/pexels-photo-8422430.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Classic Black Abaya - Front", altTextAr: "عباية سوداء كلاسيكية - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/7389821/pexels-photo-7389821.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Classic Black Abaya - Side", altTextAr: "عباية سوداء كلاسيكية - جانب", isPrimary: false, sortOrder: 2 },
        { url: "https://images.pexels.com/photos/17433127/pexels-photo-17433127.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Classic Black Abaya - Detail", altTextAr: "عباية سوداء كلاسيكية - تفاصيل", isPrimary: false, sortOrder: 3 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Standard Abaya Size Guide", titleAr: "دليل مقاسات العباية القياسية", sortOrder: 1 },
      ],
      collectionSlugs: ["everyday-essentials", "best-sellers"],
      featuredTitleEn: "The Classic You Love",
      featuredTitleAr: "الكلاسيكية التي تحبينها",
    },
    {
      sku: "ABY-002",
      slug: "embroidered-elegance-abaya",
      nameEn: "Embroidered Elegance Abaya",
      nameAr: "عباية مطرزة أنيقة",
      descriptionEn:
        "An exquisite abaya featuring hand-embroidered details along the sleeves and hem. Made from luxurious Nidha fabric with a subtle shimmer.",
      descriptionAr:
        "عباية رائعة تتميز بتفاصيل مطرزة يدوياً على الأكمام والحاشية. مصنوعة من قماش نيدة فاخر مع لمعة خفيفة.",
      shortDescEn: "Hand-embroidered Nidha fabric abaya",
      shortDescAr: "عباية من قماش نيدة مطرزة يدوياً",
      basePrice: 550,
      salePrice: undefined,
      costPrice: 200,
      hasColorOptions: true,
      colorCodes: ["BLK", "NAV", "BRG"],
      isFeatured: true,
      isNewArrival: true,
      images: [
        { url: "https://images.pexels.com/photos/14850599/pexels-photo-14850599.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Embroidered Elegance Abaya - Front", altTextAr: "عباية مطرزة أنيقة - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/14801125/pexels-photo-14801125.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Embroidered Elegance Abaya - Embroidery Detail", altTextAr: "عباية مطرزة أنيقة - تفاصيل التطريز", isPrimary: false, sortOrder: 2 },
        { url: "https://images.pexels.com/photos/7249214/pexels-photo-7249214.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Embroidered Elegance Abaya - Back", altTextAr: "عباية مطرزة أنيقة - خلف", isPrimary: false, sortOrder: 3 },
        { url: "https://images.pexels.com/photos/5289625/pexels-photo-5289625.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Embroidered Elegance Abaya - Sleeve Detail", altTextAr: "عباية مطرزة أنيقة - تفاصيل الكم", isPrimary: false, sortOrder: 4 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Standard Abaya Size Guide", titleAr: "دليل مقاسات العباية القياسية", sortOrder: 1 },
      ],
      collectionSlugs: ["occasion-wear", "new-arrivals", "best-sellers"],
      featuredTitleEn: "Artisan Embroidery",
      featuredTitleAr: "تطريز حرفي",
    },
    {
      sku: "ABY-003",
      slug: "flowing-kimono-abaya",
      nameEn: "Flowing Kimono Abaya",
      nameAr: "عباية كيمونو منسابة",
      descriptionEn:
        "A beautifully draped kimono-style abaya with wide, flowing sleeves. Crafted from lightweight chiffon for a breezy, graceful look.",
      descriptionAr:
        "عباية بتصميم كيمونو جميل مع أكمام واسعة منسابة. مصنوعة من قماش شيفون خفيف لإطلالة رشيقة وأنيقة.",
      shortDescEn: "Lightweight chiffon kimono abaya",
      shortDescAr: "عباية كيمونو من الشيفون الخفيف",
      basePrice: 420,
      salePrice: 359,
      costPrice: 150,
      hasColorOptions: true,
      colorCodes: ["DRS", "MCH", "SAJ"],
      isFeatured: false,
      isNewArrival: true,
      images: [
        { url: "https://images.pexels.com/photos/7463734/pexels-photo-7463734.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Flowing Kimono Abaya - Front", altTextAr: "عباية كيمونو منسابة - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/19593159/pexels-photo-19593159.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Flowing Kimono Abaya - Flow", altTextAr: "عباية كيمونو منسابة - انسيابية", isPrimary: false, sortOrder: 2 },
        { url: "https://images.pexels.com/photos/17384020/pexels-photo-17384020.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Flowing Kimono Abaya - Full", altTextAr: "عباية كيمونو منسابة - كاملة", isPrimary: false, sortOrder: 3 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/7304333/pexels-photo-7304333.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Kimono Abaya Size Guide", titleAr: "دليل مقاسات عباية الكيمونو", sortOrder: 1 },
      ],
      collectionSlugs: ["everyday-essentials", "new-arrivals"],
    },
    {
      sku: "ABY-004",
      slug: "minimalist-chic-abaya",
      nameEn: "Minimalist Chic Abaya",
      nameAr: "عباية أنيقة بسيطة",
      descriptionEn:
        "Clean lines meet modern design in this minimalist abaya. Made from premium Saudi crepe with a flattering A-line cut and hidden pockets.",
      descriptionAr:
        "التصميم البسيط يلتقي بالأناقة العصرية في هذه العباية. مصنوعة من الكريب السعودي الفاخر بقصة A-line ومخارج مخفية.",
      shortDescEn: "Modern minimalist A-line abaya",
      shortDescAr: "عباية عصرية بسيطة بقصة A-line",
      basePrice: 380,
      salePrice: undefined,
      costPrice: 130,
      hasColorOptions: true,
      colorCodes: ["BLK", "CHR", "IVR"],
      isFeatured: false,
      isNewArrival: false,
      images: [
        { url: "https://images.pexels.com/photos/19250302/pexels-photo-19250302.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Minimalist Chic Abaya - Front", altTextAr: "عباية أنيقة بسيطة - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/20163470/pexels-photo-20163470.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Minimalist Chic Abaya - Side", altTextAr: "عباية أنيقة بسيطة - جانب", isPrimary: false, sortOrder: 2 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Standard Abaya Size Guide", titleAr: "دليل مقاسات العباية القياسية", sortOrder: 1 },
      ],
      collectionSlugs: ["everyday-essentials", "best-sellers"],
    },
    {
      sku: "ABY-005",
      slug: "pearl-trim-abaya",
      nameEn: "Pearl Trim Abaya",
      nameAr: "عباية مطرزة باللؤلؤ",
      descriptionEn:
        "An opulent abaya adorned with hand-sewn pearl trim along the cuffs and neckline. Crafted from premium silk-blend fabric for a luxurious drape.",
      descriptionAr:
        "عباية فاخرة مزينة بحاشية لؤلؤية مخيطة يدوياً على الأكمام وخط العنق. مصنوعة من قماش حرير ممتاز لإطلالة فخمة.",
      shortDescEn: "Luxurious pearl-trimmed silk abaya",
      shortDescAr: "عباية حرير فاخرة مزينة باللؤلؤ",
      basePrice: 780,
      salePrice: 650,
      costPrice: 280,
      hasColorOptions: false,
      colorCodes: [],
      isFeatured: true,
      isNewArrival: false,
      images: [
        { url: "https://images.pexels.com/photos/32545512/pexels-photo-32545512.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Pearl Trim Abaya - Front", altTextAr: "عباية اللؤلؤ - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/34440738/pexels-photo-34440738.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Pearl Trim Abaya - Pearl Detail", altTextAr: "عباية اللؤلؤ - تفاصيل اللؤلؤ", isPrimary: false, sortOrder: 2 },
        { url: "https://images.pexels.com/photos/26998033/pexels-photo-26998033.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Pearl Trim Abaya - Full Look", altTextAr: "عباية اللؤلؤ - الإطلالة الكاملة", isPrimary: false, sortOrder: 3 },
        { url: "https://images.pexels.com/photos/8664865/pexels-photo-8664865.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Pearl Trim Abaya - Back", altTextAr: "عباية اللؤلؤ - خلف", isPrimary: false, sortOrder: 4 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Standard Abaya Size Guide", titleAr: "دليل مقاسات العباية القياسية", sortOrder: 1 },
      ],
      collectionSlugs: ["occasion-wear", "best-sellers"],
      featuredTitleEn: "Pearl Perfection",
      featuredTitleAr: "إتقان اللؤلؤ",
    },
    {
      sku: "ABY-006",
      slug: "luxe-velvet-abaya",
      nameEn: "Luxe Velvet Abaya",
      nameAr: "عباية مخمل فاخرة",
      descriptionEn:
        "A showstopping velvet abaya with a mandarin collar and covered buttons. The rich texture and tailored fit make it perfect for evening events.",
      descriptionAr:
        "عباية مخملية لافتة بياقة مندرين وأزرار مغطاة. الملمس الغني والقصة المخصصة تجعلها مثالية للسهرات.",
      shortDescEn: "Rich velvet abaya with mandarin collar",
      shortDescAr: "عباية مخملية بياقة مندرين",
      basePrice: 680,
      salePrice: undefined,
      costPrice: 250,
      hasColorOptions: true,
      colorCodes: ["BRG", "FGR", "NAV"],
      isFeatured: true,
      isNewArrival: true,
      images: [
        { url: "https://images.pexels.com/photos/34262275/pexels-photo-34262275.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Luxe Velvet Abaya - Front", altTextAr: "عباية مخمل فاخرة - أمام", isPrimary: true, sortOrder: 1 },
        { url: "https://images.pexels.com/photos/33937699/pexels-photo-33937699.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Luxe Velvet Abaya - Texture", altTextAr: "عباية مخمل فاخرة - الملمس", isPrimary: false, sortOrder: 2 },
        { url: "https://images.pexels.com/photos/15071849/pexels-photo-15071849.jpeg?auto=compress&cs=tinysrgb&w=800", altTextEn: "Luxe Velvet Abaya - Collar Detail", altTextAr: "عباية مخمل فاخرة - تفاصيل الياقة", isPrimary: false, sortOrder: 3 },
      ],
      sizeGuideImages: [
        { url: "https://images.pexels.com/photos/4427654/pexels-photo-4427654.jpeg?auto=compress&cs=tinysrgb&w=600", titleEn: "Velvet Abaya Size Guide", titleAr: "دليل مقاسات عباية المخمل", sortOrder: 1 },
      ],
      collectionSlugs: ["occasion-wear", "new-arrivals"],
    },
  ];

  let totalVariants = 0;

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        shortDescEn: p.shortDescEn,
        shortDescAr: p.shortDescAr,
        basePrice: p.basePrice,
        salePrice: p.salePrice ?? null,
        costPrice: p.costPrice ?? null,
        hasColorOptions: p.hasColorOptions,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
      },
    });

    for (const img of p.images) {
      await prisma.productImage.create({
        data: { ...img, productId: product.id },
      });
    }

    for (const sg of p.sizeGuideImages) {
      await prisma.sizeGuideImage.create({
        data: { ...sg, productId: product.id },
      });
    }

    const variantColors = p.colorCodes.map((code) => colorMap.get(code)!).filter(Boolean);

    const colorOptions = p.hasColorOptions && variantColors.length > 0 ? variantColors : [null];

    for (const color of colorOptions) {
      for (const length of abayaLengths) {
        const colorSuffix = color ? `-${color.code}` : "";
        const variantSku = `${p.sku}-${length.inches}${colorSuffix}`;
        const priceAdjustment = color ? 20 : 0;

        await prisma.productVariant.create({
          data: {
            sku: variantSku,
            productId: product.id,
            abayaLengthId: length.id,
            colorId: color?.id ?? null,
            priceAdjustment: priceAdjustment,
            stock: Math.floor(Math.random() * 30) + 5,
            lowStockAlert: 5,
            isActive: true,
          },
        });
        totalVariants++;
      }
    }

    for (const slug of p.collectionSlugs) {
      const collection = collections.find((c) => c.slug === slug);
      if (collection) {
        await prisma.productCollection.create({
          data: {
            productId: product.id,
            collectionId: collection.id,
            sortOrder: 0,
          },
        });
      }
    }

    if (p.featuredTitleEn && p.featuredTitleAr) {
      await prisma.featuredProduct.create({
        data: {
          productId: product.id,
          titleEn: p.featuredTitleEn,
          titleAr: p.featuredTitleAr,
          sortOrder: products.indexOf(p) + 1,
          isActive: true,
        },
      });
    }

    console.log(`  ✅ ${p.nameEn} (${p.hasColorOptions ? variantColors.length + " colors" : "no color options"})`);
  }

  console.log(`\n  📊 Total: ${products.length} products, ${totalVariants} variants\n`);
  return products;
}

async function seedCoupons() {
  console.log("🎟️ Seeding coupons...");

  const coupons = [
    {
      code: "WELCOME10",
      descriptionEn: "10% off your first order",
      descriptionAr: "خصم 10% على طلبك الأول",
      type: "PERCENTAGE" as const,
      value: 10,
      minOrderAmount: 200,
      maxDiscount: 100,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
    {
      code: "FREE-SHIP",
      descriptionEn: "Free shipping on orders over 300 AED",
      descriptionAr: "شحن مجاني للطلبات فوق 300 ريال",
      type: "FREE_SHIPPING" as const,
      value: 0,
      minOrderAmount: 300,
      usageLimit: 500,
      perUserLimit: 2,
      isActive: true,
    },
    {
      code: "SAVE50",
      descriptionEn: "50 AED off on orders over 500 AED",
      descriptionAr: "خصم 50 ريال على الطلبات فوق 500 ريال",
      type: "FIXED_AMOUNT" as const,
      value: 50,
      minOrderAmount: 500,
      usageLimit: 200,
      perUserLimit: 1,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log(`  ✅ Created ${coupons.length} coupons\n`);
}

async function seedBanners() {
  console.log("🖼️ Seeding banners...");

  const banners = [
    {
      imageUrl: "https://images.pexels.com/photos/18960846/pexels-photo-18960846.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonTextEn: "Shop New Arrivals",
      buttonTextAr: "تسوقي الجديد",
      href: "/collections/new-arrivals",
      sortOrder: 1,
      isActive: true,
    },
    {
      imageUrl: "https://images.pexels.com/photos/14933144/pexels-photo-14933144.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonTextEn: "Explore Occasion Wear",
      buttonTextAr: "اكتشفي عبايات المناسبات",
      href: "/collections/occasion-wear",
      sortOrder: 2,
      isActive: true,
    },
    {
      imageUrl: "https://images.pexels.com/photos/7249214/pexels-photo-7249214.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonTextEn: "Best Sellers",
      buttonTextAr: "الأكثر مبيعاً",
      href: "/collections/best-sellers",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  console.log(`  ✅ Created ${banners.length} banners\n`);
}

async function seedShippingZones() {
  console.log("🚚 Seeding shipping zones...");

  const zones = [
    {
      nameEn: "Saudi Arabia - Main Cities",
      nameAr: "السعودية - المدن الرئيسية",
      countries: ["SA"],
      cities: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
      baseCost: 25,
      freeShippingMin: 300,
      estimatedDaysMin: 2,
      estimatedDaysMax: 4,
      isActive: true,
    },
    {
      nameEn: "Saudi Arabia - Other Cities",
      nameAr: "السعودية - مدن أخرى",
      countries: ["SA"],
      cities: [],
      baseCost: 35,
      freeShippingMin: 500,
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
      isActive: true,
    },
    {
      nameEn: "GCC Countries",
      nameAr: "دول الخليج",
      countries: ["AE", "KW", "BH", "QA", "OM"],
      cities: [],
      baseCost: 60,
      freeShippingMin: 800,
      estimatedDaysMin: 5,
      estimatedDaysMax: 10,
      isActive: true,
    },
  ];

  for (const z of zones) {
    await prisma.shippingZone.create({ data: z });
  }

  console.log(`  ✅ Created ${zones.length} shipping zones\n`);
}

async function seedSiteSettings() {
  console.log("⚙️ Seeding site settings...");

  const settings = [
    { key: "store_name_en", value: "Design by Shoug" },
    { key: "store_name_ar", value: "تصميم شوق" },
    { key: "currency", value: "AED" },
    { key: "currency_symbol", value: "ر.س" },
    { key: "default_language", value: "ar" },
    { key: "tax_rate", value: "15" },
    { key: "low_stock_threshold", value: "5" },
    { key: "free_shipping_min", value: "300" },
    { key: "contact_email", value: "info@designbyshoug.com" },
    { key: "contact_phone", value: "+966500000000" },
    { key: "instagram_url", value: "https://instagram.com/designbyshoug" },
    { key: "twitter_url", value: "https://twitter.com/designbyshoug" },
    { key: "whatsapp_number", value: "+966500000000" },
  ];

  for (const s of settings) {
    await prisma.siteSettings.create({ data: s });
  }

  console.log(`  ✅ Created ${settings.length} site settings\n`);
}

async function main() {
  console.log("🌱 Starting database seeding...\n");

  await cleanDatabase();

  const abayaLengths = await seedAbayaLengths();
  const colors = await seedColors();
  const collections = await seedCollections();

  await seedProducts(abayaLengths, colors, collections);
  await seedCoupons();
  await seedBanners();
  await seedShippingZones();
  await seedSiteSettings();

  console.log("🎉 Seeding completed successfully!\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
