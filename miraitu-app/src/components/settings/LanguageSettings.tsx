'use client';

import { useState } from 'react';

export default function LanguageSettings() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('pa');
    const [displayLanguages, setDisplayLanguages] = useState([
        { code: 'en', name: 'English', sub: 'ENGLISH' },
        { code: 'hi', name: 'हिंदी', sub: 'HINDI' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', sub: 'PUNJABI' },
        { code: 'te', name: 'తెలుగు', sub: 'TELUGU' },
    ]);

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

    const saveSelection = () => {
        // Find the selected language from all languages
        const selectedLanguage = allLanguages.find(lang => lang.code === selectedLang);

        if (selectedLanguage) {
            // Check if language already exists in display
            const existsInDisplay = displayLanguages.some(lang => lang.code === selectedLang);

            if (!existsInDisplay) {
                // Replace the last language with the selected one
                const updatedLanguages = [...displayLanguages.slice(0, 3), selectedLanguage];
                setDisplayLanguages(updatedLanguages);
            }
        }

        setIsModalOpen(false);
    };

    return (
        <>
            <section className="rounded-3xl bg-harvest-loam p-1 shadow-soft-raised border border-[#e0e5df]">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-[#e8eede] shadow-soft-raised flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">translate</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary-dark">Language</h2>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
                        >
                            View More
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {displayLanguages.map((lang) => {
                            const isSelected = selectedLang === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLang(lang.code)}
                                    className={`
                                        relative h-28 rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-all
                                        ${isSelected
                                            ? 'bg-white border-[#4d8f43] shadow-none'
                                            : 'bg-gradient-to-br from-white to-gray-50 border-transparent shadow-[6px_6px_12px_rgba(166,164,156,0.3),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-xl'}
                                    `}
                                >
                                    <p className={`text-2xl font-extrabold mb-1 ${isSelected ? 'text-primary-dark' : 'text-primary-dark'}`}>
                                        {lang.name}
                                    </p>
                                    <p className={`text-xs uppercase tracking-wider font-bold ${isSelected ? 'text-soil-dark/50' : 'text-soil-dark/50'}`}>
                                        {lang.sub}
                                    </p>

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
            </section>

            {/* Modal - No Scrolling, Responsive */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                    <div
                        className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border-t-4 border-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f0f4ec] opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 p-6 md:p-10">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 size-10 md:size-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-white to-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.8)] flex items-center justify-center text-soil-dark hover:text-red-500 transition-all active:shadow-inner active:scale-95"
                            >
                                <span className="material-symbols-outlined font-bold text-lg md:text-xl">close</span>
                            </button>

                            {/* Header */}
                            <div className="flex flex-col items-center text-center mb-6 md:mb-8">
                                <div className="size-14 md:size-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary to-[#4d8f43] shadow-floating flex items-center justify-center text-white mb-4 md:mb-6">
                                    <span className="material-symbols-outlined text-2xl md:text-4xl">translate</span>
                                </div>
                                <h2 className="text-xl md:text-4xl font-extrabold text-primary-dark tracking-tight">View More Languages</h2>
                                <p className="text-soil-dark font-medium mt-2 text-xs md:text-base">Select your preferred regional language for Miraitu</p>
                            </div>

                            {/* Language Grid - No scrolling */}
                            <div className="mb-6 md:mb-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
                                    {allLanguages.map((lang) => {
                                        const isSelected = selectedLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => setSelectedLang(lang.code)}
                                                className={`
                                                    relative h-20 md:h-28 rounded-xl md:rounded-[2rem] p-2 md:p-4 flex flex-col items-center justify-center border-2 transition-all
                                                    ${isSelected
                                                        ? 'bg-white border-[#4d8f43] shadow-none'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-transparent shadow-[4px_4px_8px_rgba(166,164,156,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-xl'}
                                                `}
                                            >
                                                <p className="text-lg md:text-2xl font-extrabold text-primary-dark mb-0.5 md:mb-1">{lang.name}</p>
                                                <p className="text-[9px] md:text-xs uppercase tracking-wider font-bold text-soil-dark/50">{lang.sub}</p>

                                                {isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 size-4 md:size-6 bg-[#4d8f43] rounded-full flex items-center justify-center shadow-md">
                                                        <span className="material-symbols-outlined text-[10px] md:text-sm text-white font-black">check</span>
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
                                    onClick={saveSelection}
                                    className="w-full md:w-80 h-12 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-b from-[#4d8f43] to-primary text-white font-black text-base md:text-xl flex items-center justify-center gap-2 md:gap-3 shadow-[0_5px_0_#1a3617,_0_10px_14px_rgba(44,89,38,0.4)] active:shadow-[0_2px_0_#1a3617,_0_5px_10px_rgba(44,89,38,0.4)] active:translate-y-1 transition-all"
                                >
                                    <span className="material-symbols-outlined font-black text-lg md:text-2xl">done_all</span>
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
