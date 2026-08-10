export const isImageAvatar = (value?: string | null) => {
    if (!value) return false;
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('/');
};

const normalizeSeed = (seed: string) => seed.toLowerCase().replace(/[^a-z0-9]/g, '');

const hashToIndex = (seed: string, modulo: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % modulo;
};

// Deep enough for white text to stay readable at 14px inside a 56px circle.
const AVATAR_COLORS = [
    '#15803d', // green
    '#0f766e', // teal
    '#b45309', // amber
    '#c2410c', // orange
    '#4d7c0f', // olive
    '#1d4ed8', // blue
    '#7e22ce', // purple
    '#be123c', // rose
];

/** "Rajesh K." → "RK", "you" → "Y". Falls back to a person glyph when there are no letters. */
const initialsOf = (name: string): string => {
    const words = (name || '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return '';
    const letters = words.slice(0, 2).map(w => w[0]).join('');
    return letters.toUpperCase();
};

/**
 * A self-contained SVG avatar — coloured disc plus initials.
 *
 * Replaces the old photo pool: those files are wide documentary shots (a farmers'
 * march, a threshing yard), so a 56px circular crop of them read as unrecognisable
 * noise rather than a face. Initials stay legible at every size these render at,
 * need no network request, and can never 404.
 */
const initialsAvatar = (seed: string): string => {
    const key = normalizeSeed(seed) || 'farmer';
    const bg = AVATAR_COLORS[hashToIndex(key, AVATAR_COLORS.length)];
    const initials = initialsOf(seed);
    const label = initials
        ? `<text x="40" y="40" fill="#ffffff" font-family="Plus Jakarta Sans, Segoe UI, system-ui, sans-serif" font-size="32" font-weight="700" text-anchor="middle" dominant-baseline="central">${initials}</text>`
        // No letters to work with (emoji-only or blank name) — draw a simple bust.
        : `<g fill="#ffffff"><circle cx="40" cy="32" r="12"/><path d="M16 70c0-13 11-22 24-22s24 9 24 22z"/></g>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="${bg}"/>${label}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Neutral avatar used as the onError fallback when a real photo URL fails to load. */
export const DEFAULT_COMMUNITY_AVATAR = initialsAvatar('');

/**
 * A real uploaded photo when we have one, otherwise a generated initials avatar
 * keyed off the display name (so the same person keeps the same colour).
 */
export const resolveAvatarSrc = (avatar: string | null | undefined, seed: string) => {
    if (isImageAvatar(avatar)) return avatar as string;
    return initialsAvatar(seed || 'farmer');
};
