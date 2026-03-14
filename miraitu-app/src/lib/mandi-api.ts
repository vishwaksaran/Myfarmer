/* ─────────────────────────────────────────────────────────────
   data.gov.in  ›  Mandi Price Types, MSP Reference & Helpers
   ───────────────────────────────────────────────────────────── */

// ── Raw record returned by data.gov.in commodity price API ─────
export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;      // "14/03/2026"
  min_price: string;         // in ₹ per quintal (string from API)
  max_price: string;
  modal_price: string;       // most common transaction price
}

// ── Normalised record for internal use ─────────────────────────
export interface NormalisedPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;       // ISO "2026-03-14"
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

// ── API response envelope from data.gov.in ─────────────────────
export interface DataGovResponse {
  status: string;
  message: string;
  total: number;
  count: number;
  records: MandiRecord[];
}

// ── MSP (Minimum Support Price) 2025-26 Season ────────────────
// Source: CACP / Ministry of Agriculture.
// Updated once per Kharif (June) and Rabi (Oct) season.
export const MSP_DATA: Record<string, number> = {
  'Wheat':           2275,
  'Rice':            2300,
  'Paddy(Dhan)(Common)': 2300,
  'Paddy':           2300,
  'Soyabean':        4600,
  'Soybean':         4600,
  'Cotton':          7121,
  'Mustard':         5650,
  'Gram':            5440,
  'Gram Dal':        5440,
  'Chana':           5440,
  'Bengal Gram(Gram)(Whole)': 5440,
  'Maize':           2090,
  'Jowar(Sorghum)':  3371,
  'Bajra(Pearl Millet)': 2625,
  'Barley':          1850,
  'Groundnut':       6377,
  'Sunflower':       6760,
  'Arhar (Tur/Red Gram)(Whole)': 7000,
  'Masoor Dal':      6425,
  'Moong(Green Gram)(Whole)': 8558,
  'Urad (Beans/Black Gram)(Whole)': 6950,
  'Copra':          11160,
  'Sesamum(Sesame,Gingelly,Til)': 8635,
  'Lentil (Masur)(Whole)': 6425,
};

/** Look up MSP for a commodity name (case-insensitive partial match) */
export function getMSP(commodity: string): number {
  const key = Object.keys(MSP_DATA).find(
    k => k.toLowerCase() === commodity.toLowerCase()
  );
  if (key) return MSP_DATA[key];
  // Fuzzy: try startsWith
  const partial = Object.keys(MSP_DATA).find(
    k => k.toLowerCase().startsWith(commodity.toLowerCase()) ||
         commodity.toLowerCase().startsWith(k.toLowerCase())
  );
  return partial ? MSP_DATA[partial] : 0;
}

// ── Crop → emoji mapping ──────────────────────────────────────
export const CROP_EMOJI: Record<string, string> = {
  'Wheat':     '🌾',
  'Rice':      '🍚',
  'Paddy':     '🍚',
  'Paddy(Dhan)(Common)': '🍚',
  'Soyabean':  '🫘',
  'Soybean':   '🫘',
  'Cotton':    '🏵️',
  'Mustard':   '🌼',
  'Onion':     '🧅',
  'Tomato':    '🍅',
  'Potato':    '🥔',
  'Maize':     '🌽',
  'Chilli(Green)': '🌶️',
  'Chilli':    '🌶️',
  'Groundnut': '🥜',
  'Gram':      '🫛',
  'Bengal Gram(Gram)(Whole)': '🫛',
  'Jowar(Sorghum)': '🌾',
  'Bajra(Pearl Millet)': '🌾',
  'Banana':    '🍌',
  'Apple':     '🍎',
  'Mango':     '🥭',
  'Grapes':    '🍇',
  'Orange':    '🍊',
  'Sugarcane': '🎋',
  'Turmeric':  '🟡',
  'Coconut':   '🥥',
  'Brinjal':   '🍆',
  'Cabbage':   '🥬',
  'Cauliflower': '🥦',
  'Carrot':    '🥕',
  'Garlic':    '🧄',
  'Ginger(Green)': '🫚',
};

export function getCropEmoji(commodity: string): string {
  const key = Object.keys(CROP_EMOJI).find(
    k => k.toLowerCase() === commodity.toLowerCase()
  );
  if (key) return CROP_EMOJI[key];
  const partial = Object.keys(CROP_EMOJI).find(
    k => k.toLowerCase().startsWith(commodity.toLowerCase()) ||
         commodity.toLowerCase().startsWith(k.toLowerCase())
  );
  return partial ? CROP_EMOJI[partial] : '🌱';
}

// ── Crop → Material Symbol icon mapping ──────────────────────
export const CROP_ICON: Record<string, string> = {
  'Wheat':   'grain',
  'Rice':    'rice_bowl',
  'Paddy':   'rice_bowl',
  'Soyabean':'spa',
  'Soybean': 'spa',
  'Cotton':  'cloud',
  'Onion':   'eco',
  'Tomato':  'eco',
  'Potato':  'eco',
  'Maize':   'grain',
};

export function getCropIcon(commodity: string): string {
  const key = Object.keys(CROP_ICON).find(
    k => k.toLowerCase() === commodity.toLowerCase()
  );
  if (key) return CROP_ICON[key];
  return 'eco';
}

// ── Helper: normalise a raw data.gov.in record ─────────────────
export function normalise(r: MandiRecord): NormalisedPrice {
  // arrival_date comes as "14/03/2026" – convert to ISO
  const [dd, mm, yyyy] = (r.arrival_date || '').split('/');
  const iso = dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : '';

  return {
    state: r.state?.trim() ?? '',
    district: r.district?.trim() ?? '',
    market: r.market?.trim() ?? '',
    commodity: r.commodity?.trim() ?? '',
    variety: r.variety?.trim() ?? '',
    arrivalDate: iso,
    minPrice: Number(r.min_price) || 0,
    maxPrice: Number(r.max_price) || 0,
    modalPrice: Number(r.modal_price) || 0,
  };
}

// ── Helper: format price for display ───────────────────────────
export function formatPrice(price: number, unit = 'qtl'): string {
  if (!price) return '—';
  return `₹${price.toLocaleString('en-IN')}/${unit}`;
}

// ── Helper: compute simple change % from min↔max spread ────────
export function spreadPercent(min: number, max: number): number {
  if (!min || !max) return 0;
  const mid = (min + max) / 2;
  return mid ? +((max - min) / mid * 50).toFixed(1) : 0; // half-spread ≈ daily variance proxy
}

// ── data.gov.in resource ID ────────────────────────────────────
export const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
export const DATA_GOV_BASE = 'https://api.data.gov.in/resource';
