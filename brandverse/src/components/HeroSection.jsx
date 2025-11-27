import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const heroStats = [
  { label: "Products Available", value: "10k+" },
  { label: "Brands", value: "180+" },
  { label: "Orders Delivered", value: "150k+" },
];

function HeroSection() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // useEffect(() => {
  //   const fetchPromotions = async () => {
  //     try {
  //       const response = await fetch(`${BACKEND_URL}/promotions`);

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch promotions");
  //       }

  //       const data = await response.json();
  //       setPromotions(data.promotion || []);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Error fetching promotions:", err);
  //       setError("Failed to load promotional content");
  //       setLoading(false);
  //     }
  //   };

  //   fetchPromotions();
  // }, [BACKEND_URL]);

  useEffect(() => {
    // Auto-advance slides
    if (promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [promotions.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + promotions.length) % promotions.length
    );
  }, [promotions.length]);

  // Don't render anything if there are no promotions
  const renderContent = (imageUrl) => (
    <div className="relative z-10 flex min-h-[90vh] flex-col justify-center py-20">
      <div className="container-custom grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8 text-left">
        <p className="eyebrow">Everything you love — in one store</p>
<h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
  Shop <span className="text-accent-soft">smart</span>, shop{" "}
  <span className="text-accent-soft">better</span>.
</h1>
<p className="text-lg text-white/80 lg:text-xl">
  Explore trending products across electronics, fashion, beauty, kitchen,
  gadgets and more — premium quality with exclusive deals.
</p>
<div className="flex flex-col gap-3 sm:flex-row">
  <Link to="/products" className="btn btn-primary bg-white text-ink">
    Start Shopping
  </Link>
</div>

          <div className="grid gap-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-3xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="glass-card relative h-[520px] overflow-hidden rounded-[2.5rem]">
            <img
              src={imageUrl}
              alt="Editorial fashion"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">
  Top Picks
</p>
<p className="text-2xl font-semibold">
  Best deals, daily.
</p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        {renderContent(
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200"
        )}
      </section>
    );
  }

  if (error || promotions.length === 0) {
    return (
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-10 top-10 h-60 w-60 rounded-full bg-accent blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/20 blur-[180px]" />
        </div>
        {renderContent(
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200"
        )}
      </section>
    );
  }

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-hero-gradient text-white">
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/40 blur-[200px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-white/10 blur-[220px]" />
      </div>

      <div className="relative h-full w-full">
        {promotions.map((promo, index) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {renderContent(promo.image)}
          </div>
        ))}
      </div>

      {promotions.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
            aria-label="Next slide"
          >
            <FiChevronRight size={24} />
          </button>
          <div className="relative z-30 flex justify-center pb-10">
            <div className="flex gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default HeroSection;
