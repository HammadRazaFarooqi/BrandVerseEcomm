import React, { useState } from "react";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "affimall50@gmail.com";
const SUPPORT_HOURS = import.meta.env.VITE_SUPPORT_HOURS || "Mon–Fri, 9:00 — 18:00 (PKT)";
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export default function CustomerSupport() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [errors, setErrors] = useState({});


    const [result, setResult] = useState("");
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setResult("Sending...");

        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            newErrors.name = "Only letters and spaces allowed";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || !formData.email.includes(".com")) {
            newErrors.email = "Invalid email (must include @ and .com)";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setResult("");
            return;
        }

        setErrors({}); // clear previous errors

        // Prepare data to send
        const formDataToSend = new FormData();
        formDataToSend.append("access_key", WEB3FORMS_KEY);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("subject", formData.subject || "Support Request");
        formDataToSend.append("message", formData.message);
        formDataToSend.append("redirect", "");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.success) {
                setResult("Form Submitted Successfully");
                setFormData({ name: "", email: "", subject: "", message: "" });
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
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                            required
                                        />
                                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="mb-2 text-sm text-white/80">Your email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                            required
                                        />
                                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    <span className="mb-2 text-sm text-white/80">Subject</span>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="What is this about?"
                                        className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                        required
                                    />
                                    {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
                                </label>

                                <label className="flex flex-col">
                                    <span className="mb-2 text-sm text-white/80">Message</span>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Describe your issue or question..."
                                        className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-black placeholder-white/50 focus:outline-none"
                                        required
                                    />
                                    {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
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
