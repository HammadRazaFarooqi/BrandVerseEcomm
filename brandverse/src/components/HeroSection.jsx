import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const heroStats = [
  { label: "Products Available", value: "10k+" },
  { label: "Brands", value: "180+" },
  { label: "Orders Delivered", value: "150k+" },
];

function HeroSection() {
  const sliderImages = [
    "/hero-slides/slide1.jpg",
    "/hero-slides/slide2.jpg",
    "/hero-slides/slide3.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  }, [sliderImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  }, [sliderImages.length]);

  const goToSlide = (index) => setCurrentSlide(index);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const renderLeftContent = () => (
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
  );

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-hero-gradient text-white">
      {/* Background glowing blobs */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/40 blur-[200px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-white/10 blur-[220px]" />
      </div>

      <div className="container-custom relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center py-20">
        {renderLeftContent()}

        {/* IMAGE CAROUSEL - Mobile and Desktop */}
        <div className="relative">
          <div className="relative h-[400px] lg:h-[520px] overflow-hidden rounded-[2.5rem] glass-card">

            {sliderImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

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

      {/* SLIDER CONTROLS - Desktop Only */}
      {sliderImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden lg:block absolute left-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="hidden lg:block absolute right-8 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
            aria-label="Next slide"
          >
            <FiChevronRight size={24} />
          </button>

          {/* DOTS */}
          <div className="relative z-30 flex justify-center pb-10">
            <div className="flex gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              {sliderImages.map((_, index) => (
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