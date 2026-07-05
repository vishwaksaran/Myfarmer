'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

export interface UserAddress {
    id: string;
    user_id: string;
    label: string;
    address: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    latitude: number | null;
    longitude: number | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface AddressInput {
    label?: string;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    is_default?: boolean;
}

interface ActionResult {
    success: boolean;
    error?: string;
}

export async function fetchAddresses(): Promise<{ data: UserAddress[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) return { data: [], error: error.message };
        return { data: (data as UserAddress[]) || [] };
    } catch (err) {
        console.error('[fetchAddresses] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch addresses' };
    }
}

function validate(input: AddressInput): string | null {
    if (!input.address || !input.address.trim()) return 'Address is required';
    return null;
}

// Clear the default flag on all of a user's other addresses
async function clearOtherDefaults(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    userId: string,
    exceptId?: string,
) {
    let q = supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId);
    if (exceptId) q = q.neq('id', exceptId);
    await q;
}

export async function addAddress(input: AddressInput): Promise<ActionResult> {
    const invalid = validate(input);
    if (invalid) return { success: false, error: invalid };
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        if (input.is_default) await clearOtherDefaults(supabase, user.id);

        const { error } = await supabase.from('user_addresses').insert({
            user_id: user.id,
            label: input.label?.trim() || 'Home',
            address: input.address?.trim() || null,
            district: input.district?.trim() || null,
            state: input.state?.trim() || null,
            pincode: input.pincode?.trim() || null,
            is_default: input.is_default ?? false,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[addAddress] Unexpected error:', err);
        return { success: false, error: 'Failed to add address' };
    }
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
    const invalid = validate(input);
    if (invalid) return { success: false, error: invalid };
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        if (input.is_default) await clearOtherDefaults(supabase, user.id, id);

        const { error } = await supabase
            .from('user_addresses')
            .update({
                label: input.label?.trim() || 'Home',
                address: input.address?.trim() || null,
                district: input.district?.trim() || null,
                state: input.state?.trim() || null,
                pincode: input.pincode?.trim() || null,
                ...(input.is_default !== undefined ? { is_default: input.is_default } : {}),
            })
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[updateAddress] Unexpected error:', err);
        return { success: false, error: 'Failed to update address' };
    }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[deleteAddress] Unexpected error:', err);
        return { success: false, error: 'Failed to delete address' };
    }
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        await clearOtherDefaults(supabase, user.id, id);
        const { error } = await supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[setDefaultAddress] Unexpected error:', err);
        return { success: false, error: 'Failed to set default address' };
    }
}
