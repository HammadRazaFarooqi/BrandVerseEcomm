function Footer() {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/category" },
    { label: "Cart", href: "/cart" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <footer className="bg-ink text-white">
      <div className="container-custom py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Brand Verse
            </p>
            <h3 className="mt-3 text-3xl font-semibold">
              M&A TRADAX LIMITED
            </h3>
            <p className="mt-4 text-white/70">
              69 Wilshaw Lane, Ashton-Under-Lyne, OL7 9QX, United Kingdom
            </p>
            <p className="mt-6 text-white/70">
              support@brandverse.com · +44 123 456 7890
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/80 transition hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-white/60">
          &copy; {new Date().getFullYear()} Brand Verse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;