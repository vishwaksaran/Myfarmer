'use client';

import { useAuth } from '@/context/AuthContext';
import MiraituLogo from '@/components/MiraituLogo';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { signInWithGoogle, loginAsGuest, loading: authLoading } = useAuth();

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleGuestLogin = async () => {
        try {
            await loginAsGuest();
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl px-8 pb-8 pt-16 max-w-[420px] w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex flex-col items-center">
                    <div className="mb-6">
                        <MiraituLogo size={80} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Welcome Back!</h3>
                    <p className="text-gray-500 text-sm mb-6">Log in to connect with fellow farmers</p>

                    {/* Inputs */}
                    <div className="w-full space-y-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Phone Number or Email</label>
                            <input className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium" placeholder="Enter phone or email" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
                            <input type="password" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium" placeholder="Enter password" />
                        </div>
                        <div className="flex justify-end">
                            <button className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
                        </div>
                    </div>

                    {/* Login Button - calling guest login as demo */}
                    <button
                        onClick={handleGuestLogin}
                        disabled={authLoading}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all mb-6"
                    >
                        Log In
                    </button>

                    {/* Divider */}
                    <div className="relative w-full text-center mb-6">
                        <div className="absolute top-1/2 w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                        <span className="relative bg-white dark:bg-[#1a231a] px-3 text-xs font-bold text-gray-400">or continue with</span>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={authLoading}
                            className="flex-1 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Google</span>
                        </button>
                        <button
                            onClick={handleGuestLogin}
                            disabled={authLoading}
                            className="flex-1 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">smartphone</span>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">OTP</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-xs text-gray-400 font-medium">
                        Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline">Sign Up</span>
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
