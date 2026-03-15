'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import { useAuth } from '@/context/AuthContext';

/**
 * UserRegisterPage - Phone OTP registration only
 * After verification → redirects to /onboarding for role, interests, location, email etc.
 */
export default function UserRegisterPage() {
    const router = useRouter();
    const { user, loading: authLoading, signInWithPhone } = useAuth();

    // Shared state
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Phone OTP state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            router.push('/onboarding');
        }
    }, [user, authLoading, router]);

    // ── Phone OTP Handlers ─────────────────────────────────────────

    const handleSendOtp = async () => {
        const phone = phoneNumber.trim();
        if (!phone || phone.length < 10) {
            setOtpError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setOtpError(null);
        setOtpLoading(true);
        try {
            const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await signInWithPhone(formatted);
            if (result.error) {
                setOtpError(result.error);
            } else {
                setOtpSent(true);
            }
        } catch {
            setOtpError('Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpCode.length < 4) {
            setOtpError('Please enter the OTP code.');
            return;
        }
        setOtpError(null);
        setOtpLoading(true);
        try {
            const phone = phoneNumber.trim();
            const formatted = phone.startsWith('+') ? phone : `+91${phone}`;

            // Call verify-otp API to get session + onboarding status
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formatted, otp: otpCode }),
            });
            const data = await response.json();

            if (!response.ok || data.error) {
                setOtpError(data.error || 'Failed to verify OTP');
                setOtpCode('');
            } else {
                // Set Supabase session
                if (data.session) {
                    const { default: supabase } = await import('@/lib/supabase');
                    await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });

                    // Save name to profile if provided
                    if (fullName.trim()) {
                        await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', data.user_id);
                    }
                }

                setPhoneVerified(true);
                setSuccessMessage('✅ Phone verified! Setting up your profile...');
                setTimeout(() => router.push('/onboarding'), 1500);
            }
        } catch {
            setOtpError('Failed to verify OTP. Please try again.');
            setOtpCode('');
        } finally {
            setOtpLoading(false);
        }
    };

    // ── Phone Registration Handler ─────────────────────────────────

    const handlePhoneRegister = async () => {
        setError(null);
        if (!fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }
        if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        // If phone not verified yet, send OTP
        if (!otpSent) {
            handleSendOtp();
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
                <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--miraitu-background-light)] dark:bg-background-dark font-display text-[#0f1a11] flex flex-col" data-no-auth>
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--miraitu-primary-green)]/10 bg-white/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                    <div className="w-10 h-10">
                        <MiraituLogo className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-[#0f1a11] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center py-12 px-4">
                {/* Heading */}
                <div className="max-w-[600px] w-full text-center mb-10 animate-fade-in">
                    <h1 className="text-[#0f1a11] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-3">
                        Create Your <span className="text-[var(--miraitu-primary-green)]">Account</span>
                    </h1>
                    <p className="text-[#53935d] dark:text-gray-400 text-lg font-medium">
                        Join the digital ecosystem designed for modern farmers.
                    </p>
                </div>

                {/* Card */}
                <div className="max-w-[520px] w-full skeuo-card rounded-2xl overflow-hidden p-6 md:p-10 relative animate-panel-entrance">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--miraitu-lush-leaf)]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--miraitu-harvest-gold)]/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-bold flex items-center gap-2 relative z-10 animate-fade-in">
                            {successMessage}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2 relative z-10 animate-fade-in">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {!successMessage && (
                        <div className="flex flex-col gap-6 animate-fade-in relative z-10">
                            {/* Full Name */}
                            <label className="flex flex-col gap-2">
                                <span className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">Full Name</span>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none"
                                        placeholder="Enter your full name"
                                        type="text"
                                        required
                                    />
                                </div>
                            </label>

                            {/* ── Phone Registration ─────────────────── */}
                            <div className="space-y-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">
                                        Mobile Number
                                            {phoneVerified && (
                                                <span className="ml-2 text-[var(--miraitu-primary-green)] text-xs normal-case font-bold inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    Verified
                                                </span>
                                            )}
                                        </span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">call</span>
                                            <input
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                                                    if (phoneVerified) {
                                                        setPhoneVerified(false);
                                                        setOtpSent(false);
                                                        setOtpCode('');
                                                    }
                                                }}
                                                disabled={phoneVerified}
                                                className={`skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border bg-[#fcfdfc] outline-none ${
                                                    phoneVerified
                                                        ? 'border-[var(--miraitu-primary-green)] bg-green-50/50 text-gray-600'
                                                        : 'border-gray-200 focus:border-[var(--miraitu-primary-green)]'
                                                }`}
                                                placeholder="+91 XXXXX XXXXX"
                                                type="tel"
                                                required
                                            />
                                        </div>
                                    </label>

                                    {/* OTP Error */}
                                    {otpError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            {otpError}
                                        </div>
                                    )}

                                    {!phoneVerified && !otpSent && (
                                        <button
                                            type="button"
                                            onClick={handlePhoneRegister}
                                            disabled={otpLoading || !phoneNumber || phoneNumber.length < 10 || !fullName.trim()}
                                            className="w-full py-3.5 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--miraitu-primary-green)]/20"
                                        >
                                            {otpLoading ? (
                                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">sms</span>
                                                    Send OTP & Register
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* OTP Input */}
                                    {otpSent && !phoneVerified && (
                                        <div className="space-y-3">
                                            <p className="text-xs text-gray-500 font-medium">
                                                OTP sent to <span className="font-bold text-[var(--miraitu-primary-green)]">+91{phoneNumber}</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                                                    <input
                                                        value={otpCode}
                                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className="skeuo-input w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none text-center tracking-[0.3em] font-bold text-lg"
                                                        placeholder="• • • • • •"
                                                        type="text"
                                                        maxLength={6}
                                                        autoFocus
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={otpLoading || otpCode.length < 4}
                                                    className="px-5 py-3 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-bold text-sm flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                                >
                                                    {otpLoading ? (
                                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-lg">check</span>
                                                            Verify
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={otpLoading}
                                                className="text-xs font-bold text-[var(--miraitu-primary-green)] hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                    )}
                                </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-2">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">Already have an account?</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Login Link */}
                            <Link
                                href="/user-login"
                                className="w-full py-3 rounded-xl border-2 border-[var(--miraitu-primary-green)]/20 font-bold text-sm text-[var(--miraitu-primary-green)] flex items-center justify-center gap-2 hover:bg-[var(--miraitu-primary-green)]/5 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">login</span>
                                Login Instead
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Elements */}
                <div className="mt-16 flex flex-wrap justify-center gap-12 grayscale opacity-40 animate-footer-entrance">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">shield</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">Privacy Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">Smart Matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">50k+ Members</span>
                    </div>
                </div>
            </main>

            <footer className="py-10 border-t border-[var(--miraitu-primary-green)]/10 bg-white/50 text-center">
                <p className="text-sm text-[#53935d]">© 2026 Miraitu Agriculture Tech. Empowering farmers globally.</p>
            </footer>
        </div>
    );
}
