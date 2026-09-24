'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// ─── Contact requests, for admin ──────────────────────────────────────
//
// Every "Contact Seller" / "Contact Owner" tap across Land, Buy & Sell,
// Livestock and Machinery now leaves a callback request instead of revealing
// the owner's number — see submitContactRequest in listing-contact.ts, which
// writes them into `vendor_activity_log` under the `listing_contact_request`
// action.
//
// The Activity Log screen shows those rows mixed in with vendor logins and
// product edits, which is the wrong shape for the one question admin actually
// asks of them: who asked to be called back, about what, and have we rung them
// yet. This reads the same rows back on their own so they can have a screen of
// their own.

/** One submitted callback request, flattened out of the log row's `details`. */
export interface ContactRequestRecord {
    id: string;
    createdAt: string;
    /** Who asked to be called back. */
    requesterName: string;
    requesterPhone: string;
    requesterEmail: string | null;
    /** The signed-in account behind the request, for cross-referencing Users. */
    userId: string | null;
    /** What they wrote, when they wrote anything. */
    message: string | null;
    /** The listing they are asking about. */
    listingId: string | null;
    listingType: string | null;
    listingTitle: string | null;
    location: string | null;
    /** The other side of the introduction — admin's to dial, never the buyer's. */
    sellerName: string | null;
    sellerPhone: string | null;
    ipAddress: string | null;
}

interface FetchContactRequestsInput {
    page?: number;
    pageSize?: number;
    /** 'livestock', 'machinery_rent', 'land_sell', … Empty for all. */
    listingType?: string;
    /** Matches requester name, requester phone or listing title. */
    search?: string;
}

export interface FetchContactRequestsResult {
    data: ContactRequestRecord[];
    total: number;
    /** Every listing type present in the table, so the filter lists only real ones. */
    listingTypes: string[];
    error: string | null;
}

const EMPTY: FetchContactRequestsResult = { data: [], total: 0, listingTypes: [], error: null };

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, error: 'Unauthorized' };

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || profile?.role !== 'admin') {
        return { ok: false as const, error: 'Forbidden' };
    }
    return { ok: true as const };
}

/** `details` is jsonb, so everything arrives as unknown — read it defensively. */
function str(details: Record<string, unknown>, key: string): string | null {
    const v = details?.[key];
    if (v === null || v === undefined || v === '') return null;
    return String(v);
}

export async function fetchContactRequests(
    { page = 1, pageSize = 30, listingType = '', search = '' }: FetchContactRequestsInput = {}
): Promise<FetchContactRequestsResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { ...EMPTY, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = admin
            .from('vendor_activity_log')
            .select('id, details, ip_address, created_at', { count: 'exact' })
            .eq('action', 'listing_contact_request')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (listingType) {
            query = query.eq('details->>listing_type', listingType);
        }

        const term = search.trim();
        if (term) {
            // PostgREST needs the commas inside a single `or` string; the jsonb
            // fields are compared as text, which is what `->>` gives us.
            const like = `%${term.replace(/[%,()]/g, '')}%`;
            query = query.or(
                `details->>user_name.ilike.${like},` +
                `details->>user_phone.ilike.${like},` +
                `details->>listing_title.ilike.${like}`
            );
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[fetchContactRequests] Fetch error:', error);
            return { ...EMPTY, error: 'Failed to fetch contact requests.' };
        }

        // The filter dropdown lists only types that actually occur. Read from a
        // separate slim query rather than the page above, or the options would
        // change every time admin paged.
        let listingTypes: string[] = [];
        const { data: typeRows } = await admin
            .from('vendor_activity_log')
            .select('details')
            .eq('action', 'listing_contact_request')
            .limit(1000);
        if (typeRows) {
            listingTypes = Array.from(new Set(
                typeRows
                    .map(r => str((r.details || {}) as Record<string, unknown>, 'listing_type'))
                    .filter((t): t is string => !!t)
            )).sort();
        }

        const records: ContactRequestRecord[] = (data || []).map(row => {
            const d = (row.details || {}) as Record<string, unknown>;
            return {
                id: row.id as string,
                createdAt: row.created_at as string,
                requesterName: str(d, 'user_name') || 'Unknown',
                requesterPhone: str(d, 'user_phone') || '',
                requesterEmail: str(d, 'user_email'),
                userId: str(d, 'user_id'),
                message: str(d, 'message'),
                listingId: str(d, 'listing_id'),
                listingType: str(d, 'listing_type'),
                listingTitle: str(d, 'listing_title'),
                location: str(d, 'location'),
                sellerName: str(d, 'seller_name'),
                sellerPhone: str(d, 'seller_phone'),
                ipAddress: (row.ip_address as string | null) ?? null,
            };
        });

        return { data: records, total: count || 0, listingTypes, error: null };
    } catch (err) {
        console.error('[fetchContactRequests] Unexpected error:', err);
        return { ...EMPTY, error: 'Unexpected error.' };
    }
}
