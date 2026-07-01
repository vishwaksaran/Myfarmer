'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { MAX_SERVICE_PRICE } from '@/lib/provider-config';

// ─── Types ───────────────────────────────────────────────────────────

export interface ProviderService {
    id: string;
    provider_id: string;
    name: string;
    description: string | null;
    price: number;
    unit: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceInput {
    name: string;
    description?: string;
    price?: number;
    unit?: string;
    is_available?: boolean;
}

interface ActionResult {
    success: boolean;
    error?: string;
}

// ─── Validation ────────────────────────────────────────────────────────

function validate(input: ServiceInput): string | null {
    if (!input.name || !input.name.trim()) return 'Service name is required';
    if (input.name.trim().length > 120) return 'Service name is too long';
    if (input.price !== undefined) {
        if (Number.isNaN(input.price) || input.price < 0) return 'Price must be a positive number';
        if (input.price > MAX_SERVICE_PRICE) {
            return `Price cannot exceed ₹${MAX_SERVICE_PRICE.toLocaleString('en-IN')}`;
        }
    }
    return null;
}

// ─── Fetch this provider's services ──────────────────────────────────

export async function fetchProviderServices(): Promise<{ data: ProviderService[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('provider_services')
            .select('*')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[fetchProviderServices] Error:', error);
            return { data: [], error: error.message };
        }
        return { data: (data as ProviderService[]) || [] };
    } catch (err) {
        console.error('[fetchProviderServices] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch services' };
    }
}

// ─── Create ──────────────────────────────────────────────────────────

export async function createProviderService(input: ServiceInput): Promise<ActionResult> {
    const invalid = validate(input);
    if (invalid) return { success: false, error: invalid };
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase.from('provider_services').insert({
            provider_id: user.id,
            name: input.name.trim(),
            description: input.description?.trim() || null,
            price: input.price ?? 0,
            unit: input.unit?.trim() || 'per service',
            is_available: input.is_available ?? true,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[createProviderService] Unexpected error:', err);
        return { success: false, error: 'Failed to create service' };
    }
}

// ─── Update ──────────────────────────────────────────────────────────

export async function updateProviderService(id: string, input: ServiceInput): Promise<ActionResult> {
    const invalid = validate(input);
    if (invalid) return { success: false, error: invalid };
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('provider_services')
            .update({
                name: input.name.trim(),
                description: input.description?.trim() || null,
                price: input.price ?? 0,
                unit: input.unit?.trim() || 'per service',
                ...(input.is_available !== undefined ? { is_available: input.is_available } : {}),
            })
            .eq('id', id)
            .eq('provider_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[updateProviderService] Unexpected error:', err);
        return { success: false, error: 'Failed to update service' };
    }
}

// ─── Toggle availability ─────────────────────────────────────────────

export async function toggleServiceAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('provider_services')
            .update({ is_available: isAvailable })
            .eq('id', id)
            .eq('provider_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[toggleServiceAvailability] Unexpected error:', err);
        return { success: false, error: 'Failed to update availability' };
    }
}

// ─── Delete ──────────────────────────────────────────────────────────

export async function deleteProviderService(id: string): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('provider_services')
            .delete()
            .eq('id', id)
            .eq('provider_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[deleteProviderService] Unexpected error:', err);
        return { success: false, error: 'Failed to delete service' };
    }
}
