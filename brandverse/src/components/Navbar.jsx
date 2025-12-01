import { useEffect, useState, useRef } from "react";
import { FiLogIn, FiMenu, FiShoppingCart, FiX, FiChevronDown, FiBell } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [initial, setInitial] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [userRole, setUserRole] = useState("");
  const searchRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Helper function to get initials - UNCHANGED
  const getInitials = (user) => {
    if (!user) {
      return "";
    }

    // Try different field combinations
    const fields = [
      user.fullName,
      user.full_name,
      user.name,
      (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : null,
      (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : null,
      user.firstName,
      user.first_name,
      user.username,
      user.email
    ];

    // Find first non-empty field
    for (const field of fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const trimmed = field.trim();
        const words = trimmed.split(/\s+/);

        if (words.length >= 2) {
          // Multiple words: first letter of first word + first letter of last word
          return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else if (words.length === 1) {
          // Single word: just first letter
          return words[0][0].toUpperCase();
        }
      }
    }
    return "?";
  };

  // Load user data and set login state
  const loadUserData = () => {
    try {
      const storedData = localStorage.getItem("isLogin");

      if (!storedData) {
        setIsLoggedIn(false);
        setInitial('');
        setUserRole("");
        return;
      }

      const userData = JSON.parse(storedData);

      // Extract user
      let user = null;
      if (userData.user) {
        user = userData.user;
      } else if (userData.data && userData.data.user) {
        user = userData.data.user;
      } else if (userData.customer) {
        user = userData.customer;
      } else if (userData.email || userData.username) {
        user = userData;
      }

      // Set role AFTER user is defined
      if (user && user.role) {
        setUserRole(user.role);
      } else {
        setUserRole("");
      }

      // Set login and initials
      if (user && (user.email || user.username || user.name || user.fullName)) {
        setIsLoggedIn(true);
        setInitial(getInitials(user));
      } else {
        setIsLoggedIn(false);
        setInitial('');
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      setIsLoggedIn(false);
      setInitial('');
      setUserRole("");
    }
  };


  // Update cart count
  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = storedCart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(total);
  };

  // Fetch categories (UNCHANGED)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/category`);
        if (response) {
          const data = await response.json();

          if (data.success && data.category) {
            const parentCategories = data.category.filter(cat => !cat.parentCategory);

            const formattedCategories = parentCategories.map(parentCat => {
              const childCategories = data.category.filter(
                cat => cat.parentCategory === parentCat.name
              );

              return {
                _id: parentCat._id,
                name: parentCat.name.charAt(0).toUpperCase() + parentCat.name.slice(1),
                path: `/category/${parentCat.slug}`,
                slug: parentCat.slug,
                image: parentCat.image,
                description: parentCat.description,
                comingSoon: parentCat.comingSoon,
                subcategories: childCategories.map(childCat => ({
                  _id: childCat._id,
                  name: childCat.name.charAt(0).toUpperCase() + childCat.name.slice(1),
                  path: `/category/${childCat.slug}`,
                  slug: childCat.slug,
                  image: childCat.image,
                  description: childCat.description,
                  comingSoon: childCat.comingSoon
                }))
              };
            });

            setCategories(formattedCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [BACKEND_URL]);

  // Filter categories for search suggestions (UNCHANGED)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories([]);
    } else {
      const allCategories = [];
      categories.forEach(cat => {
        allCategories.push({ name: cat.name, slug: cat.slug });
        cat.subcategories.forEach(sub => {
          allCategories.push({ name: sub.name, slug: sub.slug });
        });
      });

      const filtered = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }

    setFocusedIndex(0);
  }, [searchQuery, categories]);


  // Close menus when clicking outside (UNCHANGED)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize user data and cart on mount (UNCHANGED)
  useEffect(() => {
    loadUserData();
    updateCartCount();
  }, []);

  // Update cart periodically (UNCHANGED)
  useEffect(() => {
    const interval = setInterval(updateCartCount, 2000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes (SOLUTION IMPLEMENTED HERE)
  useEffect(() => {
    // 1. Storage Event (for other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "isLogin") { // Only update if "isLogin" changes
        loadUserData();
      }
    };

    // 2. Custom Event (for current tab, triggered after login/register)
    const handleCustomStorage = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userDataUpdated", handleCustomStorage); // THIS IS THE KEY FIX

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userDataUpdated", handleCustomStorage);
    };
  }, []);

  const toggleMobileSubcategory = (categoryId) => {
    setExpandedMobileCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const handleSelectCategory = (slug) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/category/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/60 shadow-card">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 py-4 flex-wrap">
            <Link to="/" className="flex items-center space-x-3">
              <div>
                <img src="logo.png" className="w-11 h-11 object-contain" alt="Brand Verse" />
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold text-ink block leading-tight">
                  Brand Verse
                </span>
              </div>
            </Link>

            <div className="flex flex-1 max-w-2xl gap-2 sm:gap-3 mx-4 relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search Categories..."
                className="flex-1 rounded-full border border-surface-muted px-4 py-2 focus:outline-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                onKeyDown={(e) => {
                  // No suggestions — do nothing
                  if (!filteredCategories || filteredCategories.length === 0) return;

                  // DOWN ARROW
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                      prev + 1 < filteredCategories.length ? prev + 1 : 0
                    );
                  }

                  // UP ARROW
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                      prev - 1 >= 0 ? prev - 1 : filteredCategories.length - 1
                    );
                  }

                  // ENTER
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const item = filteredCategories[focusedIndex];
                    if (item) {
                      handleSelectCategory(item.slug);
                    }
                  }
                }}
              />

              <button
                className="btn btn-primary bg-ink text-white px-4 py-2 rounded-full"
                onClick={() =>
                  searchQuery &&
                  filteredCategories?.length > 0 &&
                  handleSelectCategory(filteredCategories[focusedIndex].slug)
                }
              >
                Search
              </button>

              {showSuggestions && filteredCategories?.length > 0 && (
                <ul className="absolute top-full mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                  {filteredCategories.map((cat, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${index === focusedIndex ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                      onMouseEnter={() => setFocusedIndex(index)}
                      onClick={() => handleSelectCategory(cat.slug)}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link to="/support">
                <button className="flex items-center justify-center border border-surface-muted p-2 rounded-full hover:bg-gray-100 transition">
                  <RiCustomerService2Line size={20} />
                </button>
              </Link>
              {isLoggedIn && userRole === "admin" ? (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-1 border border-surface-muted px-3 py-2 rounded-full hover:bg-gray-100 transition"
                >
                  Admin Dashboard
                </button>
              ) : (
                <button className="relative flex items-center justify-center border border-surface-muted p-2 rounded-full hover:bg-gray-100 transition">
                  <FiBell size={20} />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>
              )}

              <Link
                to="/cart"
                className="relative flex items-center gap-2 rounded-full border border-surface-muted bg-white/70 px-4 py-2 text-ink transition hover:-translate-y-0.5 hover:border-ink"
              >
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white shadow-card">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to={isLoggedIn ? "/profile" : "/login"} // Ensure it navigates to login if not logged in
                className="flex items-center gap-2 text-ink transition hover:-translate-y-0.5"
              >
                {isLoggedIn && initial ? ( // Check if initial is also available
                  <div className="flex items-center gap-5 rounded-full border border-black/10 bg-black text-white">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase">
                      {initial}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-surface-muted px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-ink">
                    <FiLogIn />
                    Login
                  </div>
                )}
              </Link>
            </div>

            <button
              className="md:hidden rounded-full border border-surface-muted p-3 text-ink"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (UNCHANGED) */}
      {isOpen && (
        <div className="md:hidden border-b border-white/60 bg-white/90 backdrop-blur">
          <div className="container-custom py-6 space-y-6">
            <Link
              to="/"
              className="block text-ink font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <div className="space-y-3 rounded-2xl border border-surface-muted p-4">
              <div className="text-sm uppercase tracking-[0.3em] text-ink-muted">
                Shop by category
              </div>
              {isLoading ? (
                <div className="text-ink-muted">Loading categories...</div>
              ) : categories?.length > 0 ? (
                categories.map((category) => (
                  <div key={category._id}>
                    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-ink">
                      <Link
                        to={category.path}
                        className="flex-1 font-medium"
                        onClick={(e) => {
                          if (category.subcategories?.length > 0) {
                            e.preventDefault();
                            toggleMobileSubcategory(category._id);
                          } else {
                            setIsOpen(false);
                          }
                        }}
                      >
                        {category.name}
                      </Link>
                      {category.subcategories?.length > 0 && (
                        <button
                          className="p-1 text-ink-muted"
                          onClick={() => toggleMobileSubcategory(category._id)}
                        >
                          <FiChevronDown
                            className={`transition ${expandedMobileCategory === category._id
                              ? "rotate-180"
                              : ""
                              }`}
                          />
                        </button>
                      )}
                    </div>
                    {category.subcategories?.length > 0 &&
                      expandedMobileCategory === category._id && (
                        <div className="ml-4 border-l border-surface-muted pl-4">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory._id}
                              to={subcategory.path}
                              className="block py-2 text-sm text-ink-muted"
                              onClick={() => setIsOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                          <Link
                            to={category.path}
                            className="block py-2 text-xs uppercase tracking-[0.3em] text-ink"
                            onClick={() => setIsOpen(false)}
                          >
                            View collection
                          </Link>
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <div className="text-ink-muted">No categories available</div>
              )}
            </div>

            <Link
              to="/cart"
              className="flex items-center justify-between rounded-2xl border border-surface-muted px-4 py-3 text-ink"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <FiShoppingCart />
                <span>Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to={isLoggedIn ? "/profile" : "/login"} // Mobile navigation fix
              className="flex items-center justify-between rounded-2xl border border-surface-muted px-4 py-3 text-ink"
              onClick={() => setIsOpen(false)}
            >
              {isLoggedIn && initial ? (
                <span className="rounded-full bg-ink px-3 py-1 text-white">
                  {initial}
                </span>
              ) : (
                <>
                  <span className="text-sm uppercase tracking-[0.3em]">
                    Login / Register
                  </span>
                  <FiLogIn />
                </>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;