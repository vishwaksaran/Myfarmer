'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { signInWithPhone, verifyOtp, loading: authLoading } = useAuth();
    const router = useRouter();

    const [phoneInput, setPhoneInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);

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

    const handleSignUpClick = () => {
        onClose();
        router.push('/user-register');
    };

    const resetState = () => {
        setOtpSent(false);
        setOtpCode('');
        setPhoneInput('');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl px-8 pb-8 pt-16 max-w-[420px] w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onClose(); resetState(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex flex-col items-center">
                    <div className="mb-6">
                        <MiraituLogo size={80} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                        {otpSent ? 'Enter OTP' : 'Welcome Back!'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {otpSent ? `We sent a code to ${phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`}` : 'Log in to connect with fellow farmers'}
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="w-full mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {!otpSent ? (
                        <>
                            {/* Phone Input */}
                            <div className="w-full space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Phone Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent text-sm font-bold text-gray-600 dark:text-gray-300">+91</span>
                                        <input
                                            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                            placeholder="Enter your phone number"
                                            type="tel"
                                            value={phoneInput}
                                            onChange={(e) => { setPhoneInput(e.target.value); setError(''); }}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Send OTP Button */}
                            <button
                                onClick={handleSendOtp}
                                disabled={authLoading || sendingOtp}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-6 disabled:opacity-50"
                            >
                                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* OTP Input */}
                            <div className="w-full space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">6-Digit OTP</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium text-center text-2xl tracking-[0.5em]"
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
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-3 disabled:opacity-50"
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
                    )}

                    {/* Footer */}
                    <p className="mt-8 text-xs text-gray-400 font-medium">
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
