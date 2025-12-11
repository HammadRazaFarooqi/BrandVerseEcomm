import { FiPhoneCall, FiMessageCircle, FiHeadphones } from "react-icons/fi";

function SupportSection() {
  const options = [
    {
      label: "Call Us",
      description: "Talk to a specialist right away",
      icon: FiPhoneCall,
      action: "tel:+92-000-0000000",
    },
    {
      label: "Live Support",
      description: "Chat with our team for quick help",
      icon: FiHeadphones,
      action: "/support",
    },
  ];

  return (
    <section className="section-shell bg-surface">
      <div className="container-custom">
        <div className="glass-card rounded-[24px] bg-white shadow-card">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center p-8">
            <div>
              <p className="eyebrow text-ink-muted">Need Help?</p>
              <h2 className="mt-3 text-4xl font-semibold text-ink leading-tight">
                We’re here to support your shopping
              </h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 items-stretch">
              {options.map((item) => (
                <a
                  key={item.label}
                  href={item.action}
                  className="glass-card flex h-full flex-col items-start justify-between gap-2 rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <item.icon size={20} />
                  </div>

                  <div>
                    <p className="text-base font-semibold text-ink">{item.label}</p>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportSection;

