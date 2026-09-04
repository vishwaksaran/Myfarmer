'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { LangCode } from '@/i18n/translations';
import { Z } from '@/lib/z-layers';
import { onSplashDone } from '@/lib/splash';
import { LANGUAGE_FIRST_RUN_ENABLED } from '@/lib/feature-flags';

/**
 * First-run language chooser.
 *
 * CURRENTLY OFF — gated behind LANGUAGE_FIRST_RUN_ENABLED while the app is only
 * part-translated. See docs/TEMPORARY-CHANGES.md. Everything below describes
 * how it behaves once the flag goes back to true; nothing here was deleted.
 *
 * Shown once per device, on mobile only, before the user reaches the app — and
 * in the installed PWA, only after the splash has finished. The answer is
 * remembered under LANG_ONBOARDED_KEY, so a normal reopen never asks again —
 * only a reinstall or a storage clear brings it back.
 *
 * Deliberately blocking: no close button and no backdrop dismiss, because the
 * whole point is to pick a language before reading a screenful of English.
 * Desktop is skipped entirely (the header's translate button covers it) and the
 * flag is NOT written there, so the same person still gets asked on their phone.
 */
const LANG_ONBOARDED_KEY = 'miraitu-lang-onboarded';

const LANGUAGES: { name: string; sub: string; code: LangCode }[] = [
    { name: 'English', sub: 'ENGLISH', code: 'en' },
    { name: 'हिंदी', sub: 'HINDI', code: 'hi' },
    { name: 'मराठी', sub: 'MARATHI', code: 'mr' },
    { name: 'ગુજરાતી', sub: 'GUJARATI', code: 'gu' },
    { name: 'తెలుగు', sub: 'TELUGU', code: 'te' },
    { name: 'தமிழ்', sub: 'TAMIL', code: 'ta' },
    { name: 'ಕನ್ನಡ', sub: 'KANNADA', code: 'kn' },
    { name: 'ਪੰਜਾਬੀ', sub: 'PUNJABI', code: 'pa' },
    { name: 'বাংলা', sub: 'BENGALI', code: 'bn' },
    { name: 'മലയാളം', sub: 'MALAYALAM', code: 'ml' },
];

/** Phone-sized screen, a mobile UA, or the installed PWA running standalone. */
function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari reports installed PWAs here rather than via display-mode.
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const mobileUa = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(window.navigator.userAgent);
    return standalone || narrow || mobileUa;
}

export default function LanguageFirstRunGate() {
    const { lang, setLang, t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [choice, setChoice] = useState<LangCode>('en');

    // Read through a ref so the wait below can be mount-once. Watching `lang`
    // directly would tear the wait down and rebuild it every time the provider
    // restores a saved language, and a teardown landing between the splash
    // leaving and the frame that follows it drops the reveal entirely.
    const langRef = useRef(lang);
    useEffect(() => { langRef.current = lang; }, [lang]);

    // Must run after mount: localStorage and viewport are client-only, and
    // deciding during render would desync from the server-rendered HTML.
    //
    // Waits for the splash to leave before asking. The installed PWA launches
    // onto it and this gate outranks it (Z.AUTH 1000000 vs the splash's
    // 999999), so revealing on the next frame — as this used to — put the
    // chooser on top of the brand moment instead of after it. In a normal
    // browser tab no splash plays and the wait resolves at once.
    useEffect(() => {
        if (!LANGUAGE_FIRST_RUN_ENABLED) return;

        let frame = 0;

        const reveal = () => {
            // A frame's grace so the app under the splash has painted before the
            // gate lands on it.
            frame = requestAnimationFrame(() => {
                try {
                    if (localStorage.getItem(LANG_ONBOARDED_KEY)) return;
                } catch {
                    // Private mode / storage blocked — asking every launch would
                    // be worse than never asking, so stay out of the way.
                    return;
                }
                if (!isMobileDevice()) return;
                setChoice(langRef.current);
                setVisible(true);
            });
        };

        const unsubscribe = onSplashDone(reveal);

        return () => {
            unsubscribe();
            cancelAnimationFrame(frame);
        };
    }, []);

    if (!visible) return null;

    const confirm = () => {
        setLang(choice);
        try {
            localStorage.setItem(LANG_ONBOARDED_KEY, '1');
        } catch {
            // Selection still applies for this session even if we cannot remember it.
        }
        setVisible(false);
    };

    return (
        <div
            style={{ zIndex: Z.AUTH }}
            className="fixed inset-0 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('lang.title')}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative w-full sm:max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-t-4 border-white max-h-[88vh] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f0f4ec] opacity-50 pointer-events-none" />

                <div className="relative z-10 p-5 sm:p-8 overflow-y-auto flex-1">
                    <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                        <div className="size-14 sm:size-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary to-[#4d8f43] shadow-floating flex items-center justify-center text-white mb-4 sm:mb-6">
                            <span className="material-symbols-outlined text-2xl sm:text-4xl">translate</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight">{t('lang.title')}</h2>
                        <p className="text-soil-dark font-medium mt-1 sm:mt-2 text-sm sm:text-base">{t('lang.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                        {LANGUAGES.map((item) => {
                            const isSelected = choice === item.code;
                            return (
                                <button
                                    key={item.code}
                                    onClick={() => setChoice(item.code)}
                                    aria-pressed={isSelected}
                                    className={`relative h-20 sm:h-28 rounded-2xl sm:rounded-[2rem] p-2.5 sm:p-4 flex flex-col items-center justify-center border-2 transition-all ${isSelected
                                        ? 'bg-white border-[#4d8f43] shadow-none'
                                        : 'bg-gradient-to-br from-white to-gray-50 border-transparent shadow-[4px_4px_8px_rgba(166,164,156,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)]'
                                        }`}
                                >
                                    <p className="text-lg sm:text-2xl font-extrabold text-primary-dark mb-0.5 sm:mb-1">{item.name}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-soil-dark/50">{item.sub}</p>
                                    {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 size-5 sm:size-6 bg-[#4d8f43] rounded-full flex items-center justify-center shadow-md">
                                            <span className="material-symbols-outlined text-xs sm:text-sm text-white font-black">check</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative z-10 p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
                    <button
                        onClick={confirm}
                        className="w-full sm:w-80 sm:mx-auto h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-[#4d8f43] to-primary text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_5px_0_#1a3617,_0_10px_14px_rgba(44,89,38,0.4)] active:shadow-[0_2px_0_#1a3617,_0_5px_10px_rgba(44,89,38,0.4)] active:translate-y-1 transition-all"
                    >
                        <span className="material-symbols-outlined font-black text-xl sm:text-2xl">done_all</span>
                        {t('lang.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
