import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    const BACKEND_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        setLoader(false);
        const errorData = await response.json();
        // Backend se agar 'error' field aa raha hai to woh use karein
        setMessage(`Login failed: ${errorData.error || errorData.message || response.statusText}`);
        toast.error(`Login failed: ${errorData.error || response.statusText}`);
      } else {
        const data = await response.json();

        localStorage.setItem("isLogin", JSON.stringify(data));
        window.dispatchEvent(new Event("userDataUpdated"));

        toast.success("Login successful!");

        // Set loader to false immediately after storing data/dispatching event
        setLoader(false);

        // 3. Handle Navigation (Delayed for user experience only, state is already updated)
        setTimeout(() => {
          localStorage.removeItem("redirectAfterLogin"); // Clear after use

          const defaultPage = data.user.role === "user" ? "/" : "/admin";
          const redirectUrl =
            localStorage.getItem("redirectAfterLogin") || defaultPage;

          navigate(redirectUrl);
        }, 100); // Wait for toast to appear briefly before redirect
      }
    } catch (error) {
      setLoader(false);
      setMessage(`Login failed: ${error.message}`);
      toast.error(`Login failed: ${error.message}`);
    }
  };

  return (
    <section className="bg-surface py-16">
      <div className="container-custom flex justify-center">
        <div className="glass-card w-full max-w-md space-y-8 rounded-[2rem] p-10">
          <div className="text-center">
            <p className="eyebrow">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">
              Sign in to continue
            </h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink-muted"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  id="remember-me"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="accent-ink"
                />
                Remember me
              </label>
              <Link
                to="/forget-password"
                className="text-sm text-ink-muted hover:text-ink"
              >
                Forgot password
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loader}>
              {loader ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-ink font-semibold">
                Sign up
              </Link>
            </p>
            {message && (
              <p className="text-center text-sm text-red-500">{message}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;