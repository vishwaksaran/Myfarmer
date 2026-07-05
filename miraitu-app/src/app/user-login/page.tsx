'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { useLanguage } from '@/i18n/LanguageContext';
import { LangCode } from '@/i18n/translations';
import { normalizeIndianPhone } from '@/lib/phone';

/**
 * UserLoginPage - Login page with Phone OTP and Email Auth
 */
export default function UserLoginPage() {
    const { user, loading, signInWithPhone, fetchProfile } = useAuth();
    const { lang, setLang, t } = useLanguage();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Auth Method State
    const [authMethod, setAuthMethod] = useState<'default' | 'phone' | 'email'>('default');
    const [phoneState, setPhoneState] = useState<'input' | 'otp'>('input');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');

    // Email login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const raw = new URLSearchParams(window.location.search).get('redirect');
        if (!raw) {
            setRedirectPath(null);
            return;
        }

        if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://') || raw.startsWith('/user-login')) {
            setRedirectPath(null);
            return;
        }

        setRedirectPath(raw);
    }, []);

    const navigateAfterLogin = useCallback((destination: string) => {
        // Full navigation avoids cookie race for proxy-protected routes immediately after auth.
        if (destination.startsWith('/home/shop') || destination.startsWith('/admin')) {
            window.location.assign(destination);
            return;
        }
        router.replace(destination);
    }, [router]);

    // Decide where to land after login based on role + onboarding status.
    const resolveDestination = useCallback((role: string | null | undefined, onboarded: boolean): string => {
        if (!onboarded) return '/onboarding';
        if (redirectPath) return redirectPath;
        if (role === 'service_provider' || role === 'dealer') {
            try {
                localStorage.setItem('miraitu_view_mode', 'provider');
                localStorage.setItem('miraitu_provider_tab', 'home'); // always land on Home
            } catch { /* ignore */ }
            return '/home/provider-dashboard';
        }
        return '/';
    }, [redirectPath]);

    const normalizeEmail = (value: string) => value.trim().toLowerCase();

    const getEmailSuggestion = (email: string): string | null => {
        const typoFixes: Record<string, string> = {
            '@gmai.com': '@gmail.com',
            '@gmial.com': '@gmail.com',
            '@gmail.co': '@gmail.com',
            '@yaho.com': '@yahoo.com',
            '@outlok.com': '@outlook.com',
            '@hotnail.com': '@hotmail.com',
        };

        const typoSuffix = Object.keys(typoFixes).find(suffix => email.endsWith(suffix));
        if (!typoSuffix) return null;
        return email.replace(typoSuffix, typoFixes[typoSuffix]);
    };

    const allLanguages: { name: string; sub: string; code: LangCode }[] = [
        { name: 'English', sub: 'EN', code: 'en' },
        { name: 'हिंदी', sub: 'HI', code: 'hi' },
        { name: 'मराठी', sub: 'MR', code: 'mr' },
        { name: 'ગુજરાતી', sub: 'GU', code: 'gu' },
        { name: 'తెలుగు', sub: 'TE', code: 'te' },
        { name: 'தமிழ்', sub: 'TA', code: 'ta' },
        { name: 'ಕನ್ನಡ', sub: 'KN', code: 'kn' },
        { name: 'ਪੰਜਾਬੀ', sub: 'PA', code: 'pa' },
        { name: 'বাংলা', sub: 'BN', code: 'bn' },
        { name: 'മലയാളം', sub: 'ML', code: 'ml' },
    ];

    // Redirect if already logged in (role-aware: providers/dealers → dashboard)
    useEffect(() => {
        if (user && !loading && !isSigningIn && !successMessage) {
            if (redirectPath) { navigateAfterLogin(redirectPath); return; }
            fetchProfile().then(p => navigateAfterLogin(resolveDestination(p?.role, true)));
        }
    }, [user, loading, isSigningIn, successMessage, redirectPath, navigateAfterLogin, resolveDestination, fetchProfile]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length !== 10 || !/^[6-9]/.test(phoneNumber)) {
            setError(t('login.errorInvalidPhone'));
            return;
        }
        setError(null);
        setIsSigningIn(true);
        try {
            const formattedPhone = `+91${phoneNumber}`;
            const result = await signInWithPhone(formattedPhone);
            if (result.error) {
                setError(result.error);
            } else {
                setPhoneState('otp');
            }
        } catch {
            setError(t('login.errorSendOtp'));
        } finally {
            setIsSigningIn(false);
        }
    };

    // directOtp is passed when auto-submitting from onChange (avoids stale state)
    const handleVerifyOtp = async (e?: React.FormEvent, directOtp?: string) => {
        e?.preventDefault();
        // Prevent duplicate calls while already verifying
        if (isSigningIn) return;
        const otpToVerify = directOtp ?? otp;
        if (otpToVerify.length !== 6) {
            setError(t('login.errorOtpRequired'));
            return;
        }
        setError(null);
        setIsSigningIn(true);
        try {
            const formattedPhone = `+91${phoneNumber}`;

            // Call verify-otp API directly to get onboarding status from server
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone, otp: otpToVerify }),
            });
            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || t('login.errorVerifyOtp'));
                setOtp('');
            } else {
                // Set Supabase session
                let role: string | null = null;
                if (data.session) {
                    const { default: supabase } = await import('@/lib/supabase');
                    await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });
                    try {
                        const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user_id).single();
                        role = prof?.role ?? null;
                    } catch { /* ignore */ }
                }

                setSuccessMessage(`✅ ${t('login.successLogin')}`);

                // Use server-side onboarding check (not AuthContext which may have stale user)
                const onboarded = data.onboarding_completed === true;
                const destination = resolveDestination(role, onboarded);
                setTimeout(() => navigateAfterLogin(destination), 1200);
            }
        } catch {
            setError(t('login.errorVerifyOtp'));
            setOtp('');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleBackToSelection = () => {
        setAuthMethod('default');
        setPhoneState('input');
        setError(null);
        setEmailError(null);
        setLoginEmail('');
        setLoginPassword('');
    };

    const handleResendOtp = async () => {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        setError(null);
        setIsSigningIn(true);
        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone }),
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                setError(data.error || t('login.errorSendOtp'));
            }
        } catch {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    };

    // Email + Password Login for existing users
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        setError(null);

        const normalizedEmail = normalizeEmail(loginEmail);
        const suggestedEmail = getEmailSuggestion(normalizedEmail);
        if (suggestedEmail) {
            setLoginEmail(suggestedEmail);
            setEmailError(`Did you mean ${suggestedEmail}? We corrected it, please tap Log In again.`);
            return;
        }

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setEmailError(t('login.errorInvalidEmail'));
            return;
        }
        if (!loginPassword || loginPassword.length < 6) {
            setEmailError(t('login.errorPasswordMin'));
            return;
        }

        setIsSigningIn(true);
        try {
            const { default: supabase } = await import('@/lib/supabase');
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: loginPassword,
            });

            if (signInError) {
                if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
                    setEmailError(t('login.errorInvalidCredentials'));
                } else if (signInError.message?.toLowerCase().includes('email not confirmed')) {
                    setEmailError(t('login.errorEmailNotConfirmed'));
                } else {
                    setEmailError(signInError.message || t('login.errorLoginFailed'));
                }
                return;
            }

            if (data.session) {
                setSuccessMessage(`✅ ${t('login.successLogin')}`);

                // Check onboarding status + role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('onboarding_completed, role')
                    .eq('id', data.user.id)
                    .single();

                const onboarded = profile?.onboarding_completed === true;
                const destination = resolveDestination(profile?.role, onboarded);
                setTimeout(() => navigateAfterLogin(destination), 1200);
            }
        } catch {
            setEmailError(t('login.errorGeneric'));
        } finally {
            setIsSigningIn(false);
        }
    };

    const openResetPasswordConfirm = () => {
        setEmailError(null);
        setError(null);
        setSuccessMessage(null);

        const normalizedEmail = normalizeEmail(loginEmail);
        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setEmailError('Please enter a valid email address to reset password.');
            return;
        }

        setShowResetConfirm(true);
    };

    const handleResetPassword = async () => {
        const normalizedEmail = normalizeEmail(loginEmail);
        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setShowResetConfirm(false);
            setEmailError('Please enter a valid email address to reset password.');
            return;
        }

        setIsSigningIn(true);
        try {
            const { default: supabase } = await import('@/lib/supabase');
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: `${window.location.origin}/user-login`,
            });

            if (resetError) {
                setEmailError(resetError.message || 'Failed to send reset link. Please try again.');
                return;
            }

            setSuccessMessage(`✅ Password reset link sent to ${normalizedEmail}`);
            setShowResetConfirm(false);
        } catch {
            setEmailError('Failed to send reset link. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="relative min-h-screen bg-[var(--miraitu-background-light)] font-display" data-no-auth>
            {showResetConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-black/45 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-100 p-5">
                        <h3 className="text-lg font-black text-[#0f1a11] mb-2">Send Reset Link?</h3>
                        <p className="text-sm text-gray-600 mb-5">
                            We will send a password reset link to <span className="font-bold text-[#0f1a11]">{normalizeEmail(loginEmail)}</span>.
                        </p>
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                disabled={isSigningIn}
                                className="flex-1 py-2.5 rounded-xl bg-[var(--miraitu-primary-green)] text-white text-sm font-bold hover:brightness-110 disabled:opacity-60"
                            >
                                {isSigningIn ? 'Sending...' : 'Send Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scalable CSS Background */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {/* Base Gradient */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #e8f0e5 0%, #d4e5cf 50%, #c5dbbe 100%)'
                    }}
                />

                {/* Bottom Wave Decoration */}
                <svg
                    className="absolute bottom-0 left-0 w-full"
                    style={{ height: '40%', minHeight: '200px' }}
                    viewBox="0 0 1440 400"
                    preserveAspectRatio="none"
                    fill="none"
                >
                    <path
                        d="M0,200 C280,350 400,100 720,200 C1040,300 1160,150 1440,200 L1440,400 L0,400 Z"
                        fill="rgba(83, 147, 93, 0.15)"
                    />
                    <path
                        d="M0,280 C360,380 480,200 720,280 C960,360 1080,220 1440,280 L1440,400 L0,400 Z"
                        fill="rgba(83, 147, 93, 0.2)"
                    />
                    <path
                        d="M0,340 C240,400 480,300 720,340 C960,380 1200,320 1440,360 L1440,400 L0,400 Z"
                        fill="rgba(83, 147, 93, 0.25)"
                    />
                </svg>

                {/* Left Decorative Leaf */}
                <svg
                    className="absolute bottom-0 left-0 h-[50%] md:h-[60%]"
                    style={{ maxHeight: '500px', minHeight: '200px' }}
                    viewBox="0 0 200 400"
                    fill="none"
                >
                    <ellipse cx="30" cy="320" rx="80" ry="160" fill="rgba(83, 147, 93, 0.3)" transform="rotate(-20 30 320)" />
                    <ellipse cx="60" cy="350" rx="60" ry="120" fill="rgba(107, 171, 111, 0.35)" transform="rotate(-15 60 350)" />
                    <ellipse cx="80" cy="380" rx="40" ry="80" fill="rgba(131, 195, 135, 0.4)" transform="rotate(-10 80 380)" />
                </svg>

                {/* Right Wheat/Grass Decoration */}
                <svg
                    className="absolute bottom-0 right-0 h-[60%] md:h-[70%]"
                    style={{ maxHeight: '600px', minHeight: '250px' }}
                    viewBox="0 0 150 500"
                    fill="none"
                >
                    {/* Wheat stalks */}
                    <g opacity="0.6">
                        {/* Stalk 1 */}
                        <path d="M120,500 Q115,400 130,300" stroke="#6bab6f" strokeWidth="3" fill="none" />
                        <ellipse cx="132" cy="290" rx="8" ry="20" fill="#7cb880" transform="rotate(-10 132 290)" />
                        <ellipse cx="128" cy="260" rx="7" ry="18" fill="#7cb880" transform="rotate(-5 128 260)" />
                        <ellipse cx="133" cy="230" rx="6" ry="16" fill="#7cb880" transform="rotate(-12 133 230)" />
                        <ellipse cx="130" cy="205" rx="5" ry="14" fill="#7cb880" transform="rotate(-8 130 205)" />
                        <ellipse cx="132" cy="182" rx="4" ry="12" fill="#7cb880" transform="rotate(-6 132 182)" />

                        {/* Stalk 2 */}
                        <path d="M100,500 Q95,380 105,250" stroke="#5a9f5e" strokeWidth="3" fill="none" />
                        <ellipse cx="107" cy="240" rx="7" ry="18" fill="#6bab6f" transform="rotate(-8 107 240)" />
                        <ellipse cx="104" cy="212" rx="6" ry="16" fill="#6bab6f" transform="rotate(-3 104 212)" />
                        <ellipse cx="108" cy="185" rx="5" ry="14" fill="#6bab6f" transform="rotate(-10 108 185)" />
                        <ellipse cx="106" cy="162" rx="4" ry="12" fill="#6bab6f" transform="rotate(-6 106 162)" />

                        {/* Stalk 3 */}
                        <path d="M80,500 Q78,420 85,320" stroke="#4a8f4e" strokeWidth="2.5" fill="none" />
                        <ellipse cx="87" cy="310" rx="6" ry="16" fill="#5a9f5e" transform="rotate(-5 87 310)" />
                        <ellipse cx="85" cy="285" rx="5" ry="14" fill="#5a9f5e" transform="rotate(-2 85 285)" />
                        <ellipse cx="88" cy="262" rx="4" ry="12" fill="#5a9f5e" transform="rotate(-8 88 262)" />
                    </g>

                    {/* Additional grass blades */}
                    <path d="M60,500 Q55,450 70,380" stroke="rgba(83, 147, 93, 0.4)" strokeWidth="2" fill="none" />
                    <path d="M140,500 Q145,430 135,350" stroke="rgba(83, 147, 93, 0.35)" strokeWidth="2" fill="none" />
                </svg>

                {/* Top Right Accent */}
                <div
                    className="absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(107, 171, 111, 0.4) 0%, transparent 70%)'
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-[var(--miraitu-primary-green)]/10 relative z-50 overflow-visible">
                    <Link href="/home" className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                        <MiraituLogo size={40} />
                        <h2 className="text-[#0f1a11] text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                    </Link>

                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-lg">language</span>
                            <span>{allLanguages.find(l => l.code === lang)?.name || 'English'}</span>
                            <span className={`material-symbols-outlined text-sm text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 max-h-80 overflow-y-auto">
                                        <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('login.selectLanguage')}</p>
                                        {allLanguages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => { setLang(l.code); setIsLangOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${lang === l.code
                                                    ? 'bg-[var(--miraitu-primary-green)]/10 text-[var(--miraitu-primary-green)]'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{l.name}</span>
                                                <span className="text-xs text-gray-400 font-bold">{l.sub}</span>
                                                {lang === l.code && (
                                                    <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-base">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Login Card */}
                <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                    <div className="max-w-md w-full animate-panel-entrance">
                        {/* Card */}
                        <div className="skeuo-card rounded-xl overflow-hidden p-8 md:p-10 relative">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--miraitu-lime-green)]/10 rounded-full blur-3xl -mr-10 -mt-10" />

                            {/* Back Button (Only for Phone/Email Auth) */}
                            {(authMethod === 'phone' || authMethod === 'email') && (
                                <button
                                    onClick={handleBackToSelection}
                                    className="absolute top-6 left-6 text-gray-400 hover:text-[var(--miraitu-primary-green)] transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    {t('login.back')}
                                </button>
                            )}

                            {/* Header */}
                            <div className="text-center mb-8 animate-logo-entrance mt-4">
                                <h1 className="text-[#0f1a11] text-3xl md:text-3xl font-black leading-tight tracking-[-0.02em] mb-2">
                                    {authMethod === 'default' && t('login.welcomeBack')}
                                    {authMethod === 'phone' && t('login.phoneLogin')}
                                    {authMethod === 'email' && t('login.emailLogin')}
                                </h1>
                                <p className="text-[#53935d] text-base font-medium">
                                    {authMethod === 'default' && t('login.signInSubtitle')}
                                    {authMethod === 'phone' && phoneState === 'input' && t('login.enterMobile')}
                                    {authMethod === 'phone' && phoneState === 'otp' && t('login.enterOtp')}
                                    {authMethod === 'email' && t('login.emailSubtitle')}
                                </p>
                            </div>

                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                    {successMessage}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {/* DEFAULT SELECTION VIEW */}
                            {authMethod === 'default' && (
                                <div className="space-y-4 animate-button-entrance">
                                    {/* Phone Login Button */}
                                    <button
                                        onClick={() => setAuthMethod('phone')}
                                        className="w-full min-h-14 py-3 flex items-center justify-center gap-3 bg-[var(--miraitu-background-light)] border-2 border-[var(--miraitu-primary-green)]/20 rounded-xl font-bold text-[#0f1a11] hover:bg-[var(--miraitu-primary-green)]/5 hover:border-[var(--miraitu-primary-green)]/40 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] shrink-0">smartphone</span>
                                        <span className="text-center leading-snug">{t('login.continuePhone')}</span>
                                    </button>

                                    {/* Email Login Button */}
                                    <button
                                        onClick={() => setAuthMethod('email')}
                                        className="w-full min-h-14 py-3 flex items-center justify-center gap-3 bg-[var(--miraitu-background-light)] border-2 border-[var(--miraitu-primary-green)]/20 rounded-xl font-bold text-[#0f1a11] hover:bg-[var(--miraitu-primary-green)]/5 hover:border-[var(--miraitu-primary-green)]/40 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] shrink-0">mail</span>
                                        <span className="text-center leading-snug">{t('login.continueEmail')}</span>
                                    </button>

                                    {/* Guest login removed */}
                                </div>
                            )}

                            {/* PHONE LOGIN UI */}
                            {authMethod === 'phone' && (
                                <form onSubmit={phoneState === 'input' ? handleSendOtp : (e) => handleVerifyOtp(e)} className="space-y-6 animate-fade-in">
                                    {phoneState === 'input' && (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">call</span>
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    value={phoneNumber}
                                                    onChange={(e) => {
                                                        // Normalize: strips +91/91 country code from autofill, keeps 10 digits
                                                        const digits = normalizeIndianPhone(e.target.value);
                                                        setPhoneNumber(digits);
                                                        setError(null);
                                                    }}
                                                    className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400 text-lg font-medium"
                                                    placeholder={t('login.mobilePlaceholder')}
                                                    autoFocus
                                                    required
                                                    maxLength={14}
                                                />
                                                {phoneNumber.length > 0 && (
                                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${phoneNumber.length === 10 ? 'text-green-500' : 'text-gray-400'
                                                        }`}>
                                                        {phoneNumber.length}/10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {phoneState === 'otp' && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <span className="text-sm text-gray-500">{t('login.sentTo')} {phoneNumber}</span>
                                                <button type="button" onClick={() => setPhoneState('input')} className="ml-2 text-[var(--miraitu-primary-green)] font-bold text-xs hover:underline">{t('login.edit')}</button>
                                            </div>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">lock</span>
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    value={otp}
                                                    onChange={(e) => {
                                                        // Only digits, max 6
                                                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                        setOtp(digits);
                                                        setError(null);
                                                        // Auto-submit: pass digits directly to avoid stale state
                                                        if (digits.length === 6) {
                                                            handleVerifyOtp(undefined, digits);
                                                        }
                                                    }}
                                                    className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400 text-lg font-medium tracking-widest text-center"
                                                    placeholder="● ● ● ● ● ●"
                                                    autoFocus
                                                    maxLength={6}
                                                    required
                                                />
                                            </div>
                                            <div className="text-center">
                                                <button type="button" onClick={handleResendOtp} disabled={isSigningIn} className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-[var(--miraitu-primary-green)] disabled:opacity-50">{t('login.resendCode')}</button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSigningIn}
                                        className="skeuo-button w-full min-h-14 py-3 flex items-center justify-center gap-3 bg-[var(--miraitu-primary-green)] text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--miraitu-primary-green)]/30"
                                    >
                                        {isSigningIn ? (
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        ) : (
                                            <>
                                                <span className="text-center leading-snug">{phoneState === 'input' ? t('login.getOtp') : t('login.verifyLogin')}</span>
                                                <span className="material-symbols-outlined shrink-0">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* EMAIL LOGIN UI */}
                            {authMethod === 'email' && (
                                <form onSubmit={handleEmailLogin} className="space-y-5 animate-fade-in">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{t('login.emailAddress')}</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">mail</span>
                                            <input
                                                type="email"
                                                value={loginEmail}
                                                onChange={(e) => { setLoginEmail(e.target.value); setEmailError(null); }}
                                                className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400 text-base font-medium"
                                                placeholder="you@example.com"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{t('login.password')}</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">lock</span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginPassword}
                                                onChange={(e) => { setLoginPassword(e.target.value); setEmailError(null); }}
                                                className="skeuo-input w-full pl-12 pr-12 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400 text-base font-medium"
                                                placeholder={t('login.passwordPlaceholder')}
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[var(--miraitu-primary-green)] transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={openResetPasswordConfirm}
                                                disabled={isSigningIn}
                                                className="text-xs font-bold text-[var(--miraitu-primary-green)] hover:underline disabled:opacity-50"
                                            >
                                                Reset Password
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Error */}
                                    {emailError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                            {emailError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSigningIn || !loginEmail.trim() || !loginPassword}
                                        className="skeuo-button w-full min-h-14 py-3 flex items-center justify-center gap-3 bg-[var(--miraitu-primary-green)] text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--miraitu-primary-green)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSigningIn ? (
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        ) : (
                                            <>
                                                <span className="text-center leading-snug">{t('login.logIn')}</span>
                                                <span className="material-symbols-outlined shrink-0">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Create Account Link */}
                            {(authMethod === 'default' || authMethod === 'email') && (
                                <p className="text-center mt-8 text-sm text-[#53935d] font-medium animate-footer-entrance">
                                    {t('login.noAccount')}{' '}
                                    <Link href="/user-register" className="text-[var(--miraitu-primary-green)] font-bold hover:underline">
                                        {t('login.createHere')}
                                    </Link>
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex justify-center gap-6 text-xs text-[#1a3d21] font-medium animate-footer-entrance">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                <span className="drop-shadow-sm">{t('login.secure')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">eco</span>
                                <span className="drop-shadow-sm">{t('login.ecoCertified')}</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
    const { t } = useLanguage();
    return <MiraituLoader label={t('login.loading')} />;
}
