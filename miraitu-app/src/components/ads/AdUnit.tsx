'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { AD_SLOTS, ADSENSE_CLIENT_ID, adsConfigured, isAdAllowedPath, type AdSlotName } from '@/lib/ads-config';
import { AD_CONSENT_EVENT, allowsPersonalizedAds, getAdConsent } from '@/lib/ad-consent';

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

/**
 * Ad formats and the height each one reserves.
 *
 * The reserved height is the whole point of this component. AdSense injects an
 * iframe after hydration, so a slot with no height collapses to 0 and then
 * jumps — which is a Cumulative Layout Shift on every ad-bearing page. Fixing
 * that later means re-measuring every placement, so the height is committed
 * here from the first render and the ad fills a box that already exists.
 *
 * Heights are the AdSense responsive minimums for each format plus the label
 * row. If a format is changed in the dashboard, change it here too or the
 * reservation silently stops matching.
 */
const AD_FORMATS = {
    /** Full-width horizontal banner, the default in-feed placement. */
    horizontal: { format: 'auto', reservedHeight: 300, className: 'w-full' },
    /** Fixed rectangle for sidebar rails; does not grow on wide screens. */
    rectangle: { format: 'rectangle', reservedHeight: 280, className: 'w-full max-w-[336px]' },
} as const;

type AdFormatName = keyof typeof AD_FORMATS;

interface AdUnitProps {
    /** Which configured slot to render. An unconfigured slot renders nothing. */
    readonly slot: AdSlotName;
    readonly format?: AdFormatName;
    /** Extra classes for the outer wrapper — use for section spacing, not sizing. */
    readonly className?: string;
}

/**
 * A single AdSense slot.
 *
 * Renders nothing at all unless every condition holds: the ads layer is
 * configured, the current path is ad-eligible, and the slot ID exists. That
 * keeps ad policy in one place — a page can drop <AdUnit /> in without
 * repeating the route checks.
 */
export default function AdUnit({ slot, format = 'horizontal', className = '' }: AdUnitProps) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const insRef = useRef<HTMLModElement | null>(null);
    const pushedRef = useRef(false);
    const [personalized, setPersonalized] = useState(false);

    const slotId = AD_SLOTS[slot];
    const { format: adFormat, reservedHeight, className: sizeClass } = AD_FORMATS[format];
    const eligible = adsConfigured() && isAdAllowedPath(pathname ?? '') && slotId !== '';

    // Consent is read after mount, never during render: reading localStorage in
    // render would produce different server and client output and break hydration.
    useEffect(() => {
        const sync = () => setPersonalized(allowsPersonalizedAds(getAdConsent()));
        sync();

        window.addEventListener(AD_CONSENT_EVENT, sync);
        return () => window.removeEventListener(AD_CONSENT_EVENT, sync);
    }, []);

    useEffect(() => {
        if (!eligible || pushedRef.current || !insRef.current) return;

        // One push per <ins> for the lifetime of the element. React 18+ mounts
        // effects twice in development, and pushing the same slot twice makes
        // AdSense log "All ins elements already have ads in them" and drop the
        // second fill.
        pushedRef.current = true;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // Blocked by an ad blocker or the script never loaded. The reserved
            // box stays empty; nothing else in the page is affected.
        }
    }, [eligible]);

    if (!eligible) return null;

    return (
        <div
            className={`my-6 flex flex-col items-center ${className}`}
            // Reserved before the iframe arrives, so the fill causes no shift.
            style={{ minHeight: reservedHeight }}
        >
            {/*
              Required label. AdSense policy is that ads must not be presented as
              site content — "Advertisement" (or a translation) is the accepted
              wording, and it must not be styled to disappear.
            */}
            <span className="mb-1 text-[10px] uppercase tracking-widest text-gray-400 select-none">
                {t('ads.label')}
            </span>

            {/*
              pt-1 plus the my-6 above keeps a gap between the ad and whatever
              sits next to it. Ads immediately adjacent to buttons or cards
              generate accidental clicks, which is the fastest route to an
              invalid-traffic strike on the account.
            */}
            <ins
                ref={insRef}
                className={`adsbygoogle block ${sizeClass}`}
                style={{ display: 'block', minHeight: reservedHeight - 20 }}
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={slotId}
                data-ad-format={adFormat}
                data-full-width-responsive="true"
                // '1' asks Google for non-personalised ads. Set whenever consent
                // is absent or withdrawn — see allowsPersonalizedAds().
                {...(personalized ? {} : { 'data-npa': '1' })}
            />
        </div>
    );
}
