import { useEffect, useMemo, useState } from "react";
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
      if (response) {
        const data = await response?.json();
        setCategories(data?.category);
      }
    } catch (error) {
      console.warn(`Failed to fetch categories: ${error.message}`);
      setError("Failed to load categories. Please try again later.");
    }
  };

  const withFallback = useMemo(() => {
    if (categories?.length > 0) return categories;
    // Fallback generic categories to keep layout consistent
    return [
      { _id: "c1", name: "Electronics", slug: "electronics" },
      { _id: "c2", name: "Fashion", slug: "fashion" },
      { _id: "c3", name: "Beauty", slug: "beauty" },
      { _id: "c4", name: "Groceries", slug: "groceries" },
      { _id: "c5", name: "Accessories", slug: "accessories" },
      { _id: "c6", name: "Home Items", slug: "home-items" },
      { _id: "c7", name: "Kitchen Tools", slug: "kitchen-tools" },
      { _id: "c8", name: "Gadgets", slug: "gadgets" },
    ];
  }, [categories]);

  return (
    <section className="section-shell bg-surface">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="eyebrow mb-3 text-ink-muted">Explore categories</p>
          <h2 className="text-4xl font-semibold text-ink">Everything in one marketplace</h2>
          <p className="mt-4 text-ink-muted">
            Auto-generated categories that flex for any catalog—fashion, tech, home, beauty, groceries, and more.
          </p>
        </div>

        {categories?.length === 0 && !error ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/60 bg-white/70 animate-pulse h-40"
              />
            ))}
          </div>
        ) : categories?.length === 0 && error ? (
          <p className="text-center text-brand-700">{error}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {withFallback.map((category) => (
              <Link
                key={category._id}
                to={`category/${category.slug}`}
                className="group rounded-2xl border border-white/80 bg-white shadow-card p-4 flex flex-col items-center gap-3 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 overflow-hidden border border-surface-muted">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-muted" />
                  )}
                </div>
                <p className="text-base font-semibold text-ink text-center">{category.name}</p>
                <span className="text-xs uppercase tracking-[0.3em] text-brand-500 opacity-0 group-hover:opacity-100 transition">
                  View
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCategories;
