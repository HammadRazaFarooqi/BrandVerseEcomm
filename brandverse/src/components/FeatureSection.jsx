import { Clock, Shield, ShoppingCart } from "lucide-react";
import { FiRefreshCcw, FiShield, FiTag, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Fast & Reliable Delivery",
    description: "Nationwide shipping with real-time updates so you know exactly when your order arrives.",
    icon: FiTruck,
  },
  {
    title: "Secure Payments",
    description: "Shop confidently with trusted payment partners and encrypted checkout.",
    icon: FiShield,
  },
  {
    title: "Easy Returns",
    description: "Not satisfied? Our flexible return policy makes it simple and stress-free.",
    icon: FiRefreshCcw,
  },
  {
    title: "Best Deals & Offers",
    description: "Exclusive discounts, seasonal drops, and bundle pricing across categories.",
    icon: FiTag,
  },
];

function FeatureSection() {
  return (
    <section className="section-shell bg-white">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow mb-4">Why shop with Affi Mall</p>
            <h2 className="text-4xl font-semibold text-ink">
              Smart shopping,
              <span className="text-accent">&nbsp;made simple</span>
            </h2>
            <p className="mt-6 text-lg text-ink-muted">
              From quality products and secure payments to hassle-free returns and
              fast delivery — we’re committed to giving you a seamless shopping experience.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/category">
                <button className="btn btn-primary">Start Shopping</button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card flex h-full flex-col gap-4 rounded-3xl p-6"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5 text-ink">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="text-ink-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

  );
}

export default FeatureSection;
