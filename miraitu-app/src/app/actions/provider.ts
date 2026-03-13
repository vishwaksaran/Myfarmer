'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

// ─── Types ───────────────────────────────────────────────────────────

export interface ProviderBooking {
    id: string;
    user_id: string | null;
    provider_id: string | null;
    module: string;
    category: string;
    full_name: string;
    phone: string;
    location: string;
    preferred_date: string | null;
    extra_data: Record<string, unknown>;
    status: string;
    admin_notes: string | null;
    provider_notes: string | null;
    amount: number;
    commission: number;
    assigned_at: string | null;
    accepted_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProviderEarnings {
    provider_id: string;
    completed_jobs: number;
    active_jobs: number;
    total_earned: number;
    total_commission: number;
    net_earnings: number;
    this_month_jobs: number;
    this_month_earnings: number;
    this_week_jobs: number;
    this_week_earnings: number;
}

export interface ActionResult {
    success: boolean;
    error?: string;
}

// ─── Auto-assign provider to a booking ───────────────────────────────

export async function autoAssignProvider(bookingId: string): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();

        // Fetch the booking
        const { data: booking, error: fetchErr } = await supabase
            .from('service_bookings')
            .select('module, category, user_latitude, user_longitude')
            .eq('id', bookingId)
            .single();

        if (fetchErr || !booking) {
            console.error('[autoAssign] Booking not found:', fetchErr);
            return { success: false, error: 'Booking not found' };
        }

        // Call the DB function to find nearest provider
        const { data: providerId, error: rpcErr } = await supabase.rpc(
            'find_nearest_provider',
            {
                p_module: booking.module,
                p_category: booking.category,
                p_user_lat: booking.user_latitude || null,
                p_user_lng: booking.user_longitude || null,
                p_exclude_ids: [],
            }
        );

        if (rpcErr) {
            console.error('[autoAssign] RPC error:', rpcErr);
            return { success: false, error: 'Failed to find provider' };
        }

        if (!providerId) {
            console.log('[autoAssign] No available provider found for', booking.module, booking.category);
            // Booking stays unassigned — admin can manually assign later
            return { success: true }; // Not an error, just no provider available yet
        }

        // Assign the provider
        const { error: updateErr } = await supabase
            .from('service_bookings')
            .update({
                provider_id: providerId,
                status: 'assigned',
                assigned_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        if (updateErr) {
            console.error('[autoAssign] Update error:', updateErr);
            return { success: false, error: 'Failed to assign provider' };
        }

        console.log('[autoAssign] Assigned provider', providerId, 'to booking', bookingId);
        return { success: true };
    } catch (err) {
        console.error('[autoAssign] Unexpected error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// ─── Provider: Accept booking ────────────────────────────────────────

export async function acceptBooking(
    bookingId: string,
    amount?: number,
    providerNotes?: string
): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const updateData: Record<string, unknown> = {
            status: 'accepted',
            accepted_at: new Date().toISOString(),
        };
        if (amount !== undefined) {
            updateData.amount = amount;
            updateData.commission = Math.round(amount * 0.1 * 100) / 100; // 10% commission
        }
        if (providerNotes) updateData.provider_notes = providerNotes;

        const { error } = await supabase
            .from('service_bookings')
            .update(updateData)
            .eq('id', bookingId)
            .eq('provider_id', user.id);

        if (error) {
            console.error('[acceptBooking] Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('[acceptBooking] Unexpected error:', err);
        return { success: false, error: 'Failed to accept booking' };
    }
}

// ─── Provider: Reject booking (re-assign to next provider) ──────────

export async function rejectBooking(
    bookingId: string,
    reason?: string
): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        // Get the booking to re-assign
        const { data: booking, error: fetchErr } = await supabase
            .from('service_bookings')
            .select('module, category, user_latitude, user_longitude, provider_id')
            .eq('id', bookingId)
            .eq('provider_id', user.id)
            .single();

        if (fetchErr || !booking) {
            return { success: false, error: 'Booking not found' };
        }

        // Try to find the next nearest provider (excluding current one)
        const { data: nextProviderId } = await supabase.rpc(
            'find_nearest_provider',
            {
                p_module: booking.module,
                p_category: booking.category,
                p_user_lat: booking.user_latitude || null,
                p_user_lng: booking.user_longitude || null,
                p_exclude_ids: [user.id],
            }
        );

        if (nextProviderId) {
            // Re-assign to next provider
            const { error } = await supabase
                .from('service_bookings')
                .update({
                    provider_id: nextProviderId,
                    status: 'assigned',
                    assigned_at: new Date().toISOString(),
                    provider_notes: reason ? `Previous provider rejected: ${reason}` : null,
                })
                .eq('id', bookingId);

            if (error) return { success: false, error: error.message };
        } else {
            // No other provider available — set back to pending for admin
            const { error } = await supabase
                .from('service_bookings')
                .update({
                    provider_id: null,
                    status: 'pending',
                    rejected_at: new Date().toISOString(),
                    provider_notes: reason ? `Rejected: ${reason}` : null,
                })
                .eq('id', bookingId);

            if (error) return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('[rejectBooking] Unexpected error:', err);
        return { success: false, error: 'Failed to reject booking' };
    }
}

// ─── Provider: Start job (in progress) ──────────────────────────────

export async function startJob(bookingId: string): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('service_bookings')
            .update({ status: 'in_progress' })
            .eq('id', bookingId)
            .eq('provider_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[startJob] Unexpected error:', err);
        return { success: false, error: 'Failed to start job' };
    }
}

// ─── Provider: Complete job ──────────────────────────────────────────

export async function completeJob(
    bookingId: string,
    finalAmount?: number
): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const updateData: Record<string, unknown> = {
            status: 'completed',
            completed_at: new Date().toISOString(),
        };
        if (finalAmount !== undefined) {
            updateData.amount = finalAmount;
            updateData.commission = Math.round(finalAmount * 0.1 * 100) / 100;
        }

        const { error } = await supabase
            .from('service_bookings')
            .update(updateData)
            .eq('id', bookingId)
            .eq('provider_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[completeJob] Unexpected error:', err);
        return { success: false, error: 'Failed to complete job' };
    }
}

// ─── Provider: Fetch my bookings ─────────────────────────────────────

export async function fetchProviderBookings(statusFilter?: string): Promise<{
    data: ProviderBooking[];
    error?: string;
}> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not authenticated' };

        let query = supabase
            .from('service_bookings')
            .select('*')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[fetchProviderBookings] Error:', error);
            return { data: [], error: error.message };
        }

        return { data: (data as ProviderBooking[]) || [] };
    } catch (err) {
        console.error('[fetchProviderBookings] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch bookings' };
    }
}

// ─── Provider: Fetch earnings ────────────────────────────────────────

export async function fetchProviderEarnings(): Promise<{
    data: ProviderEarnings | null;
    error?: string;
}> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('provider_earnings')
            .select('*')
            .eq('provider_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('[fetchProviderEarnings] Error:', error);
            return { data: null, error: error.message };
        }

        return {
            data: data as ProviderEarnings || {
                provider_id: user.id,
                completed_jobs: 0,
                active_jobs: 0,
                total_earned: 0,
                total_commission: 0,
                net_earnings: 0,
                this_month_jobs: 0,
                this_month_earnings: 0,
                this_week_jobs: 0,
                this_week_earnings: 0,
            },
        };
    } catch (err) {
        console.error('[fetchProviderEarnings] Unexpected error:', err);
        return { data: null, error: 'Failed to fetch earnings' };
    }
}

// ─── Provider: Update availability status ────────────────────────────

export async function updateProviderAvailability(
    status: 'available' | 'busy' | 'offline'
): Promise<ActionResult> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase
            .from('profiles')
            .update({ availability_status: status, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[updateProviderAvailability] Unexpected error:', err);
        return { success: false, error: 'Failed to update availability' };
    }
}
