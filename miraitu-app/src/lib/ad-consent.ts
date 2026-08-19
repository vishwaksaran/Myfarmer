/**
 * Advertising consent, stored per device.
 *
 * Scope: India (DPDP Act 2023). The Act wants a clear, plain-language notice
 * and an affirmative action before personal data is processed for advertising,
 * and it wants withdrawal to be as easy as granting — hence the settings entry
 * point that calls clearAdConsent().
 *
 * This is NOT an IAB TCF consent string and must not be reused for EEA/UK
 * traffic. Google requires a *certified* CMP there; a hand-rolled banner like
 * this one is non-compliant for those users no matter how correct its logic.
 * If Miraitu starts serving Europe, replace this module with a certified CMP
 * rather than extending it.
 *
 * Storage mirrors the weather-location consent idiom in weather-location.ts:
 * a versioned localStorage key, SSR-guarded accessors, unknown values treated
 * as "no decision yet".
 */

export type AdConsent = 'granted' | 'denied';

export const AD_CONSENT_KEY = 'miraitu.ads.consent-v1';

/** Fired on the window when consent changes, so already-mounted ad code can react. */
export const AD_CONSENT_EVENT = 'miraitu:ad-consent-change';

/**
 * Returns null when the user has not decided yet — the banner shows only for
 * null, never for an explicit 'denied'.
 */
export const getAdConsent = (): AdConsent | null => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = (window.localStorage.getItem(AD_CONSENT_KEY) || '').trim();
        if (raw === 'granted' || raw === 'denied') return raw;
        return null;
    } catch {
        // Private-mode / blocked storage: treat as undecided rather than throwing.
        return null;
    }
};

export const setAdConsent = (value: AdConsent): void => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(AD_CONSENT_KEY, value);
    } catch {
        // Storage unavailable — the choice applies to this page view only.
    }

    window.dispatchEvent(new CustomEvent(AD_CONSENT_EVENT, { detail: value }));
};

/**
 * Withdraw consent and return to the undecided state, which brings the banner
 * back on the next ad-eligible page. DPDP requires withdrawal to be as easy as
 * giving consent, so this is wired to a settings control, not buried.
 */
export const clearAdConsent = (): void => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.removeItem(AD_CONSENT_KEY);
    } catch {
        // Nothing to clear if storage is unavailable.
    }

    window.dispatchEvent(new CustomEvent(AD_CONSENT_EVENT, { detail: null }));
};

/**
 * Whether ads may be personalised.
 *
 * Only an explicit 'granted' allows personalisation. Both 'denied' and the
 * undecided state fall back to non-personalised ads, which is the same model
 * Google's own consent flow uses: declining does not remove advertising, it
 * removes the profiling behind it.
 */
export const allowsPersonalizedAds = (consent: AdConsent | null): boolean => consent === 'granted';
