import React, { useState } from "react";
import { FiMail, FiPhone, FiChevronRight } from "react-icons/fi";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@brandverse.com";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "923001234567"; // no plus, country+number (e.g. 92300...)
const SUPPORT_HOURS = import.meta.env.VITE_SUPPORT_HOURS || "Mon–Fri, 9:00 — 18:00 (PKT)";

export default function CustomerSupport() {
    const [name, setName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleMailSubmit = (e) => {
        e.preventDefault();
        // Build mailto URL so it opens user's default mail client with prefilled fields
        const mailto = `mailto:${encodeURIComponent(SUPPORT_EMAIL)}?subject=${encodeURIComponent(
            subject || "Support Request"
        )}&body=${encodeURIComponent(`Name: ${name || "-"}\nEmail: ${customerEmail || "-"}\n\n${message || "-"}`)}`;
        window.location.href = mailto;
    };

    const handleWhatsApp = () => {
        // Prefill a message; WhatsApp expects URL encoded text
        const text = `Support request from website:\nName: ${name || "-"}\nEmail: ${customerEmail || "-"}\nSubject: ${subject || "-"}\nMessage: ${message || "-"}`;
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(waLink, "_blank");
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
                                    <li>
                                        Provide your <strong>order ID</strong> (if applicable) and a short description of the issue.
                                    </li>
                                    <li>
                                        Attach screenshots or order confirmation emails when possible — they speed up resolution.
                                    </li>
                                    <li>
                                        For account/security issues, never share your password. We may ask for email verification.
                                    </li>
                                    <li>
                                        Typical response time: <strong>{SUPPORT_HOURS}</strong>. Priority issues are handled faster.
                                    </li>
                                    <li>
                                        If the issue is urgent (payment or delivery), click the WhatsApp button for live chat.
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Right: Contact form */}
                        <div>
                            <h3 className="mb-4 text-white text-lg font-medium">Send us a message</h3>
                            <form onSubmit={handleMailSubmit} className="space-y-4">
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

                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 font-medium hover:text-white"
                                    >
                                        Send Email
                                    </button>
                                </div>
                                <div className="text-sm text-white/70">
                                    <p>
                                        For business inquiries, partnerships, or press, email us at{" "}
                                        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                                            {SUPPORT_EMAIL}
                                        </a>
                                        .
                                    </p>
                                </div>
                                <p className="text-xs text-white/60">By sending a message you consent to our support team contacting you to resolve your issue.</p>
                            </form>
                        </div>
                    </div>

                                {/* FULL WIDTH CONTACT TILES */}
                                <div className="mt-8 space-y-4">
                                    <button
                                        onClick={handleMailSubmit}
                                        className="w-full flex items-center justify-between rounded-2xl bg-white/8 p-5 border border-white/10 hover:bg-white/12 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl bg-white/15 p-3">
                                                <FiMail size={20} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-white/70 uppercase tracking-wide">
                                                    Email Support
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    {SUPPORT_EMAIL}
                                                </p>
                                                <p className="text-xs text-white/60 mt-1">
                                                    Typically replies in {SUPPORT_HOURS}
                                                </p>
                                            </div>
                                        </div>
                                        <FiChevronRight size={18} className="text-white/70" />
                                    </button>

                                    <button
                                        onClick={handleWhatsApp}
                                        className="w-full flex items-center justify-between rounded-2xl bg-[#25D366]/10 p-5 border border-white/10 hover:bg-[#25D366]/20 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl bg-[#25D366]/25 p-3">
                                                <FiPhone size={20} className="text-[#25D366]" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-white/70 uppercase tracking-wide">
                                                    WhatsApp Chat
                                                </p>
                                                <p className="text-sm font-medium text-[#25D366]">
                                                    +{WHATSAPP_NUMBER}
                                                </p>
                                                <p className="text-xs text-white/60 mt-1">
                                                    Usually available {SUPPORT_HOURS}
                                                </p>
                                            </div>
                                        </div>
                                        <FiChevronRight size={18} className="text-white/70" />
                                    </button>
                                </div>


                    {/* Footer small note */}
                    <div className="mt-6 text-center text-xs text-white/60">
                        <p>Response time may vary depending on volume — urgent issues via WhatsApp recommended.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
