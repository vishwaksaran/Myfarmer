import { supabase } from './supabase';

export interface MachineryModel {
    id: string;
    brand: string;
    model_name: string;
    slug: string | null;
    category: string;
    hp: number;
    specs: string;
    base_price: number;
    warranty_years: number;
    fuel_type: string;
    image_url: string | null;
    features: Record<string, unknown>;
    is_active: boolean;
    brand_id: string | null;
    series: string | null;
    drive_type: string | null;
    category_type: string | null;
    is_popular: boolean;
    is_latest: boolean;
    is_upcoming: boolean;
    launch_year: number | null;
    cylinders: number | null;
    engine_cc: number | null;
    description: string | null;
}

export interface TractorBrand {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    founded_year: number | null;
    country: string;
    website_url: string | null;
    tagline: string | null;
    is_active: boolean;
    display_order: number;
    tier: number;
    series: string[];
    key_highlights: Record<string, unknown>;
    hp_range_min: number | null;
    hp_range_max: number | null;
    price_range_min: number | null;
    price_range_max: number | null;
    total_models: number;
    brand_color: string | null;
}

export interface TractorComparison {
    id: string;
    model_a_id: string;
    model_b_id: string;
    slug: string;
    is_popular: boolean;
    display_order: number;
    model_a?: MachineryModel;
    model_b?: MachineryModel;
}

export interface PromoBanner {
    id: string;
    title: string;
    subtitle: string | null;
    cta_text: string | null;
    cta_link: string | null;
    image_url: string | null;
    placement: string;
    display_order: number;
    bg_color: string;
    text_color: string;
}

export interface StatePrice {
    state: string;
    ex_showroom_price: number;
    on_road_price: number;
}

/**
 * Fetch all active machinery models, optionally filtered by category and/or brand.
 * Falls back to empty array on error (caller should use hardcoded data as fallback).
 */
export async function getAllModels(
    category?: string,
    brand?: string
): Promise<MachineryModel[]> {
    try {
        let query = supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .order('hp', { ascending: true });

        if (category) query = query.eq('category', category);
        if (brand) query = query.eq('brand', brand);

        const { data, error } = await query;
        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

/**
 * Fetch state-specific pricing for a model.
 */
export async function getModelPrice(
    modelId: string,
    state: string
): Promise<StatePrice | null> {
    try {
        const { data, error } = await supabase
            .from('machinery_state_prices')
            .select('state, ex_showroom_price, on_road_price')
            .eq('model_id', modelId)
            .eq('state', state)
            .single();

        if (error) return null;
        return data as StatePrice;
    } catch {
        return null;
    }
}

/**
 * Calculate estimated on-road price from ex-showroom price and state.
 * Used as fallback when no specific state price exists in the DB.
 */
export function estimateOnRoadPrice(
    exShowroom: number,
    state: string
): { rto: number; insurance: number; handling: number; total: number } {
    const rates: Record<string, { rto: number; insurance: number; handling: number }> = {
        'Andhra Pradesh': { rto: 0.06, insurance: 0.03, handling: 8000 },
        'Bihar': { rto: 0.05, insurance: 0.03, handling: 6000 },
        'Chhattisgarh': { rto: 0.05, insurance: 0.03, handling: 7000 },
        'Gujarat': { rto: 0.06, insurance: 0.03, handling: 9000 },
        'Haryana': { rto: 0.05, insurance: 0.03, handling: 7500 },
        'Jharkhand': { rto: 0.05, insurance: 0.03, handling: 6500 },
        'Karnataka': { rto: 0.07, insurance: 0.03, handling: 9000 },
        'Kerala': { rto: 0.08, insurance: 0.03, handling: 10000 },
        'Madhya Pradesh': { rto: 0.06, insurance: 0.03, handling: 7000 },
        'Maharashtra': { rto: 0.07, insurance: 0.03, handling: 10000 },
        'Odisha': { rto: 0.05, insurance: 0.03, handling: 6500 },
        'Punjab': { rto: 0.05, insurance: 0.03, handling: 7000 },
        'Rajasthan': { rto: 0.06, insurance: 0.03, handling: 8000 },
        'Tamil Nadu': { rto: 0.07, insurance: 0.03, handling: 9500 },
        'Telangana': { rto: 0.06, insurance: 0.03, handling: 8500 },
        'Uttar Pradesh': { rto: 0.05, insurance: 0.03, handling: 7000 },
        'West Bengal': { rto: 0.06, insurance: 0.03, handling: 8000 },
    };

    const r = rates[state] || { rto: 0.06, insurance: 0.03, handling: 8000 };
    const rto = Math.round(exShowroom * r.rto);
    const insurance = Math.round(exShowroom * r.insurance);
    return { rto, insurance, handling: r.handling, total: exShowroom + rto + insurance + r.handling };
}

// ============================================================
// Brand queries
// ============================================================

// Real brand logo images (overrides auto-generated SVG placeholders)
const REAL_LOGO_MAP: Record<string, string> = {
    'mahindra': '/images/brands/tractors/mahindra-real.jpg',
    'swaraj': '/images/brands/tractors/swaraj-real.png',
    'sonalika': '/images/brands/tractors/sonalika-real.png',
    'john-deere': '/images/brands/tractors/john-deere-real.png',
    'massey-ferguson': '/images/brands/tractors/massey-ferguson-real.png',
    'new-holland': '/images/brands/tractors/new-holland-real.png',
    'eicher': '/images/brands/tractors/eicher-real.png',
    'kubota': '/images/brands/tractors/kubota-real.jpg',
    'farmtrac': '/images/brands/tractors/farmtrac-real.png',
    'powertrac': '/images/brands/tractors/powertrac-real.jpg',
    'tafe': '/images/brands/tractors/tafe-real.png',
    'solis': '/images/brands/tractors/solis-real.png',
    'indo-farm': '/images/brands/tractors/indo-farm-real.png',
    'force': '/images/brands/tractors/force-real.png',
    'vst-shakti': '/images/brands/tractors/vst-shakti-real.png',
    'captain': '/images/brands/tractors/captain-real.png',
    'ace': '/images/brands/tractors/ace-real.png',
    'preet': '/images/brands/tractors/preet-real.jpg',
    'escorts': '/images/brands/tractors/escorts-real.jpg',
    'kartar': '/images/brands/tractors/kartar-real.jpg',
    'same-deutz-fahr': '/images/brands/tractors/same-deutz-fahr-real.jpg',
    'trakstar': '/images/brands/tractors/trakstar-real.jpg',
    'standard': '/images/brands/tractors/standard-real.jpg',
    'cooper': '/images/brands/tractors/cooper-real.jpg',
    'autonxt': '/images/brands/tractors/autonxt-real.jpg',
    'hav': '/images/brands/tractors/hav-real.jpg',
    'hindustan': '/images/brands/tractors/hindustan-real.webp',
    'cellestial': '/images/brands/tractors/cellestial-real.jpg',
    'montra': '/images/brands/tractors/montra-real.jpg',
};

function applyRealLogos(brands: TractorBrand[]): TractorBrand[] {
    return brands.map(b => ({
        ...b,
        logo_url: REAL_LOGO_MAP[b.slug] || b.logo_url,
    }));
}

export async function getAllBrands(tier?: number): Promise<TractorBrand[]> {
    try {
        let query = supabase
            .from('tractor_brands')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (tier) query = query.eq('tier', tier);

        const { data, error } = await query;
        if (error) throw error;
        return applyRealLogos((data as TractorBrand[]) || []);
    } catch {
        return [];
    }
}

export async function getBrandBySlug(slug: string): Promise<TractorBrand | null> {
    try {
        const { data, error } = await supabase
            .from('tractor_brands')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) return null;
        const brand = data as TractorBrand;
        return { ...brand, logo_url: REAL_LOGO_MAP[brand.slug] || brand.logo_url };
    } catch {
        return null;
    }
}

// ============================================================
// Enhanced model queries
// ============================================================

export async function getModelsByBrand(brand: string): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('brand', brand)
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .order('hp', { ascending: true });

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getPopularModels(limit = 12): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('is_popular', true)
            .eq('category', 'Tractor')
            .order('hp', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getLatestModels(limit = 8): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getModelsByBudget(
    minPrice: number,
    maxPrice: number
): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .gte('base_price', minPrice)
            .lte('base_price', maxPrice)
            .order('base_price', { ascending: true });

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getModelsByHP(
    minHP: number,
    maxHP: number
): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .gte('hp', minHP)
            .lte('hp', maxHP)
            .order('hp', { ascending: true });

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getModelBySlug(slug: string): Promise<MachineryModel | null> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) return null;
        return data as MachineryModel;
    } catch {
        return null;
    }
}

export async function getSimilarModels(
    modelId: string,
    brand: string,
    hp: number,
    limit = 4
): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .neq('id', modelId)
            .gte('hp', hp - 10)
            .lte('hp', hp + 10)
            .order('brand', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

export async function getModelsByDriveType(driveType: string): Promise<MachineryModel[]> {
    try {
        const { data, error } = await supabase
            .from('machinery_models')
            .select('*')
            .eq('is_active', true)
            .eq('category', 'Tractor')
            .eq('drive_type', driveType)
            .order('hp', { ascending: true });

        if (error) throw error;
        return (data as MachineryModel[]) || [];
    } catch {
        return [];
    }
}

// ============================================================
// Comparison queries
// ============================================================

export async function getPopularComparisons(limit = 10): Promise<TractorComparison[]> {
    try {
        const { data, error } = await supabase
            .from('tractor_comparisons')
            .select(`
                *,
                model_a:model_a_id(id, brand, model_name, slug, hp, specs, base_price, image_url, features, drive_type),
                model_b:model_b_id(id, brand, model_name, slug, hp, specs, base_price, image_url, features, drive_type)
            `)
            .eq('is_popular', true)
            .order('display_order', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return (data as unknown as TractorComparison[]) || [];
    } catch {
        return [];
    }
}

// ============================================================
// Banner queries
// ============================================================

export async function getActiveBanners(placement?: string): Promise<PromoBanner[]> {
    try {
        let query = supabase
            .from('promo_banners')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (placement) query = query.eq('placement', placement);

        const { data, error } = await query;
        if (error) throw error;
        return (data as PromoBanner[]) || [];
    } catch {
        return [];
    }
}
