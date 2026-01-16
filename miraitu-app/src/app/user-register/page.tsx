'use client';

import Link from 'next/link';
import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

/**
 * UserRegisterPage - Multi-step registration form
 */
export default function UserRegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        farmLocation: '',
        termsAccepted: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement registration logic
        console.log('Registration data:', formData);
    };

    return (
        <div className="min-h-screen bg-[var(--miraitu-background-light)] font-display text-[#0f1a11]">
            {/* Navigation Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--miraitu-primary-green)]/10 bg-white/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                    <MiraituLogo size={40} />
                    <h2 className="text-[#0f1a11] text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                </Link>
                <div className="flex flex-1 justify-end gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link className="text-[#0f1a11] text-sm font-semibold hover:text-[var(--miraitu-primary-green)] transition-colors" href="/">Home</Link>
                        <Link className="text-[#0f1a11] text-sm font-semibold hover:text-[var(--miraitu-primary-green)] transition-colors" href="#">Marketplace</Link>
                        <Link className="text-[#0f1a11] text-sm font-semibold hover:text-[var(--miraitu-primary-green)] transition-colors" href="#">Weather</Link>
                    </div>
                    <Link
                        href="/user-login"
                        className="flex min-w-[80px] md:min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 border-2 border-[var(--miraitu-primary-green)] text-[var(--miraitu-primary-green)] text-sm font-bold transition-all hover:bg-[var(--miraitu-primary-green)]/5"
                    >
                        <span className="truncate">Log in</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center py-8 md:py-12 px-4">
                {/* Page Heading Section */}
                <div className="max-w-[800px] w-full text-center mb-8 md:mb-10 animate-logo-entrance">
                    <h1 className="text-[#0f1a11] text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-3">
                        Cultivate Your <span className="text-[var(--miraitu-primary-green)]">Digital Garden</span>
                    </h1>
                    <p className="text-[#53935d] text-base md:text-lg font-medium">
                        Join the digital ecosystem designed for modern farmers and stakeholders.
                    </p>
                </div>

                {/* Registration Card */}
                <div className="max-w-[720px] w-full skeuo-card rounded-xl overflow-hidden p-6 md:p-10 relative animate-panel-entrance">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--miraitu-lime-green)]/10 rounded-full blur-3xl -mr-10 -mt-10" />

                    {/* Progress Header */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-[var(--miraitu-primary-green)] text-white text-[10px] font-bold rounded-full">1</span>
                                <p className="text-[#0f1a11] text-sm md:text-base font-bold">Identity & Region</p>
                            </div>
                            <p className="text-[#53935d] text-xs md:text-sm font-bold uppercase tracking-wider">Step 1 of 3</p>
                        </div>
                        <div className="h-2.5 w-full bg-[#e8f2ea] rounded-full overflow-hidden flex">
                            <div className="h-full bg-[var(--miraitu-primary-green)] rounded-full w-1/3 shadow-[0_0_10px_rgba(34,195,61,0.4)]" />
                            <div className="h-full bg-[var(--miraitu-harvest-gold)]/30 w-1/3" />
                            <div className="h-full bg-gray-100 w-1/3" />
                        </div>
                    </div>

                    <form className="flex flex-col gap-6 md:gap-8" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Full Name */}
                            <div className="col-span-1">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#0f1a11] text-xs md:text-sm font-bold uppercase tracking-wide ml-1">Full Name</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">person</span>
                                        <input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400"
                                            placeholder="John Doe"
                                            type="text"
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Mobile Number */}
                            <div className="col-span-1">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#0f1a11] text-xs md:text-sm font-bold uppercase tracking-wide ml-1">Mobile Number</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">call</span>
                                        <input
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all placeholder:text-gray-400"
                                            placeholder="+91 98765 43210"
                                            type="tel"
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Location Select */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#0f1a11] text-xs md:text-sm font-bold uppercase tracking-wide ml-1">Farm Location</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60">distance</span>
                                        <select
                                            name="farmLocation"
                                            value={formData.farmLocation}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--miraitu-primary-green)]/20 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-[#0f1a11] appearance-none cursor-pointer"
                                        >
                                            <option disabled value="">Select your district / region</option>
                                            <option value="north">North Valley Region</option>
                                            <option value="south">Southern Highlands</option>
                                            <option value="east">Eastern Delta Plains</option>
                                            <option value="west">Western Foothills</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Map/Illustration placeholder */}
                        <div className="w-full h-28 md:h-32 rounded-xl bg-[var(--miraitu-primary-green)]/5 border-2 border-dashed border-[var(--miraitu-primary-green)]/20 flex items-center justify-center group cursor-pointer hover:bg-[var(--miraitu-primary-green)]/10 transition-colors">
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-3xl">map</span>
                                <p className="text-xs font-bold text-[var(--miraitu-primary-green)]">Pin your farm on the map</p>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-3 md:gap-4 p-4 rounded-xl bg-[var(--miraitu-lime-green)]/5 border border-[var(--miraitu-lime-green)]/20">
                            <input
                                type="checkbox"
                                id="terms"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleInputChange}
                                className="leaf-checkbox mt-1"
                            />
                            <label className="text-[#0f1a11] text-xs md:text-sm font-medium leading-relaxed cursor-pointer select-none" htmlFor="terms">
                                I agree to the <a className="text-[var(--miraitu-primary-green)] font-bold underline decoration-[var(--miraitu-primary-green)]/30 underline-offset-2" href="#">Terms of Service</a> and <a className="text-[var(--miraitu-primary-green)] font-bold underline decoration-[var(--miraitu-primary-green)]/30 underline-offset-2" href="#">Privacy Policy</a>. I understand that Miraitu uses my location for harvest optimization.
                            </label>
                        </div>

                        {/* CTA Button */}
                        <div className="flex flex-col gap-4 items-center animate-button-entrance">
                            <button
                                type="submit"
                                disabled={!formData.termsAccepted}
                                className="skeuo-button w-full h-14 md:h-16 bg-[var(--miraitu-primary-green)] rounded-xl flex items-center justify-center gap-2 text-white font-extrabold text-base md:text-lg uppercase tracking-widest hover:bg-[#1fb337] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all"
                            >
                                <span className="material-symbols-outlined">eco</span>
                                Register & Start Planting
                            </button>
                            <p className="text-sm text-[#53935d] font-medium">
                                Already have an account?{' '}
                                <Link className="text-[var(--miraitu-primary-green)] font-bold hover:underline" href="/user-login">Log in here</Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer Icons */}
                <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4 md:gap-8 grayscale opacity-50 animate-footer-entrance">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm md:text-base">verified_user</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Secure Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm md:text-base">eco</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Eco-Certified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm md:text-base">support_agent</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">24/7 Expert Support</span>
                    </div>
                </div>
            </main>

            <footer className="py-8 md:py-10 border-t border-[var(--miraitu-primary-green)]/10 bg-white/50 text-center">
                <p className="text-xs md:text-sm text-[#53935d]">© 2026 Miraitu Agriculture Tech. All rights reserved.</p>
            </footer>
        </div>
    );
}
