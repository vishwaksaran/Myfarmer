// Temporary UI toggles. Flip a flag back to restore the feature — no other
// change is needed; the routes, context and checkout logic all stay in place.

/**
 * Shop cart controls (Add to Cart buttons and quantity steppers on the
 * /home/shop pages). When false the shop is browse-only.
 * Does NOT affect the services cart — service booking is separate.
 */
export const SHOP_CART_ENABLED = false;

/**
 * "New" and "Rent" actions in the machinery category modal.
 * The /new and /rent routes still exist and work by direct URL.
 *
 * Annotated `: boolean` on purpose — a bare `= false` gets the literal type
 * `false`, which makes TypeScript treat the guarded JSX as unreachable and drop
 * the surrounding null-narrowing on `modalCategory`.
 */
export const MACHINERY_NEW_ENABLED: boolean = false;
export const MACHINERY_RENT_ENABLED: boolean = false;

/**
 * The first-run language chooser that greets a new device on launch.
 *
 * Hidden while the app is only part-translated: most of the marketplace pages
 * (rent, buy & sell, machinery, land, livestock) still render hardcoded
 * English, so pushing a language choice up front promises more than the app
 * delivers. The header's translate button is deliberately untouched — anyone
 * who wants another language can still pick one, they are just not asked.
 *
 * Flip to true to start asking again. The component, its copy in all ten
 * languages and the `miraitu-lang-onboarded` flag all stay in place.
 *
 * Annotated `: boolean` for the same reason as the machinery flags above —
 * a bare `= false` narrows to the literal type and makes TypeScript treat the
 * guarded JSX as unreachable.
 */
export const LANGUAGE_FIRST_RUN_ENABLED: boolean = false;

/**
 * AdSense rendering, globally. When false no ad script loads, no ad slot
 * renders, and the consent banner stays hidden — the whole ads layer is inert
 * and costs nothing at runtime.
 *
 * Flip to true only once the AdSense account is approved AND
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID is set in the environment. Without the client
 * ID the ads layer stays inert regardless of this flag (see ads-config.ts),
 * so a half-configured deploy fails closed rather than shipping blank slots.
 *
 * Annotated `: boolean` for the same reason as the machinery flags above —
 * a bare `= false` narrows to the literal type and makes TypeScript treat the
 * guarded JSX as unreachable.
 */
export const ADS_ENABLED: boolean = false;
