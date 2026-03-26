'use client';

import { useLoginPrompt } from '@/context/LoginPromptContext';
import { useRouter } from 'next/navigation';

export default function LoginPromptOverlay() {
    const router = useRouter();
    const { isLoginPromptOpen, closeLoginPrompt, dismissLoginPrompt } = useLoginPrompt();

    if (!isLoginPromptOpen) return null;

    const handleLogin = () => {
        closeLoginPrompt();
        router.push('/user-login');
    };

    const handleSignUp = () => {
        closeLoginPrompt();
        router.push('/user-register');
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={closeLoginPrompt}
            style={{ animation: 'loginOverlayFadeIn 0.25s ease-out' }}
            data-login-overlay
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Modal */}
            <div
                className="relative bg-white dark:bg-[#1a231a] rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'loginModalSlideUp 0.3s ease-out' }}
            >
                {/* Top gradient accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-green-400 to-accent"></div>

                {/* Close button */}
                <button
                    onClick={closeLoginPrompt}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Content */}
                <div className="px-7 py-8 flex flex-col items-center text-center">
                    {/* Lock icon with pulse */}
                    <div className="relative mb-5">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-green-100 dark:from-primary/20 dark:to-green-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-black text-xs font-bold">priority_high</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1.5">
                        Login Required
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[280px] leading-relaxed">
                        Please login to access all features, connect with farmers, and manage your farm.
                    </p>

                    {/* Login button */}
                    <button
                        onClick={handleLogin}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        <span className="material-symbols-outlined text-lg">login</span>
                        Login & Continue
                    </button>

                    {/* Sign Up button */}
                    <button
                        onClick={handleSignUp}
                        className="w-full py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-primary/30 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all flex items-center justify-center gap-2.5 mb-3"
                    >
                        <span className="material-symbols-outlined text-lg text-primary">person_add</span>
                        <span className="font-bold text-sm text-primary">Create New Account</span>
                    </button>

                    {/* Skip */}
                    <button
                        onClick={dismissLoginPrompt}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                    >
                        Maybe later
                    </button>

                    {/* Trust badges */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 w-full flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-xs">verified_user</span>
                            Secure
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-xs">speed</span>
                            Quick Login
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-xs">group</span>
                            50K+ Farmers
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loginOverlayFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes loginModalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
