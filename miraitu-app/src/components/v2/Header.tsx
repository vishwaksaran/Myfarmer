'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';

const navItems = [
    { name: 'Machinery', path: '/v2/machinery' },
    { name: 'Crops', path: '/v2/crops' },
    { name: 'Livestock', path: '/v2/livestock' },
    { name: 'Veterinary', path: '/v2/veterinary' },
    { name: 'Services', path: '/v2/services' },
    { name: 'Shop', path: '/v2/shop' },
    { name: 'Toolbox', path: '/v2/toolbox' },
    { name: 'Community', path: '/v2/community' },
];

export default function Header() {
    const pathname = usePathname();
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('en');

    const allLanguages = [
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

    const saveLanguageSelection = () => {
        setIsLanguageModalOpen(false);
    };

    const isActive = (path: string) => pathname.startsWith(path);

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
                                    placeholder="Search livestock, tools, services..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="hidden xl:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${isActive(item.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsLanguageModalOpen(true)}
                                className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold skeuo-card transition-transform hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-primary text-lg">language</span>
                                <span className="hidden lg:inline">{allLanguages.find(lang => lang.code === selectedLang)?.name || 'English'}</span>
                            </button>
                            <button className="flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                Login
                            </button>
                        </div>
                    </div>
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
                                <h2 className="text-4xl font-extrabold text-primary-dark tracking-tight">Select Regional Language</h2>
                                <p className="text-soil-dark font-medium mt-2 text-base">Choose your preferred language for Miraitu</p>
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
                                    Save Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
