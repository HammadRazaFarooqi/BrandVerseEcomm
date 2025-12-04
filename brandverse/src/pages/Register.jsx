import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error while typing
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!/^[A-Za-z\s]+$/.test(formData.firstName))
      newErrors.firstName = "Only letters allowed in First Name";

    if (!/^[A-Za-z\s]+$/.test(formData.lastName))
      newErrors.lastName = "Only letters allowed in Last Name";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || !formData.email.includes(".com"))
      newErrors.email = "Email must contain @ and .com";

    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoader(true);
    setErrors({});

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

      if (!response.ok) {
        // Show "Email already exists" inline
        if (data.error && data.error.toLowerCase().includes("email already exists")) {
          setErrors({ email: data.error });
        } else {
          toast.error(data.error || "Failed to send OTP");
        }
        return;
      }

      toast.success("OTP sent to your email!");
      navigate("/otp", { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.message);
    } finally {
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-muted">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-muted">Email</label>
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

            <div>
              <label className="block text-sm font-medium text-ink-muted">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-surface-muted px-5 py-3"
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loader}>
              {loader ? "Sending OTP..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-ink-muted">
              Already have an account? <Link to="/login" className="text-ink font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;
