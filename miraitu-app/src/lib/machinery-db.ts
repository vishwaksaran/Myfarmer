import { supabase } from './supabase';

export interface MachineryModel {
    id: string;
    brand: string;
    model_name: string;
    category: string;
    hp: number;
    specs: string;
    base_price: number;
    warranty_years: number;
    fuel_type: string;
    image_url: string | null;
    features: Record<string, unknown>;
    is_active: boolean;
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
