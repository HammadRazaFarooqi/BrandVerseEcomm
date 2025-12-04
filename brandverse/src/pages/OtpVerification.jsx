// pages/OtpVerification.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OtpVerification() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [verifyLoader, setVerifyLoader] = useState(false);
    const [resendLoader, setResendLoader] = useState(false);

    const handleVerify = async () => {
        if (!otp) {
            setMessage("Please enter the OTP");
            return;
        }
        setVerifyLoader(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "OTP verification failed");

            setMessage(""); // clear previous messages
            toast.success("OTP verified! Registration complete.");
            navigate("/login");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setVerifyLoader(false);
        }
    };

    const handleResend = async () => {
        setResendLoader(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Resend failed");

            setMessage("OTP resent successfully. Check your email.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setResendLoader(false);
        }
    };

    return (
        <section className="bg-surface py-16 min-h-screen flex justify-center items-center">
            <div className="glass-card w-full max-w-xl space-y-8 rounded-[2rem] p-10">
                <div className="text-center">
                    <p className="eyebrow">Affi Mall</p>
                    <h2 className="mt-3 text-3xl font-semibold text-ink">OTP Verification</h2>
                    <p className="mt-2 text-ink-muted">We sent an OTP to your email: <strong>{email}</strong></p>
                </div>

                {message && (
                    <p className="rounded-full bg-red-50 py-3 text-center text-sm text-red-600">{message}</p>
                )}

                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full rounded-full border border-surface-muted px-5 py-3 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:black"
                    />

                    <button
                        onClick={handleVerify}
                        disabled={verifyLoader}
                        className="btn btn-primary w-full"
                    >
                        {verifyLoader ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={resendLoader}
                        className="btn btn-secondary w-full"
                    >
                        {resendLoader ? "Resending..." : "Resend OTP"}
                    </button>

                </div>

                <p className="text-center text-sm text-ink-muted">
                    Didn't receive the OTP? Check your spam folder or click resend.
                </p>
            </div>
        </section>
    );
}

export default OtpVerification;
