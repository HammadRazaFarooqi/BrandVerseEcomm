import { Clock, Shield, ShoppingCart } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Seamless experience",
    description:
      "Personalised edits, wishlist syncing, and one-click checkout across devices.",
  },
  {
    icon: Shield,
    title: "Trusted craftsmanship",
    description:
      "Every piece is authenticated and inspected to meet atelier-level standards.",
  },
  {
    icon: Clock,
    title: "Express fulfilment",
    description:
      "Priority dispatch with real-time tracking and flexible delivery windows.",
  },
];

function FeatureSection() {
  return (
    <section className="section-shell bg-white">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow mb-4">The Brand Verse promise</p>
            <h2 className="text-4xl font-semibold text-ink">
              Luxury retailing,
              <span className="text-accent">&nbsp;reimagined</span>
            </h2>
            <p className="mt-6 text-lg text-ink-muted">
              From curated lookbooks to post-purchase care, every touchpoint is
              crafted to feel personal, polished, and effortless.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="btn btn-primary">Discover the story</button>
              <button className="btn btn-secondary">Book a stylist</button>
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
