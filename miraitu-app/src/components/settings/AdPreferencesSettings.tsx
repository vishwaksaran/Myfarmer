'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { adsConfigured } from '@/lib/ads-config';
import { AD_CONSENT_EVENT, getAdConsent, setAdConsent, type AdConsent } from '@/lib/ad-consent';

/**
 * Ad personalisation control.
 *
 * This exists because the privacy policy promises it. DPDP requires that
 * withdrawing consent be as easy as giving it, so the toggle sits in the main
 * Settings grid alongside notifications rather than behind a legal sub-page.
 *
 * Toggling off writes an explicit 'denied' rather than clearing the key —
 * clearing would read as "undecided" and bring the consent banner back, which
 * would look like the app ignoring a choice the user just made.
 */
export default function AdPreferencesSettings() {
    const { t } = useLanguage();
    const [consent, setConsent] = useState<AdConsent | null>(null);

    // Post-mount read: localStorage is not available during SSR.
    useEffect(() => {
        const sync = () => setConsent(getAdConsent());
        sync();

        window.addEventListener(AD_CONSENT_EVENT, sync);
        return () => window.removeEventListener(AD_CONSENT_EVENT, sync);
    }, []);

    // Hidden entirely while the ads layer is off, so the card does not advertise
    // a setting that controls nothing.
    if (!adsConfigured()) return null;

    const personalized = consent === 'granted';

    return (
        <section className="rounded-3xl bg-white p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">ads_click</span>
                </div>
                <h2 className="text-2xl font-bold text-primary-dark">{t('ads.settingsTitle')}</h2>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fafafa]">
                <div className="pr-4">
                    <p className="font-bold text-primary-dark">{t('ads.settingsTitle')}</p>
                    <p className="text-xs text-gray-500">{t('ads.settingsBody')}</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={personalized}
                    aria-label={t('ads.settingsTitle')}
                    onClick={() => setAdConsent(personalized ? 'denied' : 'granted')}
                    className="glossy-switch relative inline-flex h-8 w-14 shrink-0"
                >
                    <span
                        className={`switch-knob mt-[1px] ml-[1px] ${personalized ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                </button>
            </div>
        </section>
    );
}
