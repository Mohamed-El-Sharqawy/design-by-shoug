export interface ProductCollection {
  id: string;
  productId: string;
  collectionId: string;
  sortOrder: number;
  collection?: Collection;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  shortDescEn: string | null;
  shortDescAr: string | null;
  basePrice: number;
  salePrice: number | null;
  costPrice: number | null;
  hasColorOptions: boolean;
  metaTitleEn: string | null;
  metaTitleAr: string | null;
  metaDescEn: string | null;
  metaDescAr: string | null;
  isFeatured: boolean;
  isActive: boolean;
  isNewArrival: boolean;
  viewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  sizeGuideImages?: SizeGuideImage[];
  variants?: ProductVariant[];
  collections?: ProductCollection[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altTextEn: string | null;
  altTextAr: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface SizeGuideImage {
  id: string;
  productId: string;
  url: string;
  titleEn: string | null;
  titleAr: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  abayaLengthId: string;
  colorId: string | null;
  stock: number;
  priceAdjustment: number;
  isActive: boolean;
  abayaLength?: AbayaLength;
  color?: Color | null;
}

export interface AbayaLength {
  id: string;
  inches: number;
  labelEn: string;
  labelAr: string;
  idealHeightCm: number;
  idealHeightFt: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Color {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  hexCode: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imageUrl: string | null;
  isActive: boolean;
  showOnCollectionsPage: boolean;
  showInHeader: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  imageMobileUrl: string | null;
  buttonTextEn: string | null;
  buttonTextAr: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramPost {
  id: string;
  postUrl: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  captionEn: string | null;
  captionAr: string | null;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppableVideo {
  id: string;
  titleEn: string | null;
  titleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  linkedProducts?: { productId: string; sortOrder: number }[];
}

export interface FeaturedProduct {
  id: string;
  productId: string;
  titleEn: string | null;
  titleAr: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: string;
  nameEn: string;
  nameAr: string;
  countries: string[];
  cities: string[];
  baseCost: number;
  freeShippingMin: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  coupon?: Coupon | null;
  addressId: string | null;
  notesCustomer: string | null;
  notesAdmin: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  address?: Address;
  user?: { email: string; firstName: string | null; lastName: string | null } | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productNameEn: string;
  productNameAr: string;
  variantDetails: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustomSize: boolean;
  customMeasurements: CustomMeasurements | null;
  note: string | null;
}

export interface CustomMeasurements {
  abayaLength: number;
  sleeveLength: number;
  bust: number;
  waist: number;
  hip: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  isCustomSize: boolean;
  customMeasurements: CustomMeasurements | null;
  note: string | null;
  variant?: ProductVariant;
}

export interface Address {
  id: string;
  userId: string | null;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district: string | null;
  street: string;
  building: string | null;
  apartment: string | null;
  postalCode: string | null;
  isDefault: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "CREDIT_CARD" | "APPLE_PAY";

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ReviewerType = "CUSTOMER" | "MODEL" | "INFLUENCER";

export interface CustomerReviewProduct {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  basePrice: number | string;
  salePrice: number | string | null;
  images: ProductImage[];
}

export interface CustomerReview {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  name: string;
  type: ReviewerType;
  relation: string | null;
  productId: string | null;
  product?: CustomerReviewProduct | null;
  feedbackEn: string | null;
  feedbackAr: string | null;
  rating: number;
  sortOrder: number;
  isActive: boolean;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}
