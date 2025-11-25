
function NewsLetterSection() {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="glass-card flex flex-col items-center gap-6 rounded-[2.5rem] bg-ink px-8 py-12 text-center text-white">
          <p className="eyebrow text-white/70">Private client access</p>
          <h2 className="text-4xl font-semibold">
            Join the inner circle for atelier stories, early drops, and
            invitations to private sales.
          </h2>
          <p className="max-w-2xl text-white/70">
            We only send thoughtful updates—no noise, just refined inspiration
            straight from our stylists.
          </p>
          <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-full border border-white/30 bg-white/10 px-6 py-3 placeholder:text-white/60 focus:outline-none"
            />
            <button className="btn btn-primary bg-white text-ink">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsLetterSection;
