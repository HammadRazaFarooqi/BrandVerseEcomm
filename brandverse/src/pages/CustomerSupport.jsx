import React, { useState } from "react";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "affimall50@gmail.com";
const SUPPORT_HOURS = import.meta.env.VITE_SUPPORT_HOURS || "Mon–Fri, 9:00 — 18:00 (PKT)";
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export default function CustomerSupport() {
    const [name, setName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [result, setResult] = useState("");

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setResult("Sending...");

        const formData = new FormData();
        formData.append("access_key", WEB3FORMS_KEY);
        formData.append("name", name);
        formData.append("email", customerEmail);
        formData.append("subject", subject || "Support Request");
        formData.append("message", message);
        formData.append("redirect", ""); // Optional: redirect after submit

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setResult("Form Submitted Successfully");
                setName("");
                setCustomerEmail("");
                setSubject("");
                setMessage("");
            } else {
                setResult("Something went wrong. Please try again.");
            }
        } catch (err) {
            setResult("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient py-16 text-white">
            <div className="container-custom mx-auto px-4">
                <div className="max-w-5xl mx-auto rounded-3xl bg-white/6 border border-white/10 p-8 backdrop-blur">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                        {/* Left: Guidelines + contact options */}
                        <div className="space-y-6">
                            <h2 className="text-3xl text-white font-semibold">Customer Support</h2>
                            <p className="text-sm text-white/80">
                                We're here to help. Follow the guidelines below to get the fastest resolution.
                            </p>

                            <div className="rounded-2xl bg-white/5 p-6">
                                <h3 className="mb-4 text-lg text-white font-medium">Support Guidelines</h3>
                                <ol className="list-decimal ml-5 space-y-3 text-white/85">
                                    <li>Include your <strong>full name and a valid email</strong> so we can contact you efficiently.</li>
                                    <li>Provide your <strong>order ID</strong> if applicable to help us locate your records quickly.</li>
                                    <li>Clearly describe your issue in the message field, including steps to reproduce it if relevant.</li>
                                    <li>Never share sensitive information such as passwords or full payment details.</li>
                                    <li>Indicate urgency if the issue affects transactions or delivery times, but remain concise and polite.</li>
                                    <li>Typical response time: <strong>{SUPPORT_HOURS}</strong>.</li>

                                </ol>
                            </div>
                        </div>

                        {/* Right: Web3Forms contact form */}
                        <div>
                            <h3 className="mb-4 text-white text-lg font-medium">Send us a message</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="flex flex-col">
                                        <span className="mb-2 text-sm text-white/80">Name</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                            required
                                        />
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="mb-2 text-sm text-white/80">Your email</span>
                                        <input
                                            type="email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                            required
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    <span className="mb-2 text-sm text-white/80">Subject</span>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="What is this about?"
                                        className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col">
                                    <span className="mb-2 text-sm text-white/80">Message</span>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        placeholder="Describe your issue or question..."
                                        className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                        required
                                    />
                                </label>

                                <button
                                    type="submit"
                                    className="btn btn-primary inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 font-medium hover:text-white"
                                >
                                    Send Message
                                </button>

                                <span className="text-sm text-white/70">{result}</span>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
