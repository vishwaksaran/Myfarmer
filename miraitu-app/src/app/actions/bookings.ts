'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// ─── Types ───────────────────────────────────────────────────────────

export interface BookingFormData {
    module: string;       // e.g. 'services', 'land', 'borewell', 'fencing', 'cctv', 'protection'
    category: string;     // e.g. 'harvester', 'sell', 'rent', 'storage-godown'
    full_name: string;
    phone: string;
    location: string;
    preferred_date?: string;
    extra_data?: Record<string, unknown>; // any module-specific fields
    user_latitude?: number;
    user_longitude?: number;
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

        const { data: insertedBooking, error } = await supabase
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
                user_latitude: data.user_latitude || null,
                user_longitude: data.user_longitude || null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('[submitBooking] Supabase insert error:', error);
            return { success: false, error: `Database error: ${error.message || 'Failed to submit booking'}` };
        }

        // Auto-assign a provider if available
        if (insertedBooking?.id) {
            try {
                const { autoAssignProvider } = await import('./provider');
                await autoAssignProvider(insertedBooking.id);
            } catch (assignErr) {
                // Non-blocking — booking is still created; admin can assign manually
                console.warn('[submitBooking] Auto-assign failed (non-blocking):', assignErr);
            }
        }

        console.log('[submitBooking] Booking created successfully');
        return { success: true, id: insertedBooking?.id };
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
    // Enriched from auth + profiles (populated by fetchAllBookings)
    auth_provider?: 'google' | 'phone' | 'email' | string;
    user_email?: string;
    user_display_name?: string;
}

export async function fetchAllBookings(filters?: {
    module?: string;
    category?: string;
    status?: string;
}): Promise<{ data: BookingRecord[]; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

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

        // Enrich bookings with user auth info (sign-in method, email, display name)
        const bookings = data as BookingRecord[];
        const userIds = [...new Set(bookings.map(b => b.user_id).filter(Boolean))] as string[];

        if (userIds.length > 0) {
            try {
                // Fetch auth data for all users who made bookings
                const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
                const authMap = new Map<string, { email?: string; provider: string; displayName?: string }>();
                if (authData?.users) {
                    for (const u of authData.users) {
                        const provider = u.app_metadata?.provider ||
                            (u.identities?.[0]?.provider) || 'email';
                        const meta = u.user_metadata || {};
                        authMap.set(u.id, {
                            email: u.email || undefined,
                            provider,
                            displayName: meta.full_name || meta.name || meta.display_name || undefined,
                        });
                    }
                }

                // Fetch profile names for users (in case display_name differs from booking full_name)
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone')
                    .in('id', userIds);
                const profileMap = new Map<string, { full_name?: string; phone?: string }>();
                if (profiles) {
                    for (const p of profiles) {
                        profileMap.set(p.id, { full_name: p.full_name, phone: p.phone });
                    }
                }

                for (const booking of bookings) {
                    if (booking.user_id) {
                        const auth = authMap.get(booking.user_id);
                        const profile = profileMap.get(booking.user_id);
                        if (auth) {
                            booking.auth_provider = auth.provider;
                            booking.user_email = auth.email;
                            booking.user_display_name = auth.displayName || profile?.full_name || undefined;
                        }
                    }
                }
            } catch (enrichErr) {
                console.warn('[fetchAllBookings] Could not enrich with auth data:', enrichErr);
            }
        }

        return { data: bookings };
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
        const supabase = createSupabaseAdminClient();

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
    auth_provider?: 'google' | 'phone' | 'email' | string; // Sign-in method
    last_sign_in?: string; // ISO timestamp
    // Provider-specific fields (populated when role = service_provider)
    service_types?: string[];
    availability_status?: string;
    address?: string | null;
    pincode?: string | null;
    district?: string | null;
    state?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    whatsapp_number?: string | null;
    bio?: string | null;
    // Onboarding fields
    interests?: string[];
    onboarding_completed?: boolean;
    farm_size?: string | null;
    experience_years?: string | null;
    preferred_language?: string | null;
    device_type?: string | null;
    last_login_device?: string | null;
}

// ─── Admin: Fetch provider earnings by ID ────────────────────────────

export interface ProviderEarningsSummary {
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

export async function fetchProviderEarningsById(
    providerId: string
): Promise<{ data: ProviderEarningsSummary | null; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('provider_earnings')
            .select('*')
            .eq('provider_id', providerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[fetchProviderEarningsById] Error:', error);
            return { data: null, error: error.message };
        }

        return {
            data: (data as ProviderEarningsSummary) || {
                provider_id: providerId,
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
        console.error('[fetchProviderEarningsById] Unexpected error:', err);
        return { data: null, error: 'Failed to fetch provider earnings' };
    }
}

export async function fetchAllUsers(): Promise<{ data: UserRecord[]; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[fetchAllUsers] Error:', error);
            return { data: [], error: error.message };
        }

        // Merge email + auth provider from auth.users
        try {
            const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (authData?.users) {
                const authMap = new Map<string, { email?: string; provider: string; lastSignIn?: string }>();
                for (const u of authData.users) {
                    const provider = u.app_metadata?.provider ||
                        (u.identities?.[0]?.provider) || 'email';
                    authMap.set(u.id, {
                        email: u.email || undefined,
                        provider,
                        lastSignIn: u.last_sign_in_at || undefined,
                    });
                }
                const merged = (data as UserRecord[]).map(profile => {
                    const auth = authMap.get(profile.id);
                    return {
                        ...profile,
                        email: auth?.email || profile.email || undefined,
                        auth_provider: auth?.provider || undefined,
                        last_sign_in: auth?.lastSignIn || undefined,
                    };
                });
                return { data: merged };
            }
        } catch (authErr) {
            console.warn('[fetchAllUsers] Could not fetch auth emails:', authErr);
        }

        return { data: data as UserRecord[] };
    } catch (err) {
        console.error('[fetchAllUsers] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch users' };
    }
}

// ─── Admin: Fetch single user profile ────────────────────────────────

export async function fetchUserById(userId: string): Promise<{ data: UserRecord | null; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[fetchUserById] Error:', error);
            return { data: null, error: error.message };
        }

        // Merge email + auth provider from auth.users
        const profile = data as UserRecord;
        try {
            const { data: authData } = await supabase.auth.admin.getUserById(userId);
            if (authData?.user) {
                if (!profile.email && authData.user.email) {
                    profile.email = authData.user.email;
                }
                profile.auth_provider = authData.user.app_metadata?.provider ||
                    (authData.user.identities?.[0]?.provider) || 'email';
                profile.last_sign_in = authData.user.last_sign_in_at || undefined;
            }
        } catch { /* auth lookup optional */ }

        return { data: profile };
    } catch (err) {
        console.error('[fetchUserById] Unexpected error:', err);
        return { data: null, error: 'Failed to fetch user' };
    }
}

// ─── Admin: Fetch bookings for a specific user ──────────────────────

export async function fetchUserBookings(userId: string): Promise<{ data: BookingRecord[]; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('service_bookings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[fetchUserBookings] Error:', error);
            return { data: [], error: error.message };
        }

        return { data: data as BookingRecord[] };
    } catch (err) {
        console.error('[fetchUserBookings] Unexpected error:', err);
        return { data: [], error: 'Failed to fetch user bookings' };
    }
}

// ─── Admin: Delete a booking ─────────────────────────────────────────

export async function deleteBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('service_bookings')
            .delete()
            .eq('id', bookingId);

        if (error) {
            console.error('[deleteBooking] Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('[deleteBooking] Unexpected error:', err);
        return { success: false, error: 'Failed to delete booking' };
    }
}

// ─── Admin: Update a user profile ────────────────────────────────────

export async function updateUserProfile(
    userId: string,
    data: Partial<Pick<UserRecord, 'full_name' | 'phone' | 'role' | 'farm_location' | 'availability_status' | 'bio'>>
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('profiles')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('[updateUserProfile] Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('[updateUserProfile] Unexpected error:', err);
        return { success: false, error: 'Failed to update user' };
    }
}

// ─── Admin: Delete a user (profile + auth) ──────────────────────────

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createSupabaseAdminClient();

        // 1. Delete user's bookings
        await supabase
            .from('service_bookings')
            .delete()
            .eq('user_id', userId);

        // 2. Delete user's profile
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('[deleteUser] Profile delete error:', profileError);
            return { success: false, error: profileError.message };
        }

        // 3. Delete from Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
            console.error('[deleteUser] Auth delete error:', authError);
            // Profile already deleted, so still partial success
            return { success: true, error: `Profile deleted but auth cleanup failed: ${authError.message}` };
        }

        return { success: true };
    } catch (err) {
        console.error('[deleteUser] Unexpected error:', err);
        return { success: false, error: 'Failed to delete user' };
    }
}
