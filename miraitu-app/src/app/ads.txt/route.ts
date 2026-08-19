import { ADSENSE_CLIENT_ID } from '@/lib/ads-config';

/**
 * Serves /ads.txt — the IAB authorised-sellers file AdSense checks.
 *
 * Generated from NEXT_PUBLIC_ADSENSE_CLIENT_ID rather than committed as a
 * static file in public/, for two reasons: the publisher ID stays out of the
 * repo, and the file cannot drift out of sync with the ID the ad tags actually
 * use. A mismatch between ads.txt and the live tag is the usual cause of the
 * "Earnings at risk" banner in the AdSense dashboard.
 *
 * Note the ID transformation: the ad tag wants "ca-pub-123…", ads.txt wants
 * "pub-123…" without the "ca-" prefix. Getting this wrong is silent — the file
 * serves fine and AdSense still reports the site as unauthorised.
 *
 * f08c47fec0942fa0 is Google's fixed certification authority ID, identical for
 * every AdSense publisher. It is not a secret and not account-specific.
 */

const GOOGLE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0';

export const dynamic = 'force-static';

export function GET(): Response {
    // No publisher ID configured yet: 404 rather than serving a malformed file.
    // An ads.txt containing a placeholder is worse than none — crawlers cache
    // it, and an invalid entry can mark legitimate inventory as unauthorised.
    if (!ADSENSE_CLIENT_ID.startsWith('ca-pub-')) {
        return new Response('Not found', { status: 404 });
    }

    const publisherId = ADSENSE_CLIENT_ID.replace(/^ca-/, '');
    const body = `google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`;

    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            // Crawlers re-read this rarely; a day is long enough to be cheap and
            // short enough that adding a network partner propagates quickly.
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
