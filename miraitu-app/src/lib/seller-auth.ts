/* ─────────────────────────────────────────────────────────────
   Seller session tokens
   ─────────────────────────────────────────────────────────────
   Sellers (farmers, dealers, service providers) sign in at
   /seller-login with a username and password admin issued them,
   not with the phone OTP the public app uses. That keeps the
   seller workspace separate from a shopper's account, which is
   what lets the dashboard drop the public header entirely.

   Password hashing, encryption and temp-password generation are
   reused wholesale from vendor-crypto — sellers need exactly the
   same guarantees as CRM vendors and there is no reason to grow
   a second implementation of any of it. Only the token payload
   and the cookie differ, and they live here.
   ───────────────────────────────────────────────────────────── */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export { encryptPassword, decryptPassword, hashPassword, verifyPassword, generateTempPassword } from './vendor-crypto';

/** Cookie the seller session rides in. Distinct from `vendor_session`. */
export const SELLER_COOKIE = 'seller_session';

const JWT_EXPIRY = '24h';

export interface SellerJwtPayload {
    /** seller_credentials.id */
    credentialId: string;
    /** sellers.id — what every dashboard query keys on. */
    sellerId: string;
    /** 'farmer-seller' | 'dealer' | 'service-provider' — picks the dashboard. */
    sellerType: string;
    /**
     * Bumped on password reset or deactivation. A token minted before the
     * bump no longer matches and the session dies on its next check.
     */
    sessionVersion: number;
}

function secret(): string {
    // Same secret as the vendor system: one signing key for the staff-side
    // tokens, and the payload shape tells them apart.
    const s = process.env.VENDOR_JWT_SECRET;
    if (!s) throw new Error('VENDOR_JWT_SECRET is not set — seller login cannot issue sessions.');
    return s;
}

export async function signSellerJWT(payload: SellerJwtPayload): Promise<string> {
    return jwt.sign(payload, secret(), { expiresIn: JWT_EXPIRY });
}

/** Full verification — signature, expiry and payload shape. */
export async function verifySellerJWT(token: string): Promise<SellerJwtPayload | null> {
    try {
        const decoded = jwt.verify(token, secret()) as SellerJwtPayload & jwt.JwtPayload;
        if (!decoded.sellerId || !decoded.credentialId) return null;
        return {
            credentialId: decoded.credentialId,
            sellerId: decoded.sellerId,
            sellerType: decoded.sellerType,
            sessionVersion: decoded.sessionVersion,
        };
    } catch {
        return null;
    }
}

/**
 * HMAC check for middleware, which runs on the Edge runtime where the full
 * `jsonwebtoken` library is unavailable.
 *
 * It verifies the signature and the expiry, which is enough to turn away a
 * forged or stale cookie at the edge. It deliberately does not check whether
 * the seller is still approved or still active — that needs the database, so
 * it is re-checked server side on every dashboard load and API call. A seller
 * admin deactivates cannot ride a valid-looking cookie past that.
 */
export function verifySellerSignatureOnly(token: string): SellerJwtPayload | null {
    try {
        const key = process.env.VENDOR_JWT_SECRET;
        if (!key) return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [header, payload, signature] = parts;

        const hmac = crypto.createHmac('sha256', key);
        hmac.update(`${header}.${payload}`);
        if (hmac.digest('base64url') !== signature) return null;

        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
        if (!decoded.sellerId || !decoded.credentialId) return null;

        return {
            credentialId: decoded.credentialId,
            sellerId: decoded.sellerId,
            sellerType: decoded.sellerType,
            sessionVersion: decoded.sessionVersion,
        };
    } catch {
        return null;
    }
}
