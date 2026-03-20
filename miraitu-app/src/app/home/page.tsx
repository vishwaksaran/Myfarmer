import { permanentRedirect } from 'next/navigation';

/**
 * Fallback redirect /home → / (primary redirect is in src/middleware.ts as 301).
 * This catches any edge case where the middleware redirect is bypassed.
 */
export default function HomeRedirectPage() {
    permanentRedirect('/');
}
