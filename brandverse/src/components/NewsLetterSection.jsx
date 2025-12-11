
function NewsLetterSection() {
  return (
    <section className="py-20">
    <div className="container-custom">
      <div className="glass-card flex flex-col items-center gap-6 rounded-[2.5rem] bg-gradient-to-r from-brand-500 via-brand-400 to-accent px-8 py-12 text-center text-white border border-white/10 shadow-card">
        <p className="eyebrow text-white/80">Join the club</p>
        <h2 className="text-4xl font-semibold text-white">
          Get exclusive drops & member-only deals
        </h2>
        <p className="max-w-2xl text-white/80">
          Sign up to unlock early access, flash sales, and tailored recommendations across every category.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-white/30 bg-white/15 px-5 py-3 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <a
            href="/register"
            className="btn btn-primary bg-white text-brand-600 px-6 py-3 rounded-full font-semibold hover:bg-accent-soft"
          >
            Sign Up Now
          </a>
        </div>
      </div>
    </div>
  </section>
  );
}

export default NewsLetterSection;
