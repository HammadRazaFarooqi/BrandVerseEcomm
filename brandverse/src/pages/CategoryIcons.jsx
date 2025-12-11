import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CategoryIcons() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/category`);
        const data = await res.json();
        setCategories(data?.category || []);
      } catch (err) {
        console.warn("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [BACKEND_URL]);

  return (
    <section className="bg-surface py-16">
      <div className="container-custom space-y-8">
        <div className="text-center">
          <p className="eyebrow text-ink-muted">All Categories</p>
          <h1 className="text-4xl font-semibold text-ink">Browse by category</h1>
          <p className="mt-2 text-ink-muted">Tap any category to see all products.</p>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="glass-card flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-16 w-16 overflow-hidden rounded-full bg-white border border-surface-muted">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-muted" />
                  )}
                </div>
                <p className="text-sm font-semibold text-ink text-center">{cat.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryIcons;

