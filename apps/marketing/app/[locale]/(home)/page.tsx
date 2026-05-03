import { Banners } from "./components/Banners";
import { Collections } from "./components/Collections";
import { NewArrivals } from "./components/NewArrivals";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { CustomerReviews } from "./components/CustomerReviews";
import { FromInstagram } from "./components/FromInstagram";

export default async function HomePage() {
  return (
    <>
      <Banners />
      <Collections />
      <NewArrivals />
      <FeaturedProducts />
      <CustomerReviews />
      <FromInstagram />
    </>
  );
}
