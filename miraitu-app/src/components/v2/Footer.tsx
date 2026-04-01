'use client';

import MiraituLogo from '@/components/MiraituLogo';
import { useLanguage } from '@/i18n/LanguageContext';
import Script from 'next/script';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

    return (
        <footer className="bg-gradient-to-b from-[#1a3617] to-[#0d1f0b] text-white relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(218,165,32,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(44,89,38,0.3) 0%, transparent 50%)' }}></div>

            <div className="mx-auto max-w-[1400px] px-6 py-14 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <MiraituLogo size={40} />
                            <h2 className="text-2xl font-black tracking-tight text-white">Miraitu</h2>
                        </div>
                        <p className="text-sm text-gray-300/80 mb-6 leading-relaxed">
                            {t('footer.description')}
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-2">
                            {[
                                { label: 'Instagram', hover: 'hover:bg-[#E1306C]', link: 'https://www.instagram.com/miraituapp?igsh=MWRnMGV2OG9pYWljaw==', svg: <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
                                { label: 'X', hover: 'hover:bg-black', link: 'https://x.com/Miraitu', svg: <svg className="size-3.5 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                                { label: 'Facebook', hover: 'hover:bg-[#1877F2]', link: 'https://www.facebook.com/share/17xh4f5AUZ/', svg: <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
                                { label: 'YouTube', hover: 'hover:bg-[#FF0000]', link: 'https://www.youtube.com/@Miraitu', svg: <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
                                { label: 'LinkedIn', hover: 'hover:bg-[#0A66C2]', link: 'https://www.linkedin.com/company/miraitu', svg: <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                            ].map((social, i) => (
                                <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={`size-9 rounded-xl bg-white/10 ${social.hover} flex items-center justify-center transition-all hover:scale-110 active:scale-95`}>
                                    {social.svg}
                                </a>
                            ))}
                        </div>

                        {/* Download the App */}
                        <div className="mt-6">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('footer.downloadApp')}</h4>
                            <div className="flex flex-col gap-2">
                                <a href="/home/about" className="flex items-center gap-3 rounded-xl bg-white/8 hover:bg-white/15 px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/5">
                                    <svg className="size-5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.608-2.302 2.608-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                                    <div>
                                        <p className="text-[9px] text-gray-400 leading-tight">{t('footer.getItOn')}</p>
                                        <p className="text-xs font-bold text-white leading-tight">{t('footer.googlePlay')}</p>
                                    </div>
                                </a>
                                <a href="/home/about" className="flex items-center gap-3 rounded-xl bg-white/8 hover:bg-white/15 px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/5">
                                    <svg className="size-5 fill-white shrink-0" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                    <div>
                                        <p className="text-[9px] text-gray-400 leading-tight">{t('footer.downloadOn')}</p>
                                        <p className="text-xs font-bold text-white leading-tight">{t('footer.appStoreLabel')}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Marketplace Section */}
                    <div>
                        <h3 className="text-lg font-black mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-accent rounded-full"></span>
                            {t('footer.marketplace')}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/home/livestock" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.livestockTrading')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/fencing" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.fencing')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/organic-store" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.organicStore')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/protection" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.protection')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Community */}
                    <div>
                        <h3 className="text-lg font-black mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-accent rounded-full"></span>
                            {t('footer.support')}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/home/about" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.helpCenter')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/community" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.farmerForum')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/community" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.successStories')}
                                </a>
                            </li>
                            <li>
                                <a href="/home/community" className="text-gray-300/80 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xs text-accent/50 group-hover:text-accent transition-colors">chevron_right</span>
                                    {t('footer.trainingVideos')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect With Us */}
                    <div>
                        <h3 className="text-lg font-black mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-accent rounded-full"></span>
                            {t('footer.connectWithUs')}
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="size-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-accent text-lg">call</span>
                                </div>
                                <div>
                                    <p className="font-bold text-accent text-xs mb-0.5">{t('footer.farmerHelpline')}</p>
                                    <p className="text-gray-200 font-semibold">+91 - 8553498691</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{t('footer.tollFree')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="size-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-accent text-lg">location_on</span>
                                </div>
                                <div>
                                    <p className="font-bold text-xs mb-0.5">{t('footer.headOffice')}</p>
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                        No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka 560100
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Legal & Safety Section */}
                <div className="border-t border-white/10 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
                            <a href="/home/terms-of-service" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                            <a href="/home/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                            <a href="/home/about" className="hover:text-white transition-colors">{t('footer.secureFaq')}</a>
                            <a href="/home/about" className="hover:text-white transition-colors">{t('footer.refund')}</a>
                            <a href="https://www.dmca.com/r/x8z5rk9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">shield</span>
                                DMCA Protected
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.dmca.com/r/x8z5rk9"
                                title="DMCA.com Protection Status"
                                className="dmca-badge"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://images.dmca.com/Badges/dmca_protected_sml_120am.png?ID=x8z5rk9"
                                    alt="DMCA.com Protection Status"
                                    className="h-6"
                                />
                            </a>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-bold border border-white/5">
                                <span className="material-symbols-outlined text-xs text-green-400">verified</span>
                                <span>{t('footer.secureBadge')}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                © {currentYear} Miraitu. {t('footer.rights')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js" strategy="lazyOnload" />
        </footer>
    );
}
