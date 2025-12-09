import { useEffect, useRef, useState } from "react";
import { FiLogIn, FiShoppingCart } from "react-icons/fi";
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);
  const profileMenuRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Helper function to get initials
  const getInitials = (user) => {
    if (!user) {
      return "";
    }

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

    for (const field of fields) {
      if (field && typeof field === 'string' && field.trim()) {
        const trimmed = field.trim();
        const words = trimmed.split(/\s+/);

        if (words.length >= 2) {
          return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else if (words.length === 1) {
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

      if (user && user.role) {
        setUserRole(user.role);
      } else {
        setUserRole("");
      }

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

  // Fetch categories
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

  // Filter categories for search suggestions
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize user data and cart on mount
  useEffect(() => {
    loadUserData();
    updateCartCount();
  }, []);

  // Update cart periodically
  useEffect(() => {
    const interval = setInterval(updateCartCount, 2000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLogin") {
        loadUserData();
      }
    };

    const handleCustomStorage = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userDataUpdated", handleCustomStorage);

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

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    window.dispatchEvent(new Event("userDataUpdated"));
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/60 shadow-card">
        <div className="container-custom">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row: Logo, Cart, Profile */}
            <div className="flex items-center justify-between py-4">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'44\' height=\'44\' viewBox=\'0 0 44 44\'><rect width=\'100%\' height=\'100%\' fill=\'%23ffffff\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial, sans-serif\' font-size=\'10\' fill=\'%23000000\'>Affi Mall</text></svg>';
                  }}
                  className="w-9 h-9 object-contain"
                  alt="Affi Mall"
                />
                <span className="font-serif text-xl font-semibold text-ink">
                  Affi Mall
                </span>
              </Link>

              <div className="flex items-center gap-2">
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center h-10 w-10 rounded-full border border-surface-muted bg-white"
                >
                  <FiShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white shadow-card">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Icon with Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-surface-muted bg-white"
                  >
                    {isLoggedIn && initial ? (
                      <span className="font-bold uppercase text-sm text-ink">
                        {initial}
                      </span>
                    ) : (
                      <FiLogIn size={18} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl border rounded-lg py-2 z-50">
                      <button
                        onClick={() => {
                          navigate(isLoggedIn ? "/profile" : "/login");
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        {isLoggedIn ? "Profile" : "Login"}
                      </button>

                      {isLoggedIn && userRole === "admin" && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Admin Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => {
                          navigate("/support");
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Customer Support
                      </button>

                      {isLoggedIn && (
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm border-t mt-1"
                        >
                          Logout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Bar Row */}
            <div className="pb-4">
              <div className="flex gap-2 relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search Categories..."
                  className="flex-1 rounded-full border border-surface-muted px-4 py-2 focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (!filteredCategories || filteredCategories.length === 0) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setFocusedIndex((prev) =>
                        prev + 1 < filteredCategories.length ? prev + 1 : 0
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setFocusedIndex((prev) =>
                        prev - 1 >= 0 ? prev - 1 : filteredCategories.length - 1
                      );
                    }

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
                  className="btn btn-primary bg-ink text-white px-4 py-2 rounded-full text-sm"
                  onClick={() => {
                    if (!searchQuery) return;

                    if (filteredCategories?.length > 0) {
                      handleSelectCategory(filteredCategories[focusedIndex].slug);
                    } else {
                      const slug = searchQuery.trim().toLowerCase().replace(/\s+/g, "-");
                      handleSelectCategory(slug);
                    }
                  }}
                >
                  Search
                </button>

                {showSuggestions && filteredCategories?.length > 0 && (
                  <ul className="absolute top-full mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                    {filteredCategories.map((cat, index) => (
                      <li
                        key={index}
                        className={`px-4 py-2 cursor-pointer text-sm ${
                          index === focusedIndex ? "bg-gray-100" : "hover:bg-gray-100"
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
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between gap-4 py-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'44\' height=\'44\' viewBox=\'0 0 44 44\'><rect width=\'100%\' height=\'100%\' fill=\'%23ffffff\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial, sans-serif\' font-size=\'10\' fill=\'%23000000\'>Affi Mall</text></svg>';
                }}
                className="w-11 h-11 object-contain"
                alt="Affi Mall"
              />
              <span className="font-serif text-2xl font-semibold text-ink">
                Affi Mall
              </span>
            </Link>

            <div className="flex flex-1 max-w-2xl gap-3 mx-4 relative" ref={searchRef}>
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
                  if (!filteredCategories || filteredCategories.length === 0) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                      prev + 1 < filteredCategories.length ? prev + 1 : 0
                    );
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setFocusedIndex((prev) =>
                      prev - 1 >= 0 ? prev - 1 : filteredCategories.length - 1
                    );
                  }

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
                onClick={() => {
                  if (!searchQuery) return;

                  if (filteredCategories?.length > 0) {
                    handleSelectCategory(filteredCategories[focusedIndex].slug);
                  } else {
                    const slug = searchQuery.trim().toLowerCase().replace(/\s+/g, "-");
                    handleSelectCategory(slug);
                  }
                }}
              >
                Search
              </button>

              {showSuggestions && filteredCategories?.length > 0 && (
                <ul className="absolute top-full mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                  {filteredCategories.map((cat, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${
                        index === focusedIndex ? "bg-gray-100" : "hover:bg-gray-100"
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

              {isLoggedIn && userRole === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-1 border border-surface-muted px-3 py-2 rounded-full hover:bg-gray-100 transition"
                >
                  Admin Dashboard
                </button>
              )}

              <Link
                to="/cart"
                className="relative flex items-center gap-2 rounded-full border border-surface-muted bg-transparent px-4 py-2 text-ink transition hover:-translate-y-0.5 hover:border-ink"
              >
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white shadow-card">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to={isLoggedIn ? "/profile" : "/login"}
                className="flex items-center gap-2 text-ink transition hover:-translate-y-0.5"
              >
                {isLoggedIn && initial ? (
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
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;