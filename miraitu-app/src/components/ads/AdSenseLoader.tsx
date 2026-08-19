'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ADSENSE_CLIENT_ID, adsConfigured, isAdAllowedPath } from '@/lib/ads-config';
import { AD_CONSENT_EVENT, getAdConsent } from '@/lib/ad-consent';

/**
 * Loads the AdSense library, once, and only where it is actually needed.
 *
 * Mounted from the root layout but deliberately inert on most of the app:
 * the script is injected only on ad-eligible routes and only after the user
 * has made a consent choice. A farmer who opens the app, logs in and posts a
 * listing never downloads it.
 *
 * Loading strategy is "lazyOnload" on purpose. AdSense's own guidance is to
 * put the tag in <head>, which maximises fill but puts a third-party script on
 * the critical path of a page whose LCP is a listing image. Deferring until
 * after load keeps first render owned by the app. The trade is slightly later
 * ad rendering; the reserved boxes in AdUnit mean that costs no layout shift.
 * If Phase 4 shows the delay hurting revenue, "afterInteractive" is the dial
 * to turn — measure before changing it.
 */
export default function AdSenseLoader() {
    const pathname = usePathname();
    const [decided, setDecided] = useState(false);

    useEffect(() => {
        const sync = () => setDecided(getAdConsent() !== null);
        sync();

        window.addEventListener(AD_CONSENT_EVENT, sync);
        return () => window.removeEventListener(AD_CONSENT_EVENT, sync);
    }, []);

    if (!adsConfigured()) return null;
    if (!isAdAllowedPath(pathname ?? '')) return null;
    if (!decided) return null;

    return (
        <Script
            id="adsbygoogle-init"
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        />
    );
}
