'use client';

import { useState } from 'react';
import { CONTACT_TOPICS, CONTACT_LIMITS } from '@/lib/contact-options';

// Contact Us — linked from the desktop header and footer only. The mobile
// apps do not carry it; the page itself still renders responsively in case
// someone opens the URL on a phone browser.

const SUPPORT_EMAIL = 'miraitutechnologies@gmail.com';
const HELPLINE = '+91 93803 06475';
const HELPLINE_TEL = '+919380306475';

const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    company: '',
    topic: 'partnership',
    subject: '',
    message: '',
    website: '', // honeypot
};

const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400';
const labelClass = 'block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5';

export default function ContactPage() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const set = (k: keyof typeof initialForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.error || 'We could not send your message. Please try again.');
                return;
            }
            setSent(true);
            setForm(initialForm);
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="text-[#121811] dark:text-[#f9fbf9]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#1a3a14] via-[#22491b] to-[#2c5926]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 15% 85%, #B0EA3C 0%, transparent 45%), radial-gradient(circle at 85% 15%, #DAA520 0%, transparent 40%)' }}></div>
                <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 lg:py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white/90 mb-6 border border-white/20 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#B0EA3C] text-base">mail</span>
                        Contact Us
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                        Let&apos;s grow <span className="text-[#B0EA3C]">together</span>
                    </h1>
                    <p className="mt-5 text-base md:text-lg text-white/75 max-w-2xl mx-auto">
                        Companies, partners, advertisers, media and investors — tell us what you have in mind and our team will get back to you.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-10">
                    {/* Contact details */}
                    <aside className="space-y-4">
                        <h2 className="text-2xl font-black">Reach the team</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            For partnerships, bulk orders, advertising or press, the form is the fastest way to reach the right person. Farmers needing help can call the helpline.
                        </p>

                        <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-start gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:border-primary/30 transition-colors">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">alternate_email</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                                <p className="text-sm font-semibold mt-0.5">{SUPPORT_EMAIL}</p>
                            </div>
                        </a>

                        <a href={`tel:${HELPLINE_TEL}`} className="flex items-start gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:border-primary/30 transition-colors">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">call</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</p>
                                <p className="text-sm font-semibold mt-0.5">{HELPLINE}</p>
                            </div>
                        </a>

                        <div className="flex items-start gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Head Office</p>
                                <p className="text-sm mt-0.5 leading-relaxed">
                                    No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka 560100
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Form. data-no-auth keeps GlobalLoginInterceptor from asking
                        a company with no account to sign in before sending. */}
                    <div data-no-auth className="rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1e2a1c] shadow-sm p-6 md:p-8">
                        {sent ? (
                            <div className="text-center py-12">
                                <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                                </div>
                                <h2 className="text-2xl font-black">Message sent</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                                    Thank you for reaching out. Our team will reply to the email you provided.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-black">Send us a message</h2>
                                    <p className="text-sm text-gray-500 mt-1">Fields marked * are required.</p>
                                </div>

                                {error && (
                                    <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl text-sm text-red-700 dark:text-red-300">
                                        <span className="material-symbols-outlined text-lg">error</span>
                                        {error}
                                    </div>
                                )}

                                {/* Honeypot — hidden from people, filled by bots */}
                                <div className="hidden" aria-hidden="true">
                                    <label>
                                        Website
                                        <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="c-name" className={labelClass}>Full name *</label>
                                        <input id="c-name" required maxLength={CONTACT_LIMITS.name} value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder="Your name" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-company" className={labelClass}>Company / Organisation</label>
                                        <input id="c-company" maxLength={CONTACT_LIMITS.company} value={form.company} onChange={set('company')} autoComplete="organization" placeholder="Company name" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-email" className={labelClass}>Work email *</label>
                                        <input id="c-email" type="email" required maxLength={CONTACT_LIMITS.email} value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@company.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-phone" className={labelClass}>Phone</label>
                                        <input id="c-phone" type="tel" maxLength={20} value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+91 98765 43210" className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="c-topic" className={labelClass}>What is this about? *</label>
                                    <select id="c-topic" value={form.topic} onChange={set('topic')} className={inputClass}>
                                        {CONTACT_TOPICS.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="c-subject" className={labelClass}>Subject</label>
                                    <input id="c-subject" maxLength={CONTACT_LIMITS.subject} value={form.subject} onChange={set('subject')} placeholder="A short summary" className={inputClass} />
                                </div>

                                <div>
                                    <label htmlFor="c-message" className={labelClass}>Message *</label>
                                    <textarea
                                        id="c-message"
                                        required
                                        rows={6}
                                        minLength={CONTACT_LIMITS.minMessage}
                                        maxLength={CONTACT_LIMITS.message}
                                        value={form.message}
                                        onChange={set('message')}
                                        placeholder="Tell us a little about your company and what you'd like to discuss…"
                                        className={`${inputClass} resize-y`}
                                    />
                                    <p className="text-[11px] text-gray-400 text-right mt-1">{form.message.length}/{CONTACT_LIMITS.message}</p>
                                </div>

                                <p className="text-xs text-gray-500">
                                    By sending this message you agree to our{' '}
                                    <a href="/home/privacy-policy" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
                                </p>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">send</span>
                                            Send message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
