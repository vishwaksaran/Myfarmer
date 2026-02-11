'use client';

import MiraituLogo from '@/components/MiraituLogo';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

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
                            {t('footer.description')}
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            {/* Instagram */}
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-[#E1306C] flex items-center justify-center transition-colors group">
                                <svg className="size-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            {/* X (Twitter) */}
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-black flex items-center justify-center transition-colors group">
                                <svg className="size-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            {/* Facebook */}
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-colors group">
                                <svg className="size-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center transition-colors group">
                                <svg className="size-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9H12.909v1.632h.048c.495-.938 1.706-1.928 3.509-1.928 3.753 0 4.447 2.47 4.447 5.684v6.064zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="size-10 rounded-lg bg-white/10 hover:bg-[#FF0000] flex items-center justify-center transition-colors group">
                                <svg className="size-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>

                        {/* Download the App */}
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('footer.downloadApp')}</h4>
                            <div className="flex flex-col gap-2">
                                <a href="#" className="flex items-center gap-3 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 transition-colors group">
                                    <svg className="size-6 fill-white shrink-0" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.608-2.302 2.608-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                                    <div>
                                        <p className="text-[10px] text-gray-400 leading-tight">{t('footer.getItOn')}</p>
                                        <p className="text-sm font-bold text-white leading-tight">{t('footer.googlePlay')}</p>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center gap-3 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 transition-colors group">
                                    <svg className="size-6 fill-white shrink-0" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                    <div>
                                        <p className="text-[10px] text-gray-400 leading-tight">{t('footer.downloadOn')}</p>
                                        <p className="text-sm font-bold text-white leading-tight">{t('footer.appStoreLabel')}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Marketplace Section */}
                    <div>
                        <h3 className="text-lg font-black mb-4">{t('footer.marketplace')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.livestockTrading')}
                                </a>
                            </li>
                            <li>
                                <a href="/v2/fencing" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.fencing')}
                                </a>
                            </li>
                            <li>
                                <a href="/v2/organic-store" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.organicStore')}
                                </a>
                            </li>
                            <li>
                                <a href="/v2/protection" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.protection')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Community */}
                    <div>
                        <h3 className="text-lg font-black mb-4">{t('footer.support')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.helpCenter')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.farmerForum')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.successStories')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    {t('footer.trainingVideos')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect With Us */}
                    <div>
                        <h3 className="text-lg font-black mb-4">{t('footer.connectWithUs')}</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-accent">call</span>
                                <div>
                                    <p className="font-bold text-accent mb-1">{t('footer.farmerHelpline')}</p>
                                    <p className="text-gray-300">+91 - 8553498691</p>
                                    <p className="text-xs text-gray-400">{t('footer.tollFree')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-accent">location_on</span>
                                <div>
                                    <p className="font-bold mb-1">{t('footer.headOffice')}</p>
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                        No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka 560100
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
                            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                            <a href="#" className="hover:text-white transition-colors">{t('footer.secureFaq')}</a>
                            <a href="#" className="hover:text-white transition-colors">{t('footer.refund')}</a>
                        </div>
                        <p className="text-xs text-gray-400">
                            © {currentYear} Miraitu. {t('footer.rights')}
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm text-green-400">verified</span>
                        <span>{t('footer.secureBadge')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
