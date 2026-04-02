export const COMMUNITY_FOLLOWING_STORAGE_KEY = 'community_following_usernames';

export const normalizeUsername = (username: string) => username.replace(/^@/, '').trim().toLowerCase();

export const getFollowedUsernames = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();

    try {
        const raw = window.localStorage.getItem(COMMUNITY_FOLLOWING_STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return new Set();
        return new Set(parsed.map((value) => normalizeUsername(String(value))).filter(Boolean));
    } catch {
        return new Set();
    }
};

export const saveFollowedUsernames = (usernames: Set<string>) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(COMMUNITY_FOLLOWING_STORAGE_KEY, JSON.stringify(Array.from(usernames)));
};

export const toggleFollowedUsername = (username: string): Set<string> => {
    const normalized = normalizeUsername(username);
    const current = getFollowedUsernames();
    if (current.has(normalized)) {
        current.delete(normalized);
    } else {
        current.add(normalized);
    }
    saveFollowedUsernames(current);
    return current;
};
