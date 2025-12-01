
function NewsLetterSection() {
  return (
    <section className="py-20">
    <div className="container-custom">
      <div className="glass-card flex flex-col items-center gap-6 rounded-[2.5rem] bg-ink px-8 py-12 text-center text-white">
        <p className="eyebrow text-white/70">Experience the Difference</p>
        <h2 className="text-4xl font-semibold text-white">
          Curated Style, Exceptional Quality
        </h2>
        <p className="max-w-2xl text-white/70">
          Discover a world where every piece tells a story. From exclusive
          designs to timeless staples, we craft products with care and
          passion for your unique style.
        </p>
        <div className="mt-6">
          <a
            href="/category"
            className="btn btn-primary bg-white text-ink px-8 py-3 rounded-full font-medium hover:bg-gray-100"
          >
            Explore Collection
          </a>
        </div>
      </div>
    </div>
  </section>
  );
}

export default NewsLetterSection;
