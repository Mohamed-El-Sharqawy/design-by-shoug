import { getTranslations } from "next-intl/server";
import type { CustomerReview } from "@repo/types";
import { CustomerReviewsCarousel } from "./CustomerReviewsCarousel";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getReviews(): Promise<CustomerReview[]> {
  try {
    const res = await fetch(`${API_URL}/customer-reviews`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function CustomerReviews() {
  const [reviews, t] = await Promise.all([
    getReviews(),
    getTranslations("Home"),
  ]);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <CustomerReviewsCarousel
      reviews={reviews}
      translations={{
        sectionTitle: t("customerReviews"),
        reviewedProduct: t("reviewedProduct"),
        viewProduct: t("viewProduct"),
        collectedWithConsent: t("collectedWithConsent"),
        reviewerCustomer: t("reviewerCustomer"),
        reviewerModel: t("reviewerModel"),
        reviewerInfluencer: t("reviewerInfluencer"),
      }}
    />
  );
}
