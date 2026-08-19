import { ADS_ENABLED } from '@/lib/feature-flags';

/**
 * AdSense publisher configuration and the route policy that decides where ads
 * may appear.
 *
 * Two rules govern everything here:
 *
 *   1. Allowlist, not denylist. A page shows ads only if its path matches
 *      AD_ALLOWED_PREFIXES. Every route added to the app in future is ad-free
 *      by default, which is the safe direction to fail — a new checkout step
 *      cannot accidentally inherit ads.
 *   2. The blocklist still wins. Some ad-allowed sections contain
 *      transaction-sensitive subtrees (/marketplace/../sell, the carts under
 *      /home/machinery). Those are listed explicitly and override the allow.
 */

/**
 * Publisher ID, e.g. "ca-pub-1234567890123456". Read from the environment so
 * the ID is not committed and so preview deploys can run without one.
 *
 * NEXT_PUBLIC_ is required: the AdSense script tag and every ad slot need this
 * value in the browser.
 */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? '';

/**
 * The single source of truth for "should any ads code do anything at all".
 * Both the flag and the publisher ID must be present — see ADS_ENABLED.
 */
export const adsConfigured = (): boolean => ADS_ENABLED && ADSENSE_CLIENT_ID.startsWith('ca-pub-');

/**
 * Sections where ads are permitted.
 *
 * NOTE ON PATHS: the app has two parallel trees for the same categories —
 * /home/livestock and /marketplace/livestock both exist, likewise machinery.
 * Both are listed. If one tree is retired, delete its prefixes here rather
 * than leaving a dead entry that silently covers nothing.
 *
 * There is deliberately no /articles entry: that section does not exist yet.
 * Add it here when it ships — content pages are the intended high-density
 * surface, and the marketplace prefixes below should stay low-density.
 */
export const AD_ALLOWED_PREFIXES: readonly string[] = [
    '/marketplace',
    '/home/livestock',
    '/home/machinery',
    '/home/crops',
    '/home/land',
    '/home/community',
];

/**
 * Paths that never show ads, even inside an allowed section.
 *
 * Three categories, all for the same reason — an ad next to a money decision
 * is both an AdSense policy risk and a trust problem for a marketplace:
 *   - listing creation (every "sell" route and the seller onboarding)
 *   - carts, checkout, wishlist
 *   - auth, admin, dashboards, settings, onboarding
 *
 * Matching is by prefix, so '/home/crops/sell' also covers '/home/crops/sell/list'.
 */
export const AD_BLOCKED_PREFIXES: readonly string[] = [
    // Listing creation / seller onboarding
    '/home/become-seller',
    '/home/buy-sell',
    '/home/crops/sell',
    '/home/land/sell',
    '/home/machinery/drones/sell',
    '/home/machinery/harvesters/sell',
    '/home/machinery/implements/sell',
    '/home/machinery/jcb/sell',
    '/home/machinery/small-machineries/sell',
    '/home/machinery/tractors/sell',

    // Money in flight
    '/home/machinery/cart',
    '/home/machinery/bookings',
    '/home/services/cart',
    '/home/shop/checkout',
    '/home/shop/wishlist',

    // Account, auth and staff surfaces
    '/admin',
    '/admin-login',
    '/auth',
    '/dashboard',
    '/home/dashboard',
    '/language-selection',
    '/onboarding',
    '/settings',
    '/tasks',
    '/user-login',
    '/user-register',
    '/vendor',
];

const matchesPrefix = (pathname: string, prefix: string): boolean =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Whether the given pathname may render ads. Blocklist is evaluated after the
 * allowlist so a blocked subtree inside an allowed section stays ad-free.
 */
export const isAdAllowedPath = (pathname: string): boolean => {
    if (!pathname) return false;

    // Normalise a trailing slash so '/marketplace/' behaves like '/marketplace'.
    const path = pathname.length > 1 && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;

    if (AD_BLOCKED_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) return false;
    return AD_ALLOWED_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
};

/**
 * Ad slot IDs, created in the AdSense dashboard and pasted here.
 *
 * Keyed by placement rather than by page so the same slot can be reused across
 * a section — AdSense reports per slot, so one slot per placement type is what
 * makes the Phase 3/4 revenue comparison readable.
 *
 * Empty string means "not created yet"; AdUnit renders nothing for an empty
 * slot rather than an empty bordered box.
 */
export const AD_SLOTS = {
    /** Below the first screenful of a listing index. */
    listingInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING_INLINE ?? '',
    /** Between content blocks on an article or guide. */
    contentInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_INLINE ?? '',
    /** Sidebar rail on desktop-width category pages. */
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '',
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;
