import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
          <p className="eyebrow mb-3">Curated departments</p>
          <h2 className="text-4xl font-semibold text-ink">Shop by category</h2>
          <p className="mt-4 text-ink-muted">
            Discover tailored edits across occasionwear, everyday essentials,
            and statement pieces from our most-loved designers.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category._id}
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
                    {/* <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                      Capsule
                    </p> */}
                    <h3 className="text-2xl font-semibold text-white">
                      {category.name}
                    </h3>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-white/80">
                      Explore collection
                      <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCategories;
