import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function FeaturedProducts() {
  const [featureProducts, setFeatureProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setFeatureProducts(data.products.filter((item) => item.isFeatured));
      setLoading(false);
    } catch (error) {
      console.warn(`Failed to fetch products: ${error.message}`);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <section className="section-shell bg-surface">
      <div className="container-custom">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3 text-ink-muted">Featured Picks</p>
            <h2 className="text-4xl font-semibold text-ink">
              Top Products of the Week
            </h2>
            <p className="mt-3 text-ink-muted max-w-2xl">
              Discover trending items loved by our customers — from electronics and accessories
              to home essentials and lifestyle products.
            </p>
          </div>

          <Link
            to="/category"
            className="inline-flex items-center text-brand-900 font-semibold tracking-[0.3em] uppercase hover:text-accent"
          >
            Browse All
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-[420px] animate-pulse bg-surface-muted/60" />
            ))}
          </div>
        ) : featureProducts.length === 0 ? (
          <p className="mt-12 text-center text-brand-700">{error}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureProducts.map((product) => (
              <div key={product._id} className="group glass-card overflow-hidden rounded-2xl border border-surface-muted/60">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-surface-muted">
                    <img
                      src={product.images.primary}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                      Featured
                    </div>
                  </div>
                </Link>
                <div className="p-5 space-y-3">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-semibold text-ink line-clamp-2">{product.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-brand-500">PKR {product.price}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-ink-muted">incl. tax</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    {"★★★★★"}
                    <span className="text-ink-muted text-xs">(4.8)</span>
                  </div>
                  <button className="btn btn-primary w-full justify-center">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
