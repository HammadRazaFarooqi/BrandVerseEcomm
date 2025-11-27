import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/category`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setCategories(data.category);
    } catch (error) {
      console.warn(`Failed to fetch categories: ${error.message}`);
      setError("Failed to load categories. Please try again later.");
    }
  };

  return (
    <section className="section-shell bg-surface">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="eyebrow mb-3">Featured collections</p>
          <h2 className="text-4xl font-semibold text-ink">Shop by category</h2>
          <p className="mt-4 text-ink-muted">
            Browse our most popular product categories — electronics, fashion, home & lifestyle,
            beauty, and more. Find everything you need in one place.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              spaceBetween={20}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="my-6"
            >
              {categories.map((category) => (
                <SwiperSlide key={category._id}>
                  <Link
                    to={`category/${category.slug}`}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-card"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                      <div className="absolute inset-4 rounded-[1.5rem] border border-white/10" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-semibold text-white">
                          {category.name}
                        </h3>
                        <span className="mt-3 inline-flex items-center text-sm font-medium text-white/80">
                          View products
                          <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}

              {/* Swiper navigation arrows */}
              <div className="swiper-button-next text-white after:!text-white" />
              <div className="swiper-button-prev text-white after:!text-white" />
            </Swiper>

            {/* Visible slider hint button */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button
                className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/40 transition"
                onClick={() => document.querySelector('.swiper-button-next').click()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}


      </div>
    </section>
  );
}

export default FeaturedCategories;
