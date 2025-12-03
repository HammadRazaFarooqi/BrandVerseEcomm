import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      navigate(`/verify-reset?email=${email}`);
    } else {
      setMessage(data.message);
    }
  
    setLoading(false);
  };
  

  return (
    <section className="bg-surface py-16">
      <div className="container-custom flex justify-center">
        <div className="glass-card w-full max-w-md rounded-[2rem] p-10">
          <div className="text-center">
            <p className="eyebrow">Reset access</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">
              Forgot your password?
            </h2>
            <p className="mt-2 text-ink-muted">
              We&apos;ll send a secure reset otp to your inbox.
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl bg-accent/20 px-4 py-3 text-sm text-ink">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-muted"
              >
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Mail className="h-5 w-5 text-ink-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-surface-muted bg-white pl-12 pr-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full ${
                loading ? "opacity-60" : ""
              }`}
            >
              {loading ? "Sending Email..." : "Send Email"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm uppercase tracking-[0.3em] text-ink-muted hover:text-ink">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
