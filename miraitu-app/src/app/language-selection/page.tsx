"use client";

import Link from "next/link";
import { useState } from "react";
import MiraituLogo from "@/components/MiraituLogo";

export default function LanguageSelectionPage() {
    const [selectedLanguage, setSelectedLanguage] = useState("English");

    const languages = [
        { name: "English", native: "English" },
        { name: "Hindi", native: "हिंदी" },
        { name: "Marathi", native: "मराठी" },
        { name: "Gujarati", native: "ગુજરાતી" },
        { name: "Telugu", native: "తెలుగు" },
        { name: "Tamil", native: "தமிழ்" },
        { name: "Kannada", native: "ಕನ್ನಡ" },
        { name: "Punjabi", native: "ਪੰਜਾਬੀ" },
        { name: "Bengali", native: "বাংলা" },
        { name: "Malayalam", native: "മലയാളം" },
    ];

    return (
        <div className="font-display bg-gradient-to-br from-[#f8eecf] via-fresh-cream to-[#f0fdf4] min-h-screen flex flex-col items-center justify-center p-4 text-forest selection:bg-harvest-gold selection:text-forest">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-harvest-gold/20 rounded-full blur-3xl mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl mix-blend-multiply"></div>
            </div>

            {/* Main Container */}
            <main className="relative z-10 w-full max-w-[1024px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft-lift border border-white/50 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Side: Visual / Brand (Desktop Only) */}
                <div className="hidden md:flex md:w-1/3 bg-primary relative flex-col justify-between p-10 overflow-hidden group">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply z-10"></div>
                        <div
                            className="w-full h-full bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
                            data-alt="Close up of green wheat field pattern"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDkIDtyYJotZQWpu65L1VVYkA06u-1WWBKpdqDzLJ5CZuxhBeg-6CMWeCfJH5M2XC9NH7QNreSqvZ5q6KIPlLyHXxB0lBVmLQUAASdVXYhcrdHq7bRNjYdbyRVn7qWDqL3PJdYAys3LVc9v9XsqXmPu0KE_BB-hdq5GIY1vKfa4JJqvXOlMl-N3yb8PLdksPJX-f_v1CO6m70zGY_V-gkS9Jchv0oympTLaisJpou-ihFusdRHFIM7AVwXgJX8W_HBwUSGkQiC6IdDi")',
                            }}
                        ></div>
                    </div>
                    {/* Content */}
                    <div className="relative z-20">
                        <div className="flex items-center gap-3 text-white mb-6">
                            <div className="size-8 bg-harvest-gold rounded-lg flex items-center justify-center text-primary shadow-lg overflow-hidden p-1">
                                <MiraituLogo className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Miraitu</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
                            Empowering <br />
                            <span className="text-harvest-gold">Agriculture</span> Together
                        </h2>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            Join a community of over 2 million farmers accessing real-time market data, weather
                            forecasts, and expert advice.
                        </p>
                    </div>
                    <div className="relative z-20 mt-auto">
                        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            Secure & Private
                        </div>
                    </div>
                </div>

                {/* Right Side: Interaction Area */}
                <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-12 relative bg-fresh-cream/50">
                    {/* Mobile Header (Visible only on small screens) */}
                    <div className="md:hidden flex items-center gap-3 text-forest mb-6">
                        <div className="size-8 text-primary overflow-hidden p-1">
                            <MiraituLogo className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xl font-bold">Miraitu</h2>
                    </div>

                    {/* Header Text */}
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-forest text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                            Select Your Language
                        </h1>
                        <p className="text-forest/60 text-lg font-medium">
                            Choose the language you are most comfortable with
                        </p>
                    </div>

                    {/* Language Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {languages.map((lang) => (
                                <button
                                    key={lang.name}
                                    onClick={() => setSelectedLanguage(lang.name)}
                                    className={`group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer ${selectedLanguage === lang.name
                                            ? "bg-white border-2 border-primary shadow-none translate-y-1 ring-2 ring-primary/20 ring-offset-2"
                                            : "bg-loam border border-[#e2e8e0] shadow-card-idle hover:shadow-card-hover hover:-translate-y-1"
                                        }`}
                                >
                                    <div
                                        className={`absolute top-2 right-2 text-primary transition-all ${selectedLanguage === lang.name ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover:opacity-0"
                                            }`}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            check_circle
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-forest mb-1 font-body">
                                        {lang.native}
                                    </span>
                                    <span
                                        className={`text-sm font-medium transition-colors ${selectedLanguage === lang.name
                                                ? "text-primary/80 font-semibold uppercase tracking-wider"
                                                : "text-forest/50 group-hover:text-primary/70"
                                            }`}
                                    >
                                        {lang.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-8 pt-6 border-t border-forest/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-forest/60 hidden sm:block">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">info</span>
                                You can change this later in settings
                            </span>
                        </div>
                        <Link
                            href="/user-login"
                            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            Continue
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Simple footer outside */}
            <footer className="mt-8 text-center text-forest/40 text-sm font-medium">
                © 2024 Miraitu Agriculture Platform. All rights reserved.
            </footer>
        </div>
    );
}
