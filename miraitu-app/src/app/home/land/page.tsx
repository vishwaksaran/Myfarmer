import LandFeed from '@/components/land/LandFeed';

/**
 * /home/land — the listings themselves, not a menu in front of them.
 *
 * The old Buy / Sell / Lease card hub is gone: browsing is the default view,
 * and the two posting actions live in the floating "+" inside LandFeed.
 */
export default function LandPage() {
    return <LandFeed />;
}
