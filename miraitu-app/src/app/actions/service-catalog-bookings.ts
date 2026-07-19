'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// ─── Types ───────────────────────────────────────────────────────────

export interface ServiceCartLineInput {
    category: string;
    itemId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    answers: Record<string, string>;
}

export interface CreateServiceBookingInput {
    /** Service category slug — drivers-operators, drone-spray, etc. */
    category: string;
    full_name: string;
    phone: string;
    location: string;
    date: string; // YYYY-MM-DD
    time: string; // preferred time slot / HH:mm
    items: ServiceCartLineInput[];
    total: number;
    user_latitude?: number;
    user_longitude?: number;
}

export interface ServiceBookingResult {
    success: boolean;
    error?: string;
    id?: string;
}

// ─── Create a service booking from the cart ──────────────────────────

export async function createServiceCatalogBooking(
    data: CreateServiceBookingInput
): Promise<ServiceBookingResult> {
    try {
        if (!data.items?.length) return { success: false, error: 'Your cart is empty' };
        if (!data.full_name?.trim()) return { success: false, error: 'Name is required' };
        if (!data.location?.trim()) return { success: false, error: 'Service location is required' };
        if (!data.date) return { success: false, error: 'Please select a date' };
        if (!data.time) return { success: false, error: 'Please select a time' };

        const digits = (data.phone || '').replace(/\D/g, '');
        if (digits.length !== 10) return { success: false, error: 'Enter a valid 10-digit phone number' };

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Insert via service-role client (validated input; guests allowed).
        const admin = createSupabaseAdminClient();
        const { data: inserted, error } = await admin
            .from('service_bookings')
            .insert({
                user_id: user?.id || null,
                module: 'services',
                category: data.category,
                full_name: data.full_name.trim(),
                phone: digits,
                location: data.location.trim(),
                preferred_date: data.date,
                preferred_time: data.time,
                status: 'pending',
                user_latitude: data.user_latitude ?? null,
                user_longitude: data.user_longitude ?? null,
                extra_data: {
                    type: 'service-cart',
                    date: data.date,
                    time: data.time,
                    total: data.total,
                    items: data.items,
                },
            })
            .select('id')
            .single();

        if (error) {
            console.error('[createServiceCatalogBooking] insert error:', error);
            return { success: false, error: `Database error: ${error.message || 'Failed to create booking'}` };
        }

        // Auto-assign a provider if the helper is available (non-blocking).
        if (inserted?.id) {
            try {
                const { autoAssignProvider } = await import('./provider');
                await autoAssignProvider(inserted.id);
            } catch (assignErr) {
                console.warn('[createServiceCatalogBooking] Auto-assign failed (non-blocking):', assignErr);
            }
        }

        return { success: true, id: inserted?.id };
    } catch (err) {
        console.error('[createServiceCatalogBooking] Unexpected error:', err);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}
