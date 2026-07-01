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

// ─── Analytics / Contacts / Notifications types ──────────────────────

export interface ProviderAnalytics {
    total_inquiries: number;
    status_counts: {
        assigned: number;
        accepted: number;
        in_progress: number;
        completed: number;
        pending: number;
        cancelled: number;
    };
    unique_customers: number;
    repeat_customers: number;
    engagement_rate: number; // % of received jobs that were accepted (or beyond)
    this_month_earnings: number;
    monthly_trend: { month: string; label: string; bookings: number; earnings: number }[];
}

export interface ProviderContact {
    booking_id: string;
    customer_key: string;
    full_name: string;
    phone: string;
    service: string;
    status: string;
    created_at: string;
    is_repeat: boolean;
    order_count: number;
}

export interface ProviderContactsResult {
    contacts: ProviderContact[];
    total_customers: number;
    repeat_customers: number;
}

export interface ProviderNotification {
    id: string;
    type: 'new_request' | 'status_update' | 'payment';
    icon: string;
    title: string;
    message: string;
    timestamp: string;
    status: string;
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

// ─── Shared helper: fetch this provider's raw bookings ────────────────

async function loadProviderBookingRows(): Promise<{ rows: ProviderBooking[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { rows: [], error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[loadProviderBookingRows] Error:', error);
        return { rows: [], error: error.message };
    }
    return { rows: (data as ProviderBooking[]) || [] };
}

/** Stable key identifying a customer across bookings (user_id, else phone). */
function customerKey(b: ProviderBooking): string {
    return b.user_id || b.phone || b.full_name || b.id;
}

// ─── Provider: Analytics ─────────────────────────────────────────────

export async function fetchProviderAnalytics(): Promise<{
    data: ProviderAnalytics | null;
    error?: string;
}> {
    try {
        const { rows, error } = await loadProviderBookingRows();
        if (error) return { data: null, error };

        const status_counts = {
            assigned: 0, accepted: 0, in_progress: 0,
            completed: 0, pending: 0, cancelled: 0,
        };
        for (const b of rows) {
            if (b.status in status_counts) {
                status_counts[b.status as keyof typeof status_counts]++;
            }
        }

        // Unique + repeat customers
        const countByCustomer = new Map<string, number>();
        for (const b of rows) {
            const key = customerKey(b);
            countByCustomer.set(key, (countByCustomer.get(key) || 0) + 1);
        }
        const unique_customers = countByCustomer.size;
        const repeat_customers = [...countByCustomer.values()].filter(c => c > 1).length;

        const total_inquiries = rows.length;
        const engagedJobs = status_counts.accepted + status_counts.in_progress + status_counts.completed;
        const engagement_rate = total_inquiries > 0
            ? Math.round((engagedJobs / total_inquiries) * 100)
            : 0;

        // Monthly trend — last 6 months of received bookings + completed earnings
        const now = new Date();
        const monthKeys: { key: string; label: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthKeys.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleString('en-IN', { month: 'short' }),
            });
        }
        const trendMap = new Map(monthKeys.map(m => [m.key, { month: m.key, label: m.label, bookings: 0, earnings: 0 }]));
        let this_month_earnings = 0;
        const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        for (const b of rows) {
            const created = new Date(b.created_at);
            const ck = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
            const bucket = trendMap.get(ck);
            if (bucket) bucket.bookings++;
            if (b.status === 'completed') {
                const net = (b.amount || 0) - (b.commission || 0);
                const completed = b.completed_at ? new Date(b.completed_at) : created;
                const compKey = `${completed.getFullYear()}-${String(completed.getMonth() + 1).padStart(2, '0')}`;
                const eBucket = trendMap.get(compKey);
                if (eBucket) eBucket.earnings += net;
                if (compKey === thisMonthKey) this_month_earnings += net;
            }
        }

        return {
            data: {
                total_inquiries,
                status_counts,
                unique_customers,
                repeat_customers,
                engagement_rate,
                this_month_earnings,
                monthly_trend: [...trendMap.values()],
            },
        };
    } catch (err) {
        console.error('[fetchProviderAnalytics] Unexpected error:', err);
        return { data: null, error: 'Failed to fetch analytics' };
    }
}

// ─── Provider: Customer contact history ──────────────────────────────

export async function fetchProviderContacts(): Promise<{
    data: ProviderContactsResult;
    error?: string;
}> {
    const empty: ProviderContactsResult = { contacts: [], total_customers: 0, repeat_customers: 0 };
    try {
        const { rows, error } = await loadProviderBookingRows();
        if (error) return { data: empty, error };

        const countByCustomer = new Map<string, number>();
        for (const b of rows) {
            const key = customerKey(b);
            countByCustomer.set(key, (countByCustomer.get(key) || 0) + 1);
        }

        const contacts: ProviderContact[] = rows.map(b => {
            const key = customerKey(b);
            const orderCount = countByCustomer.get(key) || 1;
            return {
                booking_id: b.id,
                customer_key: key,
                full_name: b.full_name,
                phone: b.phone,
                service: b.module === 'services' ? b.category : b.module,
                status: b.status,
                created_at: b.created_at,
                is_repeat: orderCount > 1,
                order_count: orderCount,
            };
        });

        const total_customers = countByCustomer.size;
        const repeat_customers = [...countByCustomer.values()].filter(c => c > 1).length;

        return { data: { contacts, total_customers, repeat_customers } };
    } catch (err) {
        console.error('[fetchProviderContacts] Unexpected error:', err);
        return { data: empty, error: 'Failed to fetch contacts' };
    }
}

// ─── Provider: Derived notification feed ─────────────────────────────

export async function fetchProviderNotifications(): Promise<{
    data: ProviderNotification[];
    error?: string;
}> {
    try {
        const { rows, error } = await loadProviderBookingRows();
        if (error) return { data: [], error };

        const items: ProviderNotification[] = [];
        for (const b of rows) {
            const service = b.module === 'services' ? b.category : b.module;
            if (b.status === 'assigned') {
                items.push({
                    id: `${b.id}-new`,
                    type: 'new_request',
                    icon: 'notifications_active',
                    title: 'New request received',
                    message: `${b.full_name} requested ${service}`,
                    timestamp: b.assigned_at || b.created_at,
                    status: b.status,
                });
            }
            if (['accepted', 'in_progress', 'completed'].includes(b.status)) {
                items.push({
                    id: `${b.id}-status`,
                    type: 'status_update',
                    icon: b.status === 'completed' ? 'task_alt' : 'engineering',
                    title: `Job ${b.status.replace('_', ' ')}`,
                    message: `${service} for ${b.full_name}`,
                    timestamp: b.status === 'completed'
                        ? (b.completed_at || b.updated_at)
                        : (b.accepted_at || b.updated_at),
                    status: b.status,
                });
            }
            if (b.status === 'completed' && (b.amount || 0) > 0) {
                const net = (b.amount || 0) - (b.commission || 0);
                items.push({
                    id: `${b.id}-payment`,
                    type: 'payment',
                    icon: 'payments',
                    title: 'Payment recorded',
                    message: `₹${net.toLocaleString('en-IN')} earned from ${b.full_name}`,
                    timestamp: b.completed_at || b.updated_at,
                    status: b.status,
                });
            }
        }

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return { data: items.slice(0, 40) };
    } catch (err) {
        console.error('[fetchProviderNotifications] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch notifications' };
    }
}
