'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// ─── Types ───────────────────────────────────────────────────────────

export interface RentalCartLineInput {
    category: string;
    itemId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    answers: Record<string, string>;
}

export interface CreateRentalBookingInput {
    /** Machinery category slug — jcb, harvesters, drones, etc. */
    category: string;
    full_name: string;
    phone: string;
    location: string;
    start_date: string; // YYYY-MM-DD
    start_time: string; // HH:mm
    end_date: string;   // YYYY-MM-DD
    end_time: string;   // HH:mm
    items: RentalCartLineInput[];
    total: number;
    user_latitude?: number;
    user_longitude?: number;
}

export interface RentalBookingResult {
    success: boolean;
    error?: string;
    id?: string;
}

export interface MyRentalBooking {
    id: string;
    category: string;
    full_name: string;
    phone: string;
    location: string;
    status: string;
    created_at: string;
    start_date: string | null;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;
    total: number;
    items: RentalCartLineInput[];
}

// ─── Create a rental booking (no payment — just store it) ─────────────

export async function createRentalBooking(
    data: CreateRentalBookingInput
): Promise<RentalBookingResult> {
    try {
        if (!data.items?.length) return { success: false, error: 'Your cart is empty' };
        if (!data.full_name?.trim()) return { success: false, error: 'Name is required' };
        if (!data.location?.trim()) return { success: false, error: 'Service location is required' };
        if (!data.start_date || !data.start_time) return { success: false, error: 'Select a start date & time' };
        if (!data.end_date || !data.end_time) return { success: false, error: 'Select an end date & time' };

        const digits = (data.phone || '').replace(/\D/g, '');
        if (digits.length !== 10) return { success: false, error: 'Enter a valid 10-digit phone number' };

        const start = new Date(`${data.start_date}T${data.start_time}`);
        const end = new Date(`${data.end_date}T${data.end_time}`);
        if (end <= start) return { success: false, error: 'End time must be after the start time' };

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Insert via service-role client (validated input; guests allowed).
        const admin = createSupabaseAdminClient();
        const { data: inserted, error } = await admin
            .from('service_bookings')
            .insert({
                user_id: user?.id || null,
                module: 'machinery',
                category: data.category,
                full_name: data.full_name.trim(),
                phone: digits,
                location: data.location.trim(),
                preferred_date: data.start_date,
                status: 'pending',
                user_latitude: data.user_latitude ?? null,
                user_longitude: data.user_longitude ?? null,
                extra_data: {
                    type: 'rental',
                    start_date: data.start_date,
                    start_time: data.start_time,
                    end_date: data.end_date,
                    end_time: data.end_time,
                    total: data.total,
                    items: data.items,
                },
            })
            .select('id')
            .single();

        if (error) {
            console.error('[createRentalBooking] insert error:', error);
            return { success: false, error: `Database error: ${error.message || 'Failed to create booking'}` };
        }

        return { success: true, id: inserted?.id };
    } catch (err) {
        console.error('[createRentalBooking] Unexpected error:', err);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// ─── Fetch the current user's machinery rental bookings ──────────────

export async function fetchMyRentalBookings(): Promise<{ data: MyRentalBooking[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not signed in' };

        // RLS policy "Users can view own bookings" scopes this to the current user.
        const { data, error } = await supabase
            .from('service_bookings')
            .select('id, category, full_name, phone, location, status, created_at, extra_data')
            .eq('module', 'machinery')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[fetchMyRentalBookings] error:', error);
            return { data: [], error: error.message };
        }

        const rows = (data ?? []).map((row): MyRentalBooking => {
            const extra = (row.extra_data ?? {}) as Record<string, unknown>;
            return {
                id: row.id as string,
                category: row.category as string,
                full_name: row.full_name as string,
                phone: row.phone as string,
                location: row.location as string,
                status: row.status as string,
                created_at: row.created_at as string,
                start_date: (extra.start_date as string) ?? null,
                start_time: (extra.start_time as string) ?? null,
                end_date: (extra.end_date as string) ?? null,
                end_time: (extra.end_time as string) ?? null,
                total: (extra.total as number) ?? 0,
                items: (extra.items as RentalCartLineInput[]) ?? [],
            };
        });

        return { data: rows };
    } catch (err) {
        console.error('[fetchMyRentalBookings] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch bookings' };
    }
}

// ─── Cancel a booking (only the owner can cancel) ────────────────────

export async function cancelMyBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to cancel a booking' };

        // Ownership is enforced by matching user_id; admin client bypasses the
        // (admin-only) UPDATE RLS policy while we still verify the owner here.
        const admin = createSupabaseAdminClient();
        const { data: updated, error } = await admin
            .from('service_bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .select('id')
            .single();

        if (error) {
            console.error('[cancelMyBooking] error:', error);
            return { success: false, error: error.message };
        }
        if (!updated) return { success: false, error: 'Booking not found' };

        return { success: true };
    } catch (err) {
        console.error('[cancelMyBooking] Unexpected error:', err);
        return { success: false, error: 'Failed to cancel booking' };
    }
}
