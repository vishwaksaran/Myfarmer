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
