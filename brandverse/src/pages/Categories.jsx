
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";

function Categories() {
  const { category } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [currentCategoryData, setCurrentCategoryData] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const getProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.warn(`Fetching products failed: ${error.message}`);
      setError("No products found.");
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/category`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      // Create a flat list of all categories with proper mappings
      const formattedCategory = [
        { id: "all", name: "All", slug: "all" }, // Ensure this is the first item
        ...data.category.map((category) => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          parentCategory: category.parentCategory,
          comingSoon: category.comingSoon || false,
        })),
      ];

      setCategoryList(formattedCategory);

      // Create tree structure
      const buildCategoryTree = () => {
        // Find root level categories (those with no parent or parent is null)
        const rootCategories = [
          { id: "all", name: "All", slug: "all" }, // Always include "All" at the root
          ...data.category
            .filter((cat) => !cat.parentCategory)
            .map((cat) => ({
              id: cat._id,
              name: cat.name,
              slug: cat.slug,
              comingSoon: cat.comingSoon || false,
              parentCategory: null,
              children: [],
            })),
        ];

        // Find children for each parent category
        rootCategories.forEach((parent) => {
          if (parent.id !== "all") {
            // Skip "All" category
            parent.children = data.category
              .filter((cat) => cat.parentCategory === parent.id)
              .map((child) => ({
                id: child._id,
                name: child.name,
                slug: child.slug,
                comingSoon: child.comingSoon || false,
                parentCategory: child.parentCategory,
              }));
          }
        });

        return rootCategories;
      };

      setCategoryTree(buildCategoryTree());
    } catch (error) {
      console.warn(`Failed to fetch categories: ${error.message}`);
      setError("Failed to load categories. Please try again later.");
    }
  };
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) =>
        item?.category?.name?.includes(selectedCategory)
      );
    }

    // Update current category data
    const currentCategory = categoryList.find(
      (cat) => cat.slug === selectedCategory
    );
    setCurrentCategoryData(currentCategory);
    // Sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, categoryList]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category.toLowerCase());
    }
    getProducts();
    getCategories();
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Function to check if we should display "Coming Soon"
  const shouldShowComingSoon = () => {
    return (
      currentCategoryData &&
      currentCategoryData.comingSoon === true &&
      filteredProducts?.length === 0
    );
  };

  return (
    <section className="bg-surface py-16">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">The collection</p>
            <h1 className="text-4xl font-semibold text-ink">Curated pieces</h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary md:hidden"
          >
            {showFilters ? <FiX /> : <FiFilter />}
            Filters
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-8 md:flex-row">
          <div
            className={`${showFilters ? "block" : "hidden"
              } md:block w-full md:w-72`}
          >
            <div className="glass-card rounded-3xl p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-ink-muted">
                Categories
              </p>
              <div className="mt-6 space-y-4">
                {categoryTree.map((category) => (
                  <div key={category.id}>
                    <label className="flex items-center gap-3 text-ink">
                      <input
                        type="radio"
                        name="category"
                        value={category.slug}
                        checked={selectedCategory === category.slug}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="accent-ink"
                      />
                      {category.name}
                    </label>
                    {category?.children && category.children?.length > 0 && (
                      <div className="ml-6 mt-2 space-y-2 text-sm text-ink-muted">
                        {category.children.map((child) => (
                          <label
                            key={child.id}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={child.slug}
                              checked={selectedCategory === child.slug}
                              onChange={(e) =>
                                setSelectedCategory(e.target.value)
                              }
                              className="accent-ink"
                            />
                            {child.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-end gap-4">
              <label className="text-sm text-ink-muted">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-surface-muted bg-white px-4 py-2 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card h-80 animate-pulse" />
                  ))}
                </div>
              ) : shouldShowComingSoon() ? (
                <div className="glass-card flex flex-col items-center justify-center rounded-[2rem] p-12 text-center">
                  <h2 className="text-3xl font-semibold text-ink">
                    Coming soon
                  </h2>
                  <p className="mt-4 max-w-md text-ink-muted">
                    We&apos;re curating bespoke looks for this category. Check
                    back shortly for fresh arrivals.
                  </p>
                </div>
              ) : filteredProducts?.length === 0 ? (
                <p className="text-center text-red-500">
                  {error || "No products found in this category."}
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((item) => (
                    <Link key={item._id} to={`/product/${item._id}`}>
                      <div className="glass-card h-full overflow-hidden rounded-[2rem]">
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={item.images.primary}
                            alt="Product"
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                          {item.discountRate > 0 && (
                            <div className="absolute top-4 right-4 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-ink">
                              -{item.discountRate}%
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-ink">
                            {item.title}
                          </h3>
                          {item.discountedPrice && item.discountedPrice < item.price ? (
                            <>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-ink-muted line-through mr-2">
                                PKR {item.price}
                              </span>
                              <span className="text-xl font-semibold text-ink">
                                PKR {item.discountedPrice}
                              </span>

                            </div>
                              <span className="inline-block rounded-lg bg-black mt-4 px-3 mr-20 text-xs font-bold text-white uppercase tracking-wide">
                                Save {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}%
                              </span></>
                          ) : (
                            <p className="mt-3 text-xl font-semibold text-ink">
                              PKR {item.price}
                            </p>
                          )}

                          <span className="mt-4 inline-flex text-xs uppercase tracking-[0.3em] text-ink-muted">
                            View details
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
