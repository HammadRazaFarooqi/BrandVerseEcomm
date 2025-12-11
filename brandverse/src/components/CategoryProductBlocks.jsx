import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function CategoryProductBlocks() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${BACKEND_URL}/category`),
          fetch(`${BACKEND_URL}/products`),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(catData?.category || []);
        setProducts(prodData?.products || []);
      } catch (err) {
        console.warn("Failed loading category blocks", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [BACKEND_URL]);

  const categoryWithProducts = useMemo(() => {
    const list = categories.length
      ? categories
      : [
          { _id: "c1", name: "Electronics", slug: "electronics" },
          { _id: "c2", name: "Fashion", slug: "fashion" },
          { _id: "c3", name: "Beauty", slug: "beauty" },
        ];
    return list.map((cat) => {
      const catProducts = products
        .filter((p) => p?.category?.slug === cat.slug)
        .slice(0, 4);
      return { ...cat, products: catProducts };
    });
  }, [categories, products]);

  return (
    <section className="section-shell bg-surface">
      <div className="container-custom space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-ink-muted">Top products of the week</p>
            <h2 className="text-4xl font-semibold text-ink">Curated by category</h2>
          </div>
        </div>

        <div className="space-y-8">
          {categoryWithProducts.map((cat) => (
            <div key={cat._id || cat.slug} className="glass-card rounded-[20px] p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="eyebrow text-ink-muted">{cat.slug || "category"}</p>
                  <h3 className="text-2xl font-semibold text-ink">{cat.name}</h3>
                </div>
                <Link
                  to={`/category/${cat.slug}`}
                  className="btn btn-secondary px-4 py-2 text-sm"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card h-56 animate-pulse bg-surface-muted/60" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {cat.products.length === 0 ? (
                    <div className="col-span-full text-ink-muted">No products yet in this category.</div>
                  ) : (
                    cat.products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="glass-card rounded-xl border border-surface-muted/60 overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="h-40 bg-surface-muted/60 overflow-hidden">
                          <img
                            src={product.images?.primary}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-sm font-semibold text-ink line-clamp-1">{product.title}</p>
                          <p className="text-brand-500 font-bold">PKR {product.price}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryProductBlocks;

