/**
 * Curated real tractor images from Pexels (free to use under Pexels License).
 * Provides fallback images when model.image_url is null/empty.
 */

const PEXELS_BASE = 'https://images.pexels.com/photos';

// Red tractors (Mahindra, Swaraj, Massey Ferguson, TAFE, Eicher, Indo Farm, Captain, Standard, Powertrac)
const RED_TRACTORS = [
    `${PEXELS_BASE}/7532304/pexels-photo-7532304.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/5237363/pexels-photo-5237363.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/6844900/pexels-photo-6844900.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/162371/tractor-round-baler-custom-work-hay-162371.jpeg?auto=compress&cs=tinysrgb&w=800`,
];

// Green tractors (John Deere, Sonalika, Preet, Digitrac)
const GREEN_TRACTORS = [
    `${PEXELS_BASE}/5358849/pexels-photo-5358849.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2889440/pexels-photo-2889440.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2889442/pexels-photo-2889442.jpeg?auto=compress&cs=tinysrgb&w=800`,
];

// Blue tractors (New Holland, Force, Farmtrac, Escorts)
const BLUE_TRACTORS = [
    `${PEXELS_BASE}/6020273/pexels-photo-6020273.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/4394883/pexels-photo-4394883.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/36196232/pexels-photo-36196232.jpeg?auto=compress&cs=tinysrgb&w=800`,
];

// Orange/Yellow tractors (Kubota, ACE, VST)
const ORANGE_TRACTORS = [
    `${PEXELS_BASE}/4439573/pexels-photo-4439573.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/7791330/pexels-photo-7791330.jpeg?auto=compress&cs=tinysrgb&w=800`,
];

// General working-tractor images for categories
const GENERAL_TRACTORS = [
    `${PEXELS_BASE}/4093908/pexels-photo-4093908.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/7457026/pexels-photo-7457026.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2257447/pexels-photo-2257447.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/3732481/pexels-photo-3732481.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2253412/pexels-photo-2253412.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2257304/pexels-photo-2257304.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=800`,
    `${PEXELS_BASE}/2253282/pexels-photo-2253282.jpeg?auto=compress&cs=tinysrgb&w=800`,
];

// Brand → color-appropriate images
const BRAND_IMAGE_MAP: Record<string, string[]> = {
    mahindra: RED_TRACTORS,
    swaraj: RED_TRACTORS,
    'massey ferguson': RED_TRACTORS,
    tafe: RED_TRACTORS,
    eicher: RED_TRACTORS,
    'indo farm': RED_TRACTORS,
    captain: RED_TRACTORS,
    standard: RED_TRACTORS,
    powertrac: RED_TRACTORS,
    'john deere': GREEN_TRACTORS,
    sonalika: GREEN_TRACTORS,
    preet: GREEN_TRACTORS,
    digitrac: GREEN_TRACTORS,
    'new holland': BLUE_TRACTORS,
    force: BLUE_TRACTORS,
    farmtrac: BLUE_TRACTORS,
    escorts: BLUE_TRACTORS,
    kubota: ORANGE_TRACTORS,
    ace: ORANGE_TRACTORS,
    vst: ORANGE_TRACTORS,
};

/**
 * Simple hash for deterministic image selection based on a string key.
 */
function stableHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

/**
 * Returns a real tractor image URL based on brand, model name, or slug.
 * Uses brand-specific color-matched images when possible, else falls back
 * to a pool of general tractor images.
 *
 * The same inputs always return the same image (deterministic).
 */
export function getTractorImage(
    brand?: string | null,
    modelName?: string | null,
    slug?: string | null,
): string {
    const key = `${brand || ''}-${modelName || ''}-${slug || ''}`.toLowerCase();

    // Try brand-specific images first
    if (brand) {
        const brandKey = brand.toLowerCase();
        const images = BRAND_IMAGE_MAP[brandKey];
        if (images) {
            return images[stableHash(key) % images.length];
        }
    }

    // Fallback to general tractor pool
    return GENERAL_TRACTORS[stableHash(key) % GENERAL_TRACTORS.length];
}

/**
 * Returns the image_url if it exists and is non-empty, otherwise computes
 * a brand-appropriate fallback from curated Pexels photos.
 */
export function getTractorImageUrl(
    imageUrl: string | null | undefined,
    brand?: string | null,
    modelName?: string | null,
    slug?: string | null,
): string {
    if (imageUrl && imageUrl.trim()) return imageUrl;
    return getTractorImage(brand, modelName, slug);
}
