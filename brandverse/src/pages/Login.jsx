import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_API_URL;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    const newErrors = {};
    if (!formData.email.includes("@") || !formData.email.includes(".com"))
      newErrors.email = "Enter a valid email";
    if (!formData.password)
      newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoader(false);
      return;
    }

    setErrors({}); // Clear previous validation errors

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returned invalid credentials
        setErrors({ apiError: data.error || "Invalid credentials" });
        toast.error(data.error || "Invalid credentials");
      } else {
        localStorage.setItem("isLogin", JSON.stringify(data));
        navigate(data.user.role === "user" ? "/" : "/admin");
      }
    } catch (err) {
      setErrors({ apiError: err.message });
      toast.error(err.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <section className="bg-surface py-16">
      <div className="container-custom flex justify-center">
        <div className="glass-card w-full max-w-md space-y-8 rounded-[2rem] p-10">
          <div className="text-center">
            <p className="eyebrow">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Sign in to continue</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              {errors.apiError && (
                <p className="text-red-500 text-center text-sm mb-2">{errors.apiError}</p>
              )}
              <label className="block text-sm font-medium text-ink-muted">Email address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-muted">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <Link to="/forget-password" className="text-sm text-ink-muted hover:text-ink" > Forgot password </Link>

            <button type="submit" className="btn btn-primary w-full" disabled={loader}>
              {loader ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-ink-muted">
              Don't have an account? <Link to="/register" className="text-ink font-semibold">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
