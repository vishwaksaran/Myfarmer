'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// State-wise farmer registration portal URLs
const farmerRegPortals: Record<string, string> = {
    'Andhra Pradesh': 'https://www.apagrisnet.gov.in/',
    'Arunachal Pradesh': 'https://agricoop.nic.in/',
    'Assam': 'https://diaboroagri.assam.gov.in/',
    'Bihar': 'https://dbtagriculture.bihar.gov.in/',
    'Chhattisgarh': 'https://agriportal.cg.nic.in/',
    'Goa': 'https://agri.goa.gov.in/',
    'Gujarat': 'https://ikhedut.gujarat.gov.in/',
    'Haryana': 'https://agriharyana.gov.in/',
    'Himachal Pradesh': 'https://eudyan.hp.gov.in/',
    'Jharkhand': 'https://jharkhand.gov.in/agriculture',
    'Karnataka': 'https://raitamitra.karnataka.gov.in/',
    'Kerala': 'https://aims.kerala.gov.in/',
    'Madhya Pradesh': 'https://mpfsts.mp.gov.in/',
    'Maharashtra': 'https://mahadbt.maharashtra.gov.in/',
    'Manipur': 'https://agrimanipur.gov.in/',
    'Meghalaya': 'https://megagriculture.gov.in/',
    'Mizoram': 'https://agriculturemizoram.nic.in/',
    'Nagaland': 'https://agringl.nic.in/',
    'Odisha': 'https://agriodisha.nic.in/',
    'Punjab': 'https://agripb.gov.in/',
    'Rajasthan': 'https://agriculture.rajasthan.gov.in/',
    'Sikkim': 'https://sikkim.gov.in/departments/food-security-and-agriculture-development-department',
    'Tamil Nadu': 'https://www.tn.gov.in/department/2',
    'Telangana': 'https://agri.telangana.gov.in/',
    'Tripura': 'https://agri.tripura.gov.in/',
    'Uttar Pradesh': 'https://upagriculture.com/',
    'Uttarakhand': 'https://agriculture.uk.gov.in/',
    'West Bengal': 'https://matirkatha.net/'
};

// State-wise government schemes portal URLs
const govSchemePortals: Record<string, string> = {
    'Andhra Pradesh': 'https://navasakam.ap.gov.in/',
    'Arunachal Pradesh': 'https://www.myscheme.gov.in/',
    'Assam': 'https://directorateofagriculture.assam.gov.in/',
    'Bihar': 'https://dbtagriculture.bihar.gov.in/',
    'Chhattisgarh': 'https://kisan.cg.nic.in/',
    'Goa': 'https://www.myscheme.gov.in/',
    'Gujarat': 'https://ikhedut.gujarat.gov.in/',
    'Haryana': 'https://www.haryana.gov.in/scheme-category/agriculture/',
    'Himachal Pradesh': 'https://www.myscheme.gov.in/',
    'Jharkhand': 'https://www.myscheme.gov.in/',
    'Karnataka': 'https://raitamitra.karnataka.gov.in/',
    'Kerala': 'https://www.kisan.gov.in/',
    'Madhya Pradesh': 'https://mpfsts.mp.gov.in/',
    'Maharashtra': 'https://mahadbt.maharashtra.gov.in/',
    'Manipur': 'https://www.myscheme.gov.in/',
    'Meghalaya': 'https://www.myscheme.gov.in/',
    'Mizoram': 'https://www.myscheme.gov.in/',
    'Nagaland': 'https://www.myscheme.gov.in/',
    'Odisha': 'https://kalia.odisha.gov.in/',
    'Punjab': 'https://agripb.gov.in/',
    'Rajasthan': 'https://rajkisan.rajasthan.gov.in/',
    'Sikkim': 'https://www.myscheme.gov.in/',
    'Tamil Nadu': 'https://www.tn.gov.in/scheme/agriculture',
    'Telangana': 'https://rythubandhu.telangana.gov.in/',
    'Tripura': 'https://www.myscheme.gov.in/',
    'Uttar Pradesh': 'https://upagriculture.com/',
    'Uttarakhand': 'https://agriculture.uk.gov.in/',
    'West Bengal': 'https://krishakbandhu.net/'
};

export default function FarmerServicesGrid() {
    const { t } = useLanguage();
    const [farmerRegState, setFarmerRegState] = useState('');
    const [govSchemeState, setGovSchemeState] = useState('');

    return (
        <section className="px-4 md:px-6 py-6">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0f1a11] dark:text-white mb-3">
                        {t('farmerServices.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        {t('farmerServices.subtitle')}
                    </p>
                </div>

                {/* Grid of Service Cards */}
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {/* Farmer Registration Card */}
                    <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-4 md:p-8 shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6 mb-4 md:mb-6">
                                <div className="shrink-0">
                                    <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[1.25rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                        <span className="material-symbols-outlined text-white text-2xl md:text-5xl">badge</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm md:text-2xl font-black text-white mb-1 md:mb-2">
                                        {t('farmerServices.regCard')}
                                    </h3>
                                    <p className="text-white/80 text-[11px] md:text-base leading-relaxed">
                                        {t('farmerServices.regCardDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:gap-3">
                                <select
                                    value={farmerRegState}
                                    onChange={(e) => setFarmerRegState(e.target.value)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                >
                                    <option value="" className="text-gray-800">{t('farmerServices.selectState')}</option>
                                    {indianStates.map(state => (
                                        <option key={state} value={state} className="text-gray-800">{state}</option>
                                    ))}
                                </select>
                                <a
                                    href={farmerRegState ? farmerRegPortals[farmerRegState] : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => { if (!farmerRegState) e.preventDefault(); }}
                                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-white text-[#1a5c2e] font-black text-xs md:text-sm transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap ${!farmerRegState ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">open_in_new</span>
                                    {t('farmerServices.portal')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* My Government Schemes */}
                    <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-4 md:p-8 shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-6 mb-4 md:mb-6">
                                <div className="shrink-0">
                                    <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[1.25rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                        <span className="material-symbols-outlined text-white text-2xl md:text-5xl">account_balance</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm md:text-2xl font-black text-white mb-1 md:mb-2">
                                        {t('farmerServices.govSchemes')}
                                    </h3>
                                    <p className="text-white/80 text-[11px] md:text-base leading-relaxed">
                                        {t('farmerServices.govSchemesDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:gap-3">
                                <select
                                    value={govSchemeState}
                                    onChange={(e) => setGovSchemeState(e.target.value)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                >
                                    <option value="" className="text-gray-800">{t('farmerServices.selectState')}</option>
                                    {indianStates.map(state => (
                                        <option key={state} value={state} className="text-gray-800">{state}</option>
                                    ))}
                                </select>
                                <a
                                    href={govSchemeState ? govSchemePortals[govSchemeState] : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => { if (!govSchemeState) e.preventDefault(); }}
                                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-white text-[#1a5c2e] font-black text-xs md:text-sm transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap ${!govSchemeState ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">open_in_new</span>
                                    {t('farmerServices.portal')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Kisan Credit Card (KCC) */}
                    <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-4 md:p-8 shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start gap-3 md:gap-6">
                            <div className="shrink-0">
                                <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[1.25rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                    <span className="material-symbols-outlined text-white text-2xl md:text-5xl">credit_card</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm md:text-2xl font-black text-white mb-1 md:mb-2">
                                    {t('farmerServices.kcc')}
                                </h3>
                                <p className="text-white/80 text-[11px] md:text-base leading-relaxed mb-3 md:mb-4">
                                    {t('farmerServices.kccDesc')}
                                </p>

                                <a
                                    href="https://www.myscheme.gov.in/schemes/kcc"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-white text-[#1a5c2e] font-black text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">verified_user</span>
                                    <span className="hidden md:inline">{t('farmerServices.checkEligibility')}</span>
                                    <span className="md:hidden">{t('farmerServices.apply')}</span>
                                    <span className="material-symbols-outlined text-base md:text-lg">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Become a Dealer/Seller */}
                    <Link
                        href="/home/become-seller"
                        className="group relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-4 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start gap-3 md:gap-6">
                            <div className="shrink-0">
                                <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[1.25rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-2xl md:text-5xl">storefront</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm md:text-2xl font-black text-white mb-1 md:mb-2 group-hover:translate-x-1 transition-transform">
                                    {t('farmerServices.becomeDealer')}
                                </h3>
                                <p className="text-white/80 text-[11px] md:text-base leading-relaxed mb-3 md:mb-4">
                                    {t('farmerServices.becomeDealerDesc')}
                                </p>

                                <div className="flex items-center gap-2 text-white font-bold text-xs md:text-sm">
                                    <span>{t('farmerServices.learnMore')}</span>
                                    <span className="material-symbols-outlined text-base md:text-lg group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
