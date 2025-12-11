import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Shield, KeyRound, Lock, ArrowRight } from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get("email") || "";

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Step 1: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password/check-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailQuery, otp: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      setStep(2);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailQuery, otp: otp.trim(), newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed");

      navigate("/login");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-surface py-16">
      <div className="container-custom flex justify-center">
        <div className="glass-card w-full max-w-md rounded-[2rem] p-10">
          <div className="text-center">
            <p className="eyebrow">Reset password</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">
              {step === 1 ? "Enter OTP code" : "Set new password"}
            </h2>
            <p className="mt-2 text-ink-muted">
              {step === 1
                ? `We sent an OTP to ${emailQuery}`
                : "Enter a strong password to secure your account."}
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-brand-800">
              {message}
            </div>
          )}

          {/* STEP 1 — OTP FORM */}
          {step === 1 && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-muted">
                  OTP Code
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <Shield className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="text"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    className="w-full rounded-full border border-surface-muted bg-white pl-12 pr-4 py-3 tracking-[0.3em] font-semibold text-center"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? "opacity-60" : ""}`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* STEP 2 — NEW PASSWORD FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-muted">
                  New Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <Lock className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-full border border-surface-muted bg-white pl-12 pr-4 py-3"
                    placeholder="Choose a new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? "opacity-60" : ""}`}
              >
                {loading ? "Updating..." : "Reset Password"}
                {!loading && <KeyRound className="h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-sm uppercase tracking-[0.3em] text-ink-muted hover:text-ink"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
