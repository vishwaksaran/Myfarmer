'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

// ─── Types ───────────────────────────────────────────────────────────

export interface BookingFormData {
    module: string;       // e.g. 'services', 'land', 'borewell', 'fencing', 'cctv', 'protection'
    category: string;     // e.g. 'harvester', 'sell', 'rent', 'storage-godown'
    full_name: string;
    phone: string;
    location: string;
    preferred_date?: string;
    extra_data?: Record<string, unknown>; // any module-specific fields
}

export interface BookingResult {
    success: boolean;
    error?: string;
    id?: string;
}

// ─── Submit Booking (used by all forms) ──────────────────────────────

export async function submitBooking(data: BookingFormData): Promise<BookingResult> {
    try {
        // Validate required fields
        if (!data.full_name?.trim()) return { success: false, error: 'Name is required' };
        if (!data.phone?.trim()) return { success: false, error: 'Phone number is required' };
        if (!data.location?.trim()) return { success: false, error: 'Location is required' };

        const digits = data.phone.replace(/\D/g, '');
        if (digits.length !== 10) return { success: false, error: 'Enter a valid 10-digit phone number' };

        const supabase = await createSupabaseServerClient();

        // Get current user (optional — guests can also book)
        const { data: { user } } = await supabase.auth.getUser();

        console.log('[submitBooking] User:', user?.id || 'GUEST', 'Module:', data.module, 'Category:', data.category);

        const { error } = await supabase
            .from('service_bookings')
            .insert({
                user_id: user?.id || null,
                module: data.module,
                category: data.category,
                full_name: data.full_name.trim(),
                phone: digits,
                location: data.location.trim(),
                preferred_date: data.preferred_date || null,
                extra_data: data.extra_data || {},
                status: 'pending',
            });

        if (error) {
            console.error('[submitBooking] Supabase insert error:', error);
            return { success: false, error: `Database error: ${error.message || 'Failed to submit booking'}` };
        }

        console.log('[submitBooking] Booking created successfully');
        return { success: true };
    } catch (err) {
        console.error('[submitBooking] Unexpected error:', err);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// ─── Admin: Fetch all bookings ───────────────────────────────────────

export interface BookingRecord {
    id: string;
    user_id: string | null;
    module: string;
    category: string;
    full_name: string;
    phone: string;
    location: string;
    preferred_date: string | null;
    extra_data: Record<string, unknown>;
    status: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

export async function fetchAllBookings(filters?: {
    module?: string;
    category?: string;
    status?: string;
}): Promise<{ data: BookingRecord[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();

        let query = supabase
            .from('service_bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.module) query = query.eq('module', filters.module);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;

        if (error) {
            console.error('[fetchAllBookings] Error:', error);
            return { data: [], error: error.message };
        }

        return { data: data as BookingRecord[] };
    } catch (err) {
        console.error('[fetchAllBookings] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch bookings' };
    }
}

// ─── Admin: Update booking status ────────────────────────────────────

export async function updateBookingStatus(
    bookingId: string,
    status: string,
    admin_notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();

        const updateData: Record<string, unknown> = { status };
        if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

        const { error } = await supabase
            .from('service_bookings')
            .update(updateData)
            .eq('id', bookingId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('[updateBookingStatus] Error:', err);
        return { success: false, error: 'Failed to update booking' };
    }
}

// ─── Admin: Fetch all users/profiles ─────────────────────────────────

export interface UserRecord {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    farm_location: string | null;
    created_at: string;
    updated_at: string;
    email?: string;
}

export async function fetchAllUsers(): Promise<{ data: UserRecord[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[fetchAllUsers] Error:', error);
            return { data: [], error: error.message };
        }

        return { data: data as UserRecord[] };
    } catch (err) {
        console.error('[fetchAllUsers] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch users' };
    }
}
