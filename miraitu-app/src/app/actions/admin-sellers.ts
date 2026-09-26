'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';
import { headers } from 'next/headers';
import {
    encryptPassword,
    decryptPassword,
    hashPassword,
    generateTempPassword,
} from '@/lib/seller-auth';

// ─── Seller applications, for admin ──────────────────────────────────
//
// The four-step "Register as Farmer Seller" form has written to `sellers`
// since the beginning, but nothing ever read those rows back. There was no
// admin screen, no approve or reject, and the dashboard a seller landed on
// was a static mock-up with no account behind it.
//
// This is the review side: list what came in, approve or reject it, and on
// approval mint the username and password the seller signs in with. The
// credential half mirrors CRM vendors (actions/vendor-members.ts) because
// sellers need the same handling — a password admin can read back over the
// phone, and a session version that can revoke a login instantly.

export type SellerStatus = 'pending' | 'approved' | 'rejected';

export interface SellerApplication {
    id: string;
    userId: string | null;
    sellerType: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    businessName: string | null;
    location: string | null;
    /** Everything the four steps collected, shown as a detail panel. */
    formData: Record<string, unknown>;
    images: string[];
    status: SellerStatus;
    createdAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
    /** Null until admin approves and issues a login. */
    credential: {
        id: string;
        username: string;
        displayName: string;
        status: string;
        isTempPassword: boolean;
        lastLogin: string | null;
        loginCount: number;
    } | null;
}

export interface FetchSellersResult {
    data: SellerApplication[];
    total: number;
    counts: { pending: number; approved: number; rejected: number };
    error: string | null;
}

/** The columns fetchSellerApplications selects, before mapping. */
interface SellerRow {
    id: string;
    user_id: string | null;
    seller_type: string | null;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    business_name: string | null;
    location: string | null;
    form_data: Record<string, unknown> | null;
    images: string[] | null;
    status: string | null;
    created_at: string;
    reviewed_at: string | null;
    review_note: string | null;
}

const EMPTY: FetchSellersResult = {
    data: [],
    total: 0,
    counts: { pending: 0, approved: 0, rejected: 0 },
    error: null,
};

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, error: 'Unauthorized', userId: null };

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || profile?.role !== 'admin') {
        return { ok: false as const, error: 'Forbidden', userId: null };
    }
    return { ok: true as const, error: null, userId: user.id };
}

/** Records the decision in the same activity log every other admin action uses. */
async function logSellerAction(action: string, details: Record<string, unknown>) {
    try {
        const admin = createSupabaseAdminClient();
        const { ip, userAgent } = extractRequestMeta(await headers());
        await admin.from('vendor_activity_log').insert({
            vendor_id: null,
            shop_id: null,
            action,
            details,
            ip_address: ip,
            user_agent: userAgent,
        });
    } catch (err) {
        // Never let the audit trail block the decision it is recording.
        console.error('[admin-sellers] activity log failed:', err);
    }
}

export async function fetchSellerApplications(
    { status = '', sellerType = '', search = '', page = 1, pageSize = 25 }: {
        status?: string;
        sellerType?: string;
        search?: string;
        page?: number;
        pageSize?: number;
    } = {},
): Promise<FetchSellersResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { ...EMPTY, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;

        let query = admin
            .from('sellers')
            .select(
                'id, user_id, seller_type, full_name, phone, email, business_name, location, ' +
                'form_data, images, status, created_at, reviewed_at, review_note',
                { count: 'exact' },
            )
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

        if (status) query = query.eq('status', status);
        if (sellerType) query = query.eq('seller_type', sellerType);

        const term = search.trim();
        if (term) {
            const like = `%${term.replace(/[%,()]/g, '')}%`;
            query = query.or(
                `full_name.ilike.${like},phone.ilike.${like},business_name.ilike.${like},location.ilike.${like}`,
            );
        }

        const { data, error, count } = await query;
        if (error) {
            console.error('[fetchSellerApplications]', error);
            return { ...EMPTY, error: 'Failed to load seller applications.' };
        }

        const rows = (data ?? []) as unknown as SellerRow[];

        // Attach any issued login, so the table can show who can actually sign in.
        const credsBySeller = new Map<string, SellerApplication['credential']>();
        if (rows.length > 0) {
            const { data: creds } = await admin
                .from('seller_credentials')
                .select('id, seller_id, username, display_name, status, is_temp_password, last_login, login_count')
                .in('seller_id', rows.map(r => r.id));

            for (const c of creds ?? []) {
                credsBySeller.set(c.seller_id as string, {
                    id: c.id as string,
                    username: c.username as string,
                    displayName: c.display_name as string,
                    status: c.status as string,
                    isTempPassword: !!c.is_temp_password,
                    lastLogin: (c.last_login as string | null) ?? null,
                    loginCount: (c.login_count as number) ?? 0,
                });
            }
        }

        // Status tallies for the filter chips, counted over the whole table
        // rather than the current page.
        const counts = { pending: 0, approved: 0, rejected: 0 };
        for (const s of ['pending', 'approved', 'rejected'] as const) {
            const { count: n } = await admin
                .from('sellers')
                .select('id', { count: 'exact', head: true })
                .eq('status', s);
            counts[s] = n ?? 0;
        }

        return {
            data: rows.map(r => ({
                id: r.id as string,
                userId: (r.user_id as string | null) ?? null,
                sellerType: (r.seller_type as string) || 'unknown',
                fullName: (r.full_name as string) || 'Unnamed',
                phone: (r.phone as string | null) ?? null,
                email: (r.email as string | null) ?? null,
                businessName: (r.business_name as string | null) ?? null,
                location: (r.location as string | null) ?? null,
                formData: (r.form_data as Record<string, unknown>) ?? {},
                images: (r.images as string[] | null) ?? [],
                status: ((r.status as SellerStatus) || 'pending'),
                createdAt: r.created_at as string,
                reviewedAt: (r.reviewed_at as string | null) ?? null,
                reviewNote: (r.review_note as string | null) ?? null,
                credential: credsBySeller.get(r.id as string) ?? null,
            })),
            total: count ?? 0,
            counts,
            error: null,
        };
    } catch (err) {
        console.error('[fetchSellerApplications] unexpected', err);
        return { ...EMPTY, error: 'Unexpected error.' };
    }
}

/**
 * Builds a login name from the seller's own details, e.g. "ravi.kumar".
 * A numeric suffix is added until it is free, so two farmers with the same
 * name both get one.
 */
async function uniqueUsername(
    admin: ReturnType<typeof createSupabaseAdminClient>,
    fullName: string,
    phone: string | null,
): Promise<string> {
    const base =
        fullName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 20) ||
        `seller${(phone ?? '').slice(-4)}` ||
        'seller';

    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? base : `${base}${i}`;
        const { data } = await admin
            .from('seller_credentials')
            .select('id')
            .eq('username', candidate)
            .maybeSingle();
        if (!data) return candidate;
    }
    return `${base}.${Date.now().toString().slice(-6)}`;
}

export interface ApproveResult {
    success: boolean;
    error?: string;
    /** Shown to admin once, to pass on to the seller. */
    username?: string;
    tempPassword?: string;
}

/**
 * Approves an application and issues the login that goes with it.
 *
 * Approving is what makes the seller's listings public (see
 * isSellerApproved), so the two steps are deliberately one action: there is
 * no state where a seller is approved but cannot sign in to use it.
 */
export async function approveSeller(sellerId: string): Promise<ApproveResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();

        const { data: seller, error: readErr } = await admin
            .from('sellers')
            .select('id, full_name, phone, email, seller_type, status')
            .eq('id', sellerId)
            .single();

        if (readErr || !seller) return { success: false, error: 'Application not found.' };

        const { error: updErr } = await admin
            .from('sellers')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: auth.userId,
                review_note: null,
            })
            .eq('id', sellerId);

        if (updErr) {
            console.error('[approveSeller] status update', updErr);
            return { success: false, error: 'Could not approve this application.' };
        }

        // Already has a login (re-approving after a suspension) — reactivate
        // rather than mint a second one.
        const { data: existing } = await admin
            .from('seller_credentials')
            .select('id, username')
            .eq('seller_id', sellerId)
            .maybeSingle();

        if (existing) {
            await admin
                .from('seller_credentials')
                .update({ status: 'active' })
                .eq('id', existing.id);
            await logSellerAction('seller_approved', {
                seller_id: sellerId, seller_name: seller.full_name, reissued: false,
            });
            return { success: true, username: existing.username as string };
        }

        const username = await uniqueUsername(admin, seller.full_name as string, (seller.phone as string | null) ?? null);
        const tempPassword = generateTempPassword();

        const { error: credErr } = await admin.from('seller_credentials').insert({
            seller_id: sellerId,
            username,
            password_hash: await hashPassword(tempPassword),
            password_encrypted: await encryptPassword(tempPassword),
            display_name: seller.full_name,
            phone: seller.phone,
            email: seller.email,
            status: 'active',
            is_temp_password: true,
            created_by: auth.userId,
        });

        if (credErr) {
            console.error('[approveSeller] credential insert', credErr);
            return { success: false, error: 'Approved, but could not create the login. Try issuing it again.' };
        }

        await admin
            .from('sellers')
            .update({ credentialed_at: new Date().toISOString() })
            .eq('id', sellerId);

        await logSellerAction('seller_approved', {
            seller_id: sellerId, seller_name: seller.full_name, username,
        });

        return { success: true, username, tempPassword };
    } catch (err) {
        console.error('[approveSeller] unexpected', err);
        return { success: false, error: 'Unexpected error.' };
    }
}

export async function rejectSeller(sellerId: string, note: string): Promise<{ success: boolean; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();

        const { error } = await admin
            .from('sellers')
            .update({
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: auth.userId,
                review_note: note.trim() || null,
            })
            .eq('id', sellerId);

        if (error) return { success: false, error: 'Could not reject this application.' };

        // A rejected seller must not keep a working login.
        await admin
            .from('seller_credentials')
            .update({ status: 'deactivated' })
            .eq('seller_id', sellerId);

        await logSellerAction('seller_rejected', { seller_id: sellerId, note: note.trim() || null });
        return { success: true };
    } catch (err) {
        console.error('[rejectSeller]', err);
        return { success: false, error: 'Unexpected error.' };
    }
}

/** Issues a fresh temp password and kills every existing session. */
export async function resetSellerPassword(sellerId: string): Promise<ApproveResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const { data: cred } = await admin
            .from('seller_credentials')
            .select('id, username, session_version')
            .eq('seller_id', sellerId)
            .maybeSingle();

        if (!cred) return { success: false, error: 'This seller has no login yet.' };

        const tempPassword = generateTempPassword();
        const { error } = await admin
            .from('seller_credentials')
            .update({
                password_hash: await hashPassword(tempPassword),
                password_encrypted: await encryptPassword(tempPassword),
                is_temp_password: true,
                // Bumping this logs the seller out everywhere immediately.
                session_version: ((cred.session_version as number) ?? 1) + 1,
            })
            .eq('id', cred.id);

        if (error) return { success: false, error: 'Could not reset the password.' };

        await logSellerAction('seller_password_reset', { seller_id: sellerId, username: cred.username });
        return { success: true, username: cred.username as string, tempPassword };
    } catch (err) {
        console.error('[resetSellerPassword]', err);
        return { success: false, error: 'Unexpected error.' };
    }
}

/** Reads the current password back, for admin to pass on over the phone. */
export async function revealSellerPassword(
    sellerId: string,
): Promise<{ success: boolean; password?: string; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const { data } = await admin
            .from('seller_credentials')
            .select('password_encrypted, username')
            .eq('seller_id', sellerId)
            .maybeSingle();

        if (!data) return { success: false, error: 'This seller has no login yet.' };

        await logSellerAction('seller_password_viewed', { seller_id: sellerId, username: data.username });
        return { success: true, password: await decryptPassword(data.password_encrypted as string) };
    } catch (err) {
        console.error('[revealSellerPassword]', err);
        return { success: false, error: 'Could not read that password.' };
    }
}

export async function setSellerLoginStatus(
    sellerId: string,
    status: 'active' | 'deactivated',
): Promise<{ success: boolean; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const { data: cred } = await admin
            .from('seller_credentials')
            .select('id, session_version')
            .eq('seller_id', sellerId)
            .maybeSingle();

        if (!cred) return { success: false, error: 'This seller has no login yet.' };

        const { error } = await admin
            .from('seller_credentials')
            .update({
                status,
                // Deactivating must take effect now, not when the token expires.
                session_version: status === 'deactivated'
                    ? ((cred.session_version as number) ?? 1) + 1
                    : (cred.session_version as number) ?? 1,
            })
            .eq('id', cred.id);

        if (error) return { success: false, error: 'Could not change that login.' };

        await logSellerAction(
            status === 'active' ? 'seller_login_reactivated' : 'seller_login_deactivated',
            { seller_id: sellerId },
        );
        return { success: true };
    } catch (err) {
        console.error('[setSellerLoginStatus]', err);
        return { success: false, error: 'Unexpected error.' };
    }
}
