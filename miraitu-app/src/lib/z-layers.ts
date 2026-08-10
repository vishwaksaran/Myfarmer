/**
 * App-wide stacking order.
 *
 * Overlays are portaled to `document.body`, so their z-index values compete in a
 * single root stacking context — which is why these must be picked from one list
 * rather than invented per component. The login modal sitting *behind* the land
 * lease detail modal was exactly this: an inline `z-[100]` losing to a portaled
 * `zIndex: 99997`.
 *
 * Rule: anything that blocks the user (auth) outranks anything that merely
 * presents content (detail modals, lightboxes), and transient feedback (toasts)
 * sits on top of all of it.
 */
export const Z = {
    /** Content modals — listing details, composers, confirmations. */
    MODAL: 99997,
    /** Full-screen media viewers opened *from* a modal. */
    LIGHTBOX: 99999,
    /**
     * Auth. Must clear every content overlay, because "Login to Contact" is
     * reachable from inside them.
     */
    AUTH: 1000000,
    /** Toasts — short-lived, never blocking, always visible. */
    TOAST: 1000001,
} as const;
