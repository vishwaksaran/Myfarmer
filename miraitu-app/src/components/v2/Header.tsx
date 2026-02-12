'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import { useLanguage } from '@/i18n/LanguageContext';
import { LangCode } from '@/i18n/translations';
import { useCart } from '@/context/CartContext';

const primaryNavItems = [
    { tKey: 'nav.about', path: '/v2/about' },
    { tKey: 'nav.machinery', path: '/v2/machinery' },
    { tKey: 'nav.crops', path: '/v2/crops' },
    { tKey: 'nav.livestock', path: '/v2/livestock' },
    { tKey: 'nav.finance', path: '/v2/finance' },
    { tKey: 'nav.shop', path: '/v2/shop' },
];

const moreNavItems = [
    { tKey: 'nav.veterinary', path: '/v2/veterinary', icon: 'vaccines' },
    { tKey: 'nav.land', path: '/v2/land', icon: 'landscape' },
    { tKey: 'nav.services', path: '/v2/services', icon: 'home_repair_service' },
    { tKey: 'nav.toolbox', path: '/v2/toolbox', icon: 'handyman' },
    { tKey: 'nav.community', path: '/v2/community', icon: 'groups' },
];

export default function Header() {
    const pathname = usePathname();
    const { lang, setLang, t } = useLanguage();
    const { totalItems } = useCart();
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState<LangCode>(lang);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const allLanguages: { name: string; sub: string; code: LangCode }[] = [
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

    // Close more menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveLanguageSelection = () => {
        setLang(selectedLang);
        setIsLanguageModalOpen(false);
    };

    const isActive = (path: string) => pathname.startsWith(path);

    // Check if any "more" item is active
    const isMoreActive = moreNavItems.some(item => isActive(item.path));

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1400px] px-4 py-3">
                    {/* Main Header Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/v2" className="flex items-center gap-2 shrink-0">
                            <MiraituLogo size={36} />
                            <h2 className="text-xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:block flex-1 max-w-md mx-4">
                            <div className="skeuo-inset flex h-10 w-full items-center rounded-xl bg-[#ebf0ea] dark:bg-[#222d21] px-4">
                                <span className="material-symbols-outlined text-primary/60 text-lg">search</span>
                                <input
                                    className="w-full border-none bg-transparent px-3 text-sm focus:ring-0 placeholder:text-gray-500"
                                    placeholder={t('header.search')}
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Navigation Menu — Desktop */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {primaryNavItems.map((item) => (
                                <Link
                                    key={item.tKey}
                                    href={item.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${isActive(item.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {t(item.tKey)}
                                </Link>
                            ))}

                            {/* More Menu Button + Dropdown */}
                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                    className={`flex items-center justify-center size-9 rounded-lg transition-all ${isMoreMenuOpen || isMoreActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    aria-label="More categories"
                                >
                                    <span className="material-symbols-outlined text-xl">apps</span>
                                </button>

                                {/* Dropdown */}
                                {isMoreMenuOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                        <div className="p-2">
                                            <p className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('nav.moreCategories')}</p>
                                            {moreNavItems.map((item) => (
                                                <Link
                                                    key={item.tKey}
                                                    href={item.path}
                                                    onClick={() => setIsMoreMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(item.path)
                                                        ? 'text-primary bg-primary/5'
                                                        : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`}>{item.icon}</span>
                                                    {t(item.tKey)}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Become a Dealer/Seller Banner */}
                                        <Link
                                            href="/v2/become-seller"
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className="block m-2 mt-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 group hover:from-orange-600 hover:to-amber-600 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-white/20 backdrop-blur-sm shrink-0">
                                                    <span className="material-symbols-outlined text-white text-xl">storefront</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white leading-tight">Become a Dealer / Seller</p>
                                                    <p className="text-[11px] text-white/80 font-medium">Start selling on Miraitu today</p>
                                                </div>
                                                <span className="material-symbols-outlined text-white/80 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Download App Buttons */}
                            <div className="hidden xl:flex items-center gap-1.5">
                                <a href="/v2/about" className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 transition-colors">
                                    <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.608-2.302 2.608-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                                    <span className="leading-tight">{t('header.playStore')}</span>
                                </a>
                                <a href="/v2/about" className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 transition-colors">
                                    <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                    <span className="leading-tight">{t('header.appStore')}</span>
                                </a>
                            </div>
                            <button
                                onClick={() => setIsLanguageModalOpen(true)}
                                className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold skeuo-card transition-transform hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-primary text-lg">language</span>
                                <span className="hidden lg:inline">{allLanguages.find(lang => lang.code === selectedLang)?.name || 'English'}</span>
                            </button>

                            {/* Cart Button */}
                            <Link href="/v2/shop/checkout" className="relative hidden sm:flex items-center justify-center size-10 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/10 hover:bg-primary/5 hover:text-primary transition-colors skeuo-card">
                                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            <button className="flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                {t('header.login')}
                            </button>
                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden flex items-center justify-center size-10 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden mt-3 pb-2 border-t border-black/5 dark:border-white/10 pt-3">
                            <div className="grid grid-cols-2 gap-2">
                                {[...primaryNavItems.map(({ tKey, path }) => ({ tKey, path })), ...moreNavItems.map(({ tKey, path, icon }) => ({ tKey, path, icon }))].map((item) => (
                                    <Link
                                        key={item.tKey}
                                        href={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(item.path)
                                            ? 'text-primary bg-primary/5'
                                            : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {'icon' in item && <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`}>{(item as { icon: string }).icon}</span>}
                                        {t(item.tKey)}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Language Selection Modal */}
            {isLanguageModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setIsLanguageModalOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                    <div
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-4 border-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f0f4ec] opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 p-10">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLanguageModalOpen(false)}
                                className="absolute top-6 right-6 size-12 rounded-2xl bg-gradient-to-br from-white to-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.8)] flex items-center justify-center text-soil-dark hover:text-red-500 transition-all active:shadow-inner active:scale-95"
                            >
                                <span className="material-symbols-outlined font-bold text-xl">close</span>
                            </button>

                            {/* Header */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary to-[#4d8f43] shadow-floating flex items-center justify-center text-white mb-6">
                                    <span className="material-symbols-outlined text-4xl">translate</span>
                                </div>
                                <h2 className="text-4xl font-extrabold text-primary-dark tracking-tight">{t('lang.title')}</h2>
                                <p className="text-soil-dark font-medium mt-2 text-base">{t('lang.subtitle')}</p>
                            </div>

                            {/* Language Grid */}
                            <div className="mb-8">
                                <div className="grid grid-cols-5 gap-4">
                                    {allLanguages.map((lang) => {
                                        const isSelected = selectedLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => setSelectedLang(lang.code)}
                                                className={`
                                                    relative h-28 rounded-[2rem] p-4 flex flex-col items-center justify-center border-2 transition-all
                                                    ${isSelected
                                                        ? 'bg-white border-[#4d8f43] shadow-none'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-transparent shadow-[4px_4px_8px_rgba(166,164,156,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-xl'}
                                                `}
                                            >
                                                <p className="text-2xl font-extrabold text-primary-dark mb-1">{lang.name}</p>
                                                <p className="text-xs uppercase tracking-wider font-bold text-soil-dark/50">{lang.sub}</p>

                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 size-6 bg-[#4d8f43] rounded-full flex items-center justify-center shadow-md">
                                                        <span className="material-symbols-outlined text-sm text-white font-black">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={saveLanguageSelection}
                                    className="w-80 h-16 rounded-2xl bg-gradient-to-b from-[#4d8f43] to-primary text-white font-black text-xl flex items-center justify-center gap-3 shadow-[0_5px_0_#1a3617,_0_10px_14px_rgba(44,89,38,0.4)] active:shadow-[0_2px_0_#1a3617,_0_5px_10px_rgba(44,89,38,0.4)] active:translate-y-1 transition-all"
                                >
                                    <span className="material-symbols-outlined font-black text-2xl">done_all</span>
                                    {t('lang.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

