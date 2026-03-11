import { permanentRedirect } from 'next/navigation';

/**
 * Fallback redirect /home → / (primary redirect is in next.config.ts as 301).
 * This catches any edge case where the config-level redirect is bypassed.
 */
export default function HomeRedirectPage() {
    permanentRedirect('/');
}
