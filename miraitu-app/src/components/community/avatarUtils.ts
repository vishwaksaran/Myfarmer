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

const INDIAN_FARMER_AVATAR_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=220&h=220&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=220&h=220&fit=crop&crop=faces',
];

const AVATAR_OVERRIDES: Record<string, string> = {
  yourstory: '/team/rajesh.jpeg',
  rajeshk: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&crop=faces',
  rajeshkumar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&crop=faces',
  priyas: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop&crop=faces',
  priyasharma: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop&crop=faces',
  amitp: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&crop=faces',
  amitpatel: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&crop=faces',
  sunitad: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=220&h=220&fit=crop&crop=faces',
  sunitadevi: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=220&h=220&fit=crop&crop=faces',
  karthikr: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=220&h=220&fit=crop&crop=faces',
  karthikreddy: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=220&h=220&fit=crop&crop=faces',
  meenav: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=220&h=220&fit=crop&crop=faces',
  vikrams: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop&crop=faces',
  vikramsingh: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop&crop=faces',
  drswaminathan: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=220&h=220&fit=crop&crop=faces',
  drmangeshthakur: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=220&h=220&fit=crop&crop=faces',
  kavithafarms: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=220&h=220&fit=crop&crop=faces',
  agridroneindia: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=220&h=220&fit=crop&crop=faces',
  kisaanunion: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=220&h=220&fit=crop&crop=faces',
};

export const resolveAvatarSrc = (avatar: string | null | undefined, seed: string) => {
  if (isImageAvatar(avatar)) return avatar as string;
  const key = normalizeSeed(seed || 'farmer');
  if (AVATAR_OVERRIDES[key]) return AVATAR_OVERRIDES[key];
  return INDIAN_FARMER_AVATAR_POOL[hashToIndex(key, INDIAN_FARMER_AVATAR_POOL.length)];
};
