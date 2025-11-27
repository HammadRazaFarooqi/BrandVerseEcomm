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
    <section className="section-shell bg-white">
      {/* <div className="container-custom">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Featured Picks</p>
            <h2 className="text-4xl font-semibold text-ink">
              Top Products of the Week
            </h2>
            <p className="mt-3 text-ink-muted">
              Discover trending items loved by our customers — from electronics and accessories
              to home essentials and lifestyle products.
            </p>
          </div>

          <Link
            to="/category"
            className="inline-flex items-center text-ink font-semibold tracking-[0.3em] uppercase"
          >
            Browse All
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-[420px] animate-pulse" />
            ))}
          </div>
        ) : featureProducts.length === 0 ? (
          <p className="mt-12 text-center text-red-500">{error}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group"
              >
                <div className="glass-card h-full overflow-hidden rounded-[2rem]">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={product.images.primary}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    <div className="absolute top-5 left-5 rounded-full bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.3em] text-ink">
                      Limited
                    </div>
                    <div className="absolute bottom-5 left-5 text-white">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                        Starting from
                      </p>
                      <p className="text-2xl font-semibold">
                        PKR {product.price}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-ink">
                      {product.title}
                    </h3>
                    <p className="mt-3 text-sm uppercase tracking-[0.4em] text-ink-muted">
                      View Product
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div> */}
    </section>
  );
}

export default FeaturedProducts;
