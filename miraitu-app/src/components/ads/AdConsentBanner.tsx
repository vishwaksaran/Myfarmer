'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { adsConfigured, isAdAllowedPath } from '@/lib/ads-config';
import { AD_CONSENT_EVENT, getAdConsent, setAdConsent } from '@/lib/ad-consent';

/**
 * DPDP-style advertising notice.
 *
 * Shown once per device, and only on a page that is about to show ads — asking
 * for advertising consent on the login screen would be both confusing and
 * pointless, since no ad can render there.
 *
 * Both buttons are equally weighted and equally easy to reach. A "decline"
 * hidden behind a link, or styled to look inert, is exactly the dark pattern
 * DPDP's free-consent requirement is aimed at. Declining is a real choice
 * here: it switches ads to non-personalised rather than removing them, and the
 * copy says so instead of implying the ads go away.
 */
export default function AdConsentBanner() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);

    // Read after mount — localStorage during render would desync hydration.
    useEffect(() => {
        const sync = () => setVisible(getAdConsent() === null);
        sync();

        window.addEventListener(AD_CONSENT_EVENT, sync);
        return () => window.removeEventListener(AD_CONSENT_EVENT, sync);
    }, []);

    if (!adsConfigured()) return null;
    if (!isAdAllowedPath(pathname ?? '')) return null;
    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-label={t('ads.consentTitle')}
            // bottom-20 on mobile clears the bottom nav; ads-consent should never
            // sit on top of the app's primary navigation.
            className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-2xl px-3 sm:bottom-4"
        >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
                <h2 className="mb-1 text-sm font-bold text-[#2c5926]">{t('ads.consentTitle')}</h2>

                <p className="mb-3 text-xs leading-relaxed text-gray-600">
                    {t('ads.consentBody')}{' '}
                    <Link
                        href="/home/privacy-policy"
                        className="font-semibold text-[#2c5926] underline underline-offset-2"
                    >
                        {t('ads.consentPolicyLink')}
                    </Link>
                </p>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setAdConsent('denied')}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        {t('ads.consentDecline')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdConsent('granted')}
                        className="flex-1 rounded-xl bg-[#2c5926] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#24491f]"
                    >
                        {t('ads.consentAccept')}
                    </button>
                </div>
            </div>
        </div>
    );
}
