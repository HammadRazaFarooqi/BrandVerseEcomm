import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
} from "react-icons/fi";

function Footer() {
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Cart", href: "/cart" },
    { label: "Account", href: "/profile" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/category`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data?.category) {
        setCategories(data.category);
      }
    } catch (err) {
      console.warn("Footer category fetch failed:", err.message);
      setError("Unable to load categories.");
    }
  };

  return (
    <footer className="bg-[#0D1628] text-white pt-16 pb-10">
      <div className="container-custom grid gap-12 lg:grid-cols-4">

        {/* BRAND + DESCRIPTION */}
        <div>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold">Affi Mall</p>
          </div>

          <p className="mt-5 text-white/70 leading-relaxed">
            Your trusted marketplace for quality products.  
            Discover amazing deals and shop with confidence.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
              <div
                key={i}
                className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="text-white/70 hover:text-white transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CATEGORIES (Dynamic + Responsive) */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Categories</h3>

          {error ? (
            <p className="text-white/50 text-sm">{error}</p>
          ) : categories.length === 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="h-4 w-24 bg-white/20 rounded animate-pulse"
                ></li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.slice(0, 12).map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-white/70 hover:text-white transition"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Contact Us</h3>

          <div className="flex items-center gap-3 text-white/70">
            <FiMail className="text-primary" />
            affimall50@gmail.com
          </div>

          <div className="flex items-center gap-3 mt-3 text-white/70">
            <FiPhone className="text-primary" />
            +92 300 1234567
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="mt-12 border-t border-white/10 pt-6 text-center text-white/60">
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-4">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/about">About Us</Link>
        </div>

        © {new Date().getFullYear()} Affi Mall. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
