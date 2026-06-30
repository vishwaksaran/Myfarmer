'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import { normalizeIndianPhone } from '@/lib/phone';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { signInWithPhone, verifyOtp, loading: authLoading } = useAuth();
    const router = useRouter();

    const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
    const [phoneInput, setPhoneInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [error, setError] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [isEmailSigningIn, setIsEmailSigningIn] = useState(false);

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        if (!phoneInput.trim()) {
            setError('Please enter your phone number');
            return;
        }
        // Ensure phone has country code
        const phone = phoneInput.startsWith('+') ? phoneInput.trim() : `+91${phoneInput.trim()}`;
        setSendingOtp(true);
        setError('');
        const result = await signInWithPhone(phone);
        setSendingOtp(false);
        if (result.error) {
            setError(result.error);
        } else {
            setOtpSent(true);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode.trim() || otpCode.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        const phone = phoneInput.startsWith('+') ? phoneInput.trim() : `+91${phoneInput.trim()}`;
        setError('');
        const result = await verifyOtp(phone, otpCode.trim());
        if (result.error) {
            setError(result.error);
        } else {
            onClose();
        }
    };

    const handleEmailLogin = async () => {
        const email = emailInput.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!passwordInput || passwordInput.length < 6) {
            setError('Please enter your password');
            return;
        }

        setIsEmailSigningIn(true);
        setError('');

        try {
            const { default: supabase } = await import('@/lib/supabase');
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: passwordInput,
            });

            if (signInError) {
                if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
                    setError('Invalid email or password');
                } else {
                    setError(signInError.message || 'Login failed. Please try again.');
                }
                return;
            }

            onClose();
        } catch {
            setError('Unable to log in right now. Please try again.');
        } finally {
            setIsEmailSigningIn(false);
        }
    };

    const handleSignUpClick = () => {
        onClose();
        router.push('/user-register');
    };

    const resetState = () => {
        setAuthMethod('phone');
        setOtpSent(false);
        setOtpCode('');
        setPhoneInput('');
        setEmailInput('');
        setPasswordInput('');
        setError('');
    };

    const handleMethodChange = (method: 'phone' | 'email') => {
        setAuthMethod(method);
        setError('');
        if (method === 'email') {
            setOtpSent(false);
            setOtpCode('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 animate-fadeIn" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl px-5 sm:px-8 pb-6 sm:pb-8 pt-12 sm:pt-14 max-w-[540px] w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onClose(); resetState(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex flex-col items-center">
                    <div className="mb-4 sm:mb-5">
                        <MiraituLogo size={72} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 text-center">
                        {authMethod === 'phone' && otpSent ? 'Enter OTP' : 'Welcome Back!'}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-5 text-center">
                        {authMethod === 'phone' && otpSent
                            ? `We sent a code to ${phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`}`
                            : 'Choose your login method'}
                    </p>

                    <div className="w-full mb-5 rounded-2xl p-1 bg-gray-100 dark:bg-gray-800 grid grid-cols-2 gap-1">
                        <button
                            onClick={() => handleMethodChange('phone')}
                            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${authMethod === 'phone' ? 'bg-white dark:bg-gray-900 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            Phone OTP
                        </button>
                        <button
                            onClick={() => handleMethodChange('email')}
                            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${authMethod === 'email' ? 'bg-white dark:bg-gray-900 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            Registered Email
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="w-full mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {authMethod === 'phone' && !otpSent ? (
                        <>
                            {/* Phone Input */}
                            <div className="w-full space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Phone Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center px-3 sm:px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent text-sm font-bold text-gray-600 dark:text-gray-300">+91</span>
                                        <input
                                            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                            placeholder="Enter your phone number"
                                            type="tel"
                                            value={phoneInput}
                                            onChange={(e) => { setPhoneInput(normalizeIndianPhone(e.target.value)); setError(''); }}
                                            maxLength={14}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Send OTP Button */}
                            <button
                                onClick={handleSendOtp}
                                disabled={authLoading || sendingOtp}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-4 disabled:opacity-50"
                            >
                                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </>
                    ) : authMethod === 'phone' && otpSent ? (
                        <>
                            {/* OTP Input */}
                            <div className="w-full space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">6-Digit OTP</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium text-center text-xl sm:text-2xl tracking-[0.35em] sm:tracking-[0.5em]"
                                        placeholder="000000"
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Verify OTP Button */}
                            <button
                                onClick={handleVerifyOtp}
                                disabled={authLoading}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-3 disabled:opacity-50"
                            >
                                {authLoading ? 'Verifying...' : 'Verify & Log In'}
                            </button>

                            {/* Back / Resend */}
                            <div className="flex items-center justify-between w-full mb-6">
                                <button
                                    onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                                    className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    &larr; Change Number
                                </button>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email Address</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                        placeholder="you@example.com"
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => { setEmailInput(e.target.value); setError(''); }}
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                            placeholder="Enter your password"
                                            type={showLoginPassword ? 'text' : 'password'}
                                            value={passwordInput}
                                            onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(v => !v)}
                                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">{showLoginPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleEmailLogin}
                                disabled={isEmailSigningIn}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-2 disabled:opacity-50"
                            >
                                {isEmailSigningIn ? 'Logging in...' : 'Log In with Email'}
                            </button>

                            <button
                                onClick={() => { onClose(); router.push('/user-login'); }}
                                className="text-sm font-bold text-primary hover:underline mb-4"
                            >
                                Forgot password?
                            </button>
                        </>
                    )}

                    {/* Footer */}
                    <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-400 font-medium text-center">
                        Don&apos;t have an account?{' '}
                        <button onClick={handleSignUpClick} className="text-primary font-bold cursor-pointer hover:underline">
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}
