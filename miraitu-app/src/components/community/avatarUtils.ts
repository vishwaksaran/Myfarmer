export const isImageAvatar = (value?: string | null) => {
    if (!value) return false;
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('/');
};

const normalizeSeed = (seed: string) => seed.toLowerCase().replace(/[^a-z0-9]/g, '');

export const DEFAULT_COMMUNITY_AVATAR = '/images/community/farmers/rural-farmer-1.jpg';

const hashToIndex = (seed: string, modulo: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % modulo;
};

const INDIAN_FARMER_AVATAR_POOL = [
    '/images/community/farmers/rural-farmer-1.jpg',
    '/images/community/farmers/rural-farmer-2.jpg',
    '/images/community/farmers/rural-farmer-3.jpg',
    '/images/community/farmers/rural-farmer-4.jpg',
    '/images/community/farmers/rural-farmer-5.jpg',
    '/images/community/farmers/rural-farmer-6.jpg',
    '/images/community/farmers/rural-farmer-7.png',
    '/images/community/farmers/rural-farmer-8.jpg',
    '/images/community/farmers/rural-farmer-9.jpg',
    '/images/community/farmers/rural-farmer-10.jpg',
];

const AVATAR_OVERRIDES: Record<string, string> = {
    yourstory: '/images/community/farmers/rural-farmer-1.jpg',
    rajeshk: '/images/community/farmers/rural-farmer-1.jpg',
    rajeshkumar: '/images/community/farmers/rural-farmer-1.jpg',
    rajeshorganic: '/images/community/farmers/rural-farmer-1.jpg',
    priyas: '/images/community/farmers/rural-farmer-2.jpg',
    priyasharma: '/images/community/farmers/rural-farmer-2.jpg',
    priyaagri: '/images/community/farmers/rural-farmer-2.jpg',
    amitp: '/images/community/farmers/rural-farmer-3.jpg',
    amitpatel: '/images/community/farmers/rural-farmer-3.jpg',
    amitsmartfarm: '/images/community/farmers/rural-farmer-3.jpg',
    sunitad: '/images/community/farmers/rural-farmer-4.jpg',
    sunitadevi: '/images/community/farmers/rural-farmer-4.jpg',
    sunitacoop: '/images/community/farmers/rural-farmer-4.jpg',
    karthikr: '/images/community/farmers/rural-farmer-5.jpg',
    karthikreddy: '/images/community/farmers/rural-farmer-5.jpg',
    karthikagritech: '/images/community/farmers/rural-farmer-5.jpg',
    meenav: '/images/community/farmers/rural-farmer-6.jpg',
    vikrams: '/images/community/farmers/rural-farmer-7.png',
    vikramsingh: '/images/community/farmers/rural-farmer-7.png',
    drswaminathan: '/images/community/farmers/rural-farmer-8.jpg',
    drmangeshthakur: '/images/community/farmers/rural-farmer-9.jpg',
    drmangeshagri: '/images/community/farmers/rural-farmer-9.jpg',
    kavithafarms: '/images/community/farmers/rural-farmer-10.jpg',
    kavithaorganic: '/images/community/farmers/rural-farmer-10.jpg',
    agridroneindia: '/images/community/farmers/rural-farmer-8.jpg',
    agridronein: '/images/community/farmers/rural-farmer-8.jpg',
    kisaanunion: '/images/community/farmers/rural-farmer-9.jpg',
};

export const resolveAvatarSrc = (avatar: string | null | undefined, seed: string) => {
    if (isImageAvatar(avatar)) return avatar as string;
    const key = normalizeSeed(seed || 'farmer');
    if (AVATAR_OVERRIDES[key]) return AVATAR_OVERRIDES[key];
    return INDIAN_FARMER_AVATAR_POOL[hashToIndex(key, INDIAN_FARMER_AVATAR_POOL.length)];
};
