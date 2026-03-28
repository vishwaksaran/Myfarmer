// Server-only utility — imported by API routes and server actions

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY = '24h';

function getEncryptionKey(): Buffer {
    const key = process.env.VENDOR_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('VENDOR_ENCRYPTION_KEY is not set. Add it to your environment variables.');
    }
    // Key must be 32 bytes (64 hex chars) for AES-256
    if (key.length !== 64) {
        throw new Error('VENDOR_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
    }
    return Buffer.from(key, 'hex');
}

function getJwtSecret(): string {
    const secret = process.env.VENDOR_JWT_SECRET;
    if (!secret) {
        throw new Error('VENDOR_JWT_SECRET is not set. Add it to your environment variables.');
    }
    return secret;
}

// ── AES-256-GCM Encryption ─────────────────────────

/**
 * Encrypts a plaintext password using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext (all hex-encoded).
 * Used for admin password viewing — NEVER use this for login verification.
 */
export async function encryptPassword(plaintext: string): Promise<string> {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted password.
 * Input format: iv:authTag:ciphertext (all hex-encoded).
 * Only called from admin server actions — NEVER expose to client.
 */
export async function decryptPassword(ciphertext: string): Promise<string> {
    const key = getEncryptionKey();
    const parts = ciphertext.split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted password format.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

// ── Bcrypt Hashing ──────────────────────────────────

/**
 * Hashes a password with bcrypt (one-way, for login verification).
 */
export async function hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}

// ── JWT ─────────────────────────────────────────────

export interface VendorJwtPayload {
    vendorId: string;
    shopSlug: string;
    sessionVersion: number;
}

/**
 * Signs a vendor JWT with the given payload. Expires in 24 hours.
 */
export async function signVendorJWT(payload: VendorJwtPayload): Promise<string> {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

/**
 * Verifies and decodes a vendor JWT. Returns the payload or null if invalid.
 */
export async function verifyVendorJWT(token: string): Promise<VendorJwtPayload | null> {
    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as VendorJwtPayload & jwt.JwtPayload;
        return {
            vendorId: decoded.vendorId,
            shopSlug: decoded.shopSlug,
            sessionVersion: decoded.sessionVersion,
        };
    } catch {
        return null;
    }
}

/**
 * Lightweight JWT verification for middleware (Edge-compatible).
 * Uses manual HMAC-SHA256 verification without the full jsonwebtoken library.
 * Only verifies the signature — does NOT check expiry or payload validity.
 * Full validation happens in layout/API routes.
 */
export function verifyJwtSignatureOnly(token: string): VendorJwtPayload | null {
    try {
        const secret = process.env.VENDOR_JWT_SECRET;
        if (!secret) return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;

        // Verify HMAC-SHA256 signature
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${header}.${payload}`);
        const expectedSignature = hmac.digest('base64url');

        if (expectedSignature !== signature) return null;

        // Decode payload
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

        // Check expiry
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return {
            vendorId: decoded.vendorId,
            shopSlug: decoded.shopSlug,
            sessionVersion: decoded.sessionVersion,
        };
    } catch {
        return null;
    }
}

// ── Temp Password Generator ────────────────────────

/**
 * Generates a random 12-character alphanumeric temp password.
 */
export function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const bytes = crypto.randomBytes(12);
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
}
