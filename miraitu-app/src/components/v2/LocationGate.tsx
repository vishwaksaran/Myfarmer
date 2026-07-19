'use client';

import { useState } from 'react';
import { useAppLocation } from '@/context/LocationContext';

/**
 * First-load prompt asking the user to share their location.
 * Renders only when the LocationProvider decides a prompt is needed
 * (no stored location and the user hasn't answered before).
 */
export default function LocationGate() {
    const { needsPrompt, loading, requestLocation, setManualLocation, dismissPrompt } = useAppLocation();
    const [manual, setManual] = useState(false);
    const [value, setValue] = useState('');
    const [denied, setDenied] = useState(false);

    if (!needsPrompt) return null;

    const handleAllow = async () => {
        const loc = await requestLocation();
        if (!loc) setDenied(true); // permission denied / unavailable → offer manual entry
    };

    const handleManualSave = () => {
        if (value.trim()) setManualLocation(value);
    };

    return (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismissPrompt} />

            <div className="relative w-full sm:max-w-md bg-white dark:bg-[#141f14] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'locGateUp 0.35s cubic-bezier(.22,1.2,.36,1) both' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-green-500 px-6 pt-7 pb-8 text-center relative">
                    <button
                        onClick={dismissPrompt}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-white text-lg">close</span>
                    </button>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl">location_on</span>
                    </div>
                    <h2 className="text-xl font-black text-white">Set your location</h2>
                    <p className="text-white/85 text-sm mt-1">
                        We use it to show nearby services, providers and prices for your area.
                    </p>
                </div>

                <div className="px-6 py-6">
                    {!manual ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleAllow}
                                disabled={loading}
                                className="w-full rounded-xl py-3.5 bg-primary text-white font-black text-base shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                        Detecting…
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">my_location</span>
                                        Use my current location
                                    </>
                                )}
                            </button>

                            {denied && (
                                <p className="text-xs text-red-500 text-center">
                                    Location access was blocked. You can enter it manually below.
                                </p>
                            )}

                            <button
                                onClick={() => setManual(true)}
                                className="w-full rounded-xl py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">edit_location_alt</span>
                                Enter location manually
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Your location</label>
                            <input
                                autoFocus
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleManualSave(); }}
                                placeholder="Village / District, State"
                                className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none dark:text-white text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setManual(false)}
                                    className="rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleManualSave}
                                    disabled={!value.trim()}
                                    className="flex-1 rounded-xl py-3 bg-primary text-white font-black text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    Save location
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes locGateUp{0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
        </div>
    );
}
