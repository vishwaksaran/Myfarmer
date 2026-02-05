'use client';

import MiraituLogo from '@/components/MiraituLogo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1a3617] text-white">
            <div className="mx-auto max-w-[1280px] px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <MiraituLogo size={40} />
                            <h2 className="text-2xl font-bold tracking-tight text-white">Miraitu</h2>
                        </div>
                        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                            Redefining agricultural super-app experience with precision tools, real-time marketplace, and connected community.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-lg">forum</span>
                            </a>
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                            </a>
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-lg">play_circle</span>
                            </a>
                        </div>
                    </div>

                    {/* Marketplace Section */}
                    <div>
                        <h3 className="text-lg font-black mb-4">Marketplace</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Livestock Trading
                                </a>
                            </li>
                            <li>
                                <a href="/v2/fencing" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Fencing & Infrastructure
                                </a>
                            </li>
                            <li>
                                <a href="/v2/organic-store" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Organic Store
                                </a>
                            </li>
                            <li>
                                <a href="/v2/protection" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Protection Services
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Community */}
                    <div>
                        <h3 className="text-lg font-black mb-4">Support & Community</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Farmer Forum
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Success Stories
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    Training Videos
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect With Us */}
                    <div>
                        <h3 className="text-lg font-black mb-4">Connect With Us</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-accent">call</span>
                                <div>
                                    <p className="font-bold text-accent mb-1">Farmer Helpline</p>
                                    <p className="text-gray-300">1800-XXX-XXXX</p>
                                    <p className="text-xs text-gray-400">Toll-Free (24x7)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-accent">location_on</span>
                                <div>
                                    <p className="font-bold mb-1">Head Office</p>
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                        Agricultural Innovation Hub<br />
                                        Bangalore, Karnataka
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal & Safety Section */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Secure Transaction FAQs</a>
                            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
                        </div>
                        <p className="text-xs text-gray-400">
                            © {currentYear} Miraitu. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm text-green-400">verified</span>
                        <span>Secure & Encrypted Transactions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
