'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';
import { useLanguage } from '@/i18n/LanguageContext';
import { LangCode } from '@/i18n/translations';

/**
 * UserLoginPage - Login page with Google SSO and Phone Auth
 */
export default function UserLoginPage() {
    const { user, loading, signInWithGoogle, signInWithPhone, loginAsGuest } = useAuth();
    const { lang, setLang, t } = useLanguage();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Auth Method State
    const [authMethod, setAuthMethod] = useState<'default' | 'phone'>('default');
    const [phoneState, setPhoneState] = useState<'input' | 'otp'>('input');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');

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

    // Redirect to home if already logged in
    useEffect(() => {
        if (user && !loading) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            setIsSigningIn(true);
            setError(null);
            await signInWithGoogle();
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.');
            console.error(err);
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            setIsSigningIn(true);
            await loginAsGuest();
            router.push('/');
        } catch (err) {
            setError('Failed to continue as guest.');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
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
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    };

    // directOtp is passed when auto-submitting from onChange (avoids stale state)
    const handleVerifyOtp = async (e?: React.FormEvent, directOtp?: string) => {
        e?.preventDefault();
        const otpToVerify = directOtp ?? otp;
        if (otpToVerify.length !== 6) {
            setError('Please enter the 6-digit OTP');
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
                setError(data.error || 'Failed to verify OTP');
                setOtp('');
            } else {
                // Set Supabase session
                if (data.session) {
                    const { default: supabase } = await import('@/lib/supabase');
                    await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });
                }

                setSuccessMessage('✅ Login successful! Redirecting...');

                // Use server-side onboarding check (not AuthContext which may have stale user)
                const onboarded = data.onboarding_completed === true;
                setTimeout(() => router.push(onboarded ? '/' : '/onboarding'), 1500);
            }
        } catch {
            setError('Failed to verify OTP. Please try again.');
            setOtp('');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleBackToSelection = () => {
        setAuthMethod('default');
        setPhoneState('input');
        setError(null);
    };

    // Dev-only login for localhost testing
    const handleDevLogin = async () => {
        try {
            setIsSigningIn(true);
            setError(null);
            const response = await fetch('/api/auth/dev-login', { method: 'POST' });
            const data = await response.json();
            if (!response.ok || data.error) {
                setError(data.error || 'Dev login failed');
                return;
            }
            // Set the Supabase session from the API response
            const { default: supabase } = await import('@/lib/supabase');
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            });
            setSuccessMessage('✅ Dev login successful! Redirecting to admin...');
            setTimeout(() => router.push('/admin'), 1000);
        } catch (err) {
            setError('Dev login failed. Check console for details.');
            console.error(err);
        } finally {
            setIsSigningIn(false);
        }
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
                setError(data.error || 'Failed to resend OTP');
            }
        } catch {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="relative min-h-screen bg-[var(--miraitu-background-light)] font-display" data-no-auth>
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

                            {/* Back Button (Only for Phone Auth) */}
                            {authMethod === 'phone' && (
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
                                </h1>
                                <p className="text-[#53935d] text-base font-medium">
                                    {authMethod === 'default' && t('login.signInSubtitle')}
                                    {authMethod === 'phone' && phoneState === 'input' && t('login.enterMobile')}
                                    {authMethod === 'phone' && phoneState === 'otp' && t('login.enterOtp')}
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
                                    {/* Google SSO — temporarily disabled
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={isSigningIn}
                                        className="w-full h-14 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-[#0f1a11] hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {isSigningIn ? (
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        ) : (
                                            <>
                                                <GoogleIcon />
                                                <span>{t('login.continueGoogle')}</span>
                                            </>
                                        )}
                                    </button>
                                    */}

                                    {/* Phone Login Button */}
                                    <button
                                        onClick={() => setAuthMethod('phone')}
                                        className="w-full h-14 flex items-center justify-center gap-3 bg-[var(--miraitu-background-light)] border-2 border-[var(--miraitu-primary-green)]/20 rounded-xl font-bold text-[#0f1a11] hover:bg-[var(--miraitu-primary-green)]/5 hover:border-[var(--miraitu-primary-green)]/40 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[var(--miraitu-primary-green)]">smartphone</span>
                                        <span>{t('login.continuePhone')}</span>
                                    </button>

                                    {/* Guest login removed */}

                                    {/* Dev Login — localhost only */}
                                    {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                                        <>
                                            <div className="flex items-center gap-4 my-2">
                                                <div className="flex-1 h-px bg-red-200" />
                                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Dev Only</span>
                                                <div className="flex-1 h-px bg-red-200" />
                                            </div>
                                            <button
                                                onClick={handleDevLogin}
                                                disabled={isSigningIn}
                                                className="w-full h-12 flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 border-dashed rounded-xl font-bold text-red-600 text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">developer_mode</span>
                                                Dev Admin Login (localhost)
                                            </button>
                                        </>
                                    )}
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
                                                        // Only digits, max 10
                                                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setPhoneNumber(digits);
                                                        setError(null);
                                                    }}
                                                    className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400 text-lg font-medium"
                                                    placeholder={t('login.mobilePlaceholder')}
                                                    autoFocus
                                                    required
                                                    maxLength={10}
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
                                        className="skeuo-button w-full h-14 flex items-center justify-center gap-3 bg-[var(--miraitu-primary-green)] text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--miraitu-primary-green)]/30"
                                    >
                                        {isSigningIn ? (
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        ) : (
                                            <>
                                                {phoneState === 'input' ? t('login.getOtp') : t('login.verifyLogin')}
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Create Account Link (Only on selection screen or simple text on phone screen?) */}
                            {authMethod === 'default' && (
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
 * Google Icon SVG
 */
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
            <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] animate-spin">
                    progress_activity
                </span>
                <p className="text-[#53935d] font-medium">Loading...</p>
            </div>
        </div>
    );
}
