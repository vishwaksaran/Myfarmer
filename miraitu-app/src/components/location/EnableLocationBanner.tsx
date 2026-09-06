'use client';

import { useAppLocation } from '@/context/LocationContext';

/**
 * Why the listings above carry no "km away", and what to do about it.
 *
 * Distance needs two coordinates: the ad's (stamped from the seller's device
 * when they posted) and the viewer's. Without the second, every card silently
 * dropped its distance line and nothing on screen said why — the boards looked
 * as though they had simply forgotten to show it.
 *
 * The three states are genuinely different actions, so they get different copy:
 *   • blocked  — the browser will not prompt again; only its settings can undo
 *                this, so a button that re-asks would do nothing.
 *   • typed    — a hand-entered place has no coordinates at all (see
 *                LocationContext.setManualLocation), so GPS is the only fix.
 *   • not set  — the ordinary case; one tap runs the permission flow.
 *
 * Renders nothing once a usable position exists, which is the common case.
 */
export default function EnableLocationBanner() {
    const { location, loading, ready, permission, error, requestLocation } = useAppLocation();

    const hasCoords = !!location && !!location.lat && !!location.lng;
    // Waiting on the first resolution: showing "turn on location" for a moment
    // before a stored one loads would be a flash of wrong advice.
    if (hasCoords || !ready) return null;

    const blocked = permission === 'denied';
    const typedByHand = !!location && location.source === 'manual';

    const headline = blocked
        ? 'Location is blocked for this site'
        : typedByHand
            ? 'Distances need GPS, not a typed place'
            : 'Turn on location to see how far each listing is';

    const detail = blocked
        ? 'Your browser is refusing location for Miraitu, so we cannot work out how far these listings are. Open the padlock in the address bar, set Location to Allow, then reload this page.'
        : typedByHand
            ? `You set your location to "${location?.address}" by hand, which gives us a name but no coordinates. Switch on GPS and every listing below will show how far away it is.`
            : 'Each listing carries the seller\'s coordinates. Share yours and every card will show the distance to it — so you can tell a neighbour\'s animal from one three districts away.';

    return (
        <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">
                    {blocked ? 'location_disabled' : 'location_searching'}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200">{headline}</p>
                    <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{detail}</p>

                    {/* The context's own message — "could not get a GPS fix",
                        "unavailable on this device" — says more than a retry
                        button can, so it is shown rather than swallowed. */}
                    {error && !blocked && (
                        <p className="mt-2 text-xs font-medium text-amber-900 dark:text-amber-200">{error}</p>
                    )}

                    {!blocked && (
                        <button
                            onClick={() => { void requestLocation(); }}
                            disabled={loading}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">my_location</span>
                            {loading ? 'Getting your location…' : 'Use my location'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
