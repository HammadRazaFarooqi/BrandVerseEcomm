import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/products`);
        const data = await res.json();
        setProducts(data?.products || []);
      } catch (err) {
        console.warn("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [BACKEND_URL]);

  return (
    <section className="bg-surface py-16">
      <div className="container-custom space-y-8">
        <div>
          <p className="eyebrow text-ink-muted">All products</p>
          <h1 className="text-4xl font-semibold text-ink">Browse everything</h1>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="glass-card rounded-2xl overflow-hidden border border-surface-muted/60 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-52 bg-surface-muted/60 overflow-hidden">
                  <img
                    src={product.images?.primary}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-lg font-semibold text-ink line-clamp-2">{product.title}</p>
                  <p className="text-brand-500 font-bold">PKR {product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;

