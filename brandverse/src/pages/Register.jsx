import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setLoader(false);
      return;
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("OTP sent to your email!");
      setLoader(false);

      // Redirect to OTP page with email as state
      navigate("/otp", { state: { email: formData.email } });
    } catch (error) {
      setMessage(error.message);
      setLoader(false);
    }
  };

  return (
    <section className="bg-surface py-16">
      <div className="container-custom flex justify-center">
        <div className="glass-card w-full max-w-xl space-y-8 rounded-[2rem] p-10">
          <div className="text-center">
            <p className="eyebrow">Join the house</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Create an account</h2>
            <p className="mt-2 text-ink-muted">Unlock private previews and appointment-only events.</p>
          </div>

          {message && (
            <p className="rounded-full bg-red-50 py-3 text-center text-sm text-red-600">{message}</p>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-ink-muted">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-ink-muted">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-muted">Email address</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-ink-muted">Password</label>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-muted">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              {loader ? "Sending OTP..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-ink-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-ink font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;
