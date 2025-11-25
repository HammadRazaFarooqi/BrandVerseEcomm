// import HeroSection from "../components/HeroSection";

import FeaturedCategories from "../components/FeaturedCategories";
import FeaturedProducts from "../components/FeaturedProducts";
import FeatureSection from "../components/FeatureSection";
import HeroSection from "../components/HeroSection";
import NewsLetterSection from "../components/NewsLetterSection";

function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedCategories />
      <FeatureSection />
      <FeaturedProducts />
      <NewsLetterSection />
    </div>
  );
}

export default Home;
