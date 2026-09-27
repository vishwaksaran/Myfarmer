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

/**
 * Where a callback request came from.
 *
 * 'listing'     — someone tapped Contact Seller on an ad and left their number.
 * 'requirement' — someone used Post Your Requirement to say what they want,
 *                 with no particular ad in mind.
 *
 * Both are the same job for admin: ring this person back. They sit in one
 * inbox rather than two screens, because splitting them would mean checking
 * two places to find out who is waiting on a call.
 */
export type ContactRequestSource = 'listing' | 'requirement';

/** What a buyer asked for when there was no listing behind the request. */
export interface RequirementDetail {
    category: string;
    productModel: string | null;
    /** 'new' | 'used' | 'any'. */
    condition: string;
    quantity: string | null;
    budget: string | null;
    neededBy: string | null;
    /** Reference photos the buyer attached. */
    images: string[];
    /**
     * Answers to the questions that only apply to this category — breed
     * and milk yield for a cow, horsepower and hours run for a tractor.
     * See CATEGORY_QUESTIONS in lib/requirement-options.ts.
     */
    details: Record<string, string>;
    /** 'new' | 'in_progress' | 'fulfilled' | 'closed'. */
    status: string;
    adminNote: string | null;
}

/** One submitted callback request, from either source. */
export interface ContactRequestRecord {
    id: string;
    source: ContactRequestSource;
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
    /** Populated only when `source` is 'requirement'. */
    requirement: RequirementDetail | null;
}

interface FetchContactRequestsInput {
    page?: number;
    pageSize?: number;
    /** 'livestock', 'machinery_rent', 'land_sell', … Empty for all. */
    listingType?: string;
    /** Matches requester name, requester phone or listing title. */
    search?: string;
    /** Narrow to one source. Empty shows both. */
    source?: string;
}

export interface FetchContactRequestsResult {
    data: ContactRequestRecord[];
    total: number;
    /** Every listing type present in the table, so the filter lists only real ones. */
    listingTypes: string[];
    /** How many of each source matched, for the filter chips. */
    counts: { listing: number; requirement: number };
    error: string | null;
}

const EMPTY: FetchContactRequestsResult = {
    data: [], total: 0, listingTypes: [], counts: { listing: 0, requirement: 0 }, error: null,
};

/**
 * Both sources are read in full and merged in memory, then paged.
 *
 * They live in different tables with different shapes, so there is no single
 * query to page over. This is bounded rather than clever: at these volumes it
 * is a couple of hundred rows, and the cap keeps it that way if it grows.
 */
const MERGE_CAP = 500;

/**
 * The buyer_requirements columns this reads.
 *
 * Spelled out because the generated Supabase types predate migration 035, so
 * without it every field infers as an error shape.
 */
interface RequirementRow {
    id: string;
    user_id: string | null;
    category: string | null;
    product_model: string | null;
    condition: string | null;
    quantity: string | null;
    budget: string | null;
    location: string | null;
    needed_by: string | null;
    notes: string | null;
    images: string[] | null;
    full_name: string | null;
    phone: string | null;
    status: string | null;
    admin_note: string | null;
    details: Record<string, string> | null;
    created_at: string;
    ip_address: string | null;
}

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
    { page = 1, pageSize = 30, listingType = '', search = '', source = '' }: FetchContactRequestsInput = {}
): Promise<FetchContactRequestsResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { ...EMPTY, error: auth.error };

    const term = search.trim();
    const like = '%' + term.replace(/[%,()]/g, '') + '%';

    try {
        const admin = createSupabaseAdminClient();
        const merged: ContactRequestRecord[] = [];
        let listingTypes: string[] = [];

        // ── Source 1: someone tapped Contact Seller on a listing ─────────
        if (source !== 'requirement') {
            let query = admin
                .from('vendor_activity_log')
                .select('id, details, ip_address, created_at')
                .eq('action', 'listing_contact_request')
                .order('created_at', { ascending: false })
                .limit(MERGE_CAP);

            if (listingType) query = query.eq('details->>listing_type', listingType);
            if (term) {
                // PostgREST needs the commas inside a single or string; the
                // jsonb fields are compared as text, which is what ->> gives.
                query = query.or(
                    'details->>user_name.ilike.' + like + ',' +
                    'details->>user_phone.ilike.' + like + ',' +
                    'details->>listing_title.ilike.' + like,
                );
            }

            const { data, error } = await query;
            if (error) {
                console.error('[fetchContactRequests] listing fetch error:', error);
                return { ...EMPTY, error: 'Failed to fetch contact requests.' };
            }

            for (const row of data ?? []) {
                const d = (row.details || {}) as Record<string, unknown>;
                merged.push({
                    id: row.id as string,
                    source: 'listing',
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
                    requirement: null,
                });
            }

            // The type dropdown lists only what actually occurs, read
            // separately so the options do not change as admin pages.
            const { data: typeRows } = await admin
                .from('vendor_activity_log')
                .select('details')
                .eq('action', 'listing_contact_request')
                .limit(1000);
            if (typeRows) {
                listingTypes = Array.from(new Set(
                    typeRows
                        .map(r => str((r.details || {}) as Record<string, unknown>, 'listing_type'))
                        .filter((t): t is string => !!t),
                )).sort();
            }
        }

        // ── Source 2: someone posted a requirement, no listing involved ──
        //
        // A missing table is survivable on purpose: migration 035 may not be
        // applied yet, and losing the listing callbacks over that would be a
        // worse failure than quietly showing one source.
        if (source !== 'listing' && !listingType) {
            try {
                let rq = admin
                    .from('buyer_requirements')
                    .select('id, user_id, category, product_model, condition, quantity, budget, ' +
                        'location, needed_by, notes, images, full_name, phone, status, admin_note, details, ' +
                        'created_at, ip_address')
                    .order('created_at', { ascending: false })
                    .limit(MERGE_CAP);

                if (term) {
                    rq = rq.or(
                        'full_name.ilike.' + like + ',' +
                        'phone.ilike.' + like + ',' +
                        'product_model.ilike.' + like + ',' +
                        'category.ilike.' + like + ',' +
                        'location.ilike.' + like,
                    );
                }

                let { data: rows, error: rqError } = await rq;

                // Same reason as the insert side: `details` arrived with
                // migration 036, and losing every requirement from the inbox
                // over one missing column would be the worse failure.
                if (rqError && /details/i.test(rqError.message ?? '')) {
                    console.warn('[fetchContactRequests] details column missing — reading without it');
                    let retry = admin
                        .from('buyer_requirements')
                        .select('id, user_id, category, product_model, condition, quantity, budget, ' +
                            'location, needed_by, notes, images, full_name, phone, status, admin_note, ' +
                            'created_at, ip_address')
                        .order('created_at', { ascending: false })
                        .limit(MERGE_CAP);
                    if (term) {
                        retry = retry.or(
                            'full_name.ilike.' + like + ',' +
                            'phone.ilike.' + like + ',' +
                            'product_model.ilike.' + like + ',' +
                            'category.ilike.' + like + ',' +
                            'location.ilike.' + like,
                        );
                    }
                    ({ data: rows, error: rqError } = await retry);
                }

                if (rqError) throw rqError;

                for (const r of ((rows ?? []) as unknown as RequirementRow[])) {
                    merged.push({
                        id: r.id as string,
                        source: 'requirement',
                        createdAt: r.created_at as string,
                        requesterName: (r.full_name as string) || 'Unknown',
                        requesterPhone: (r.phone as string) || '',
                        requesterEmail: null,
                        userId: (r.user_id as string | null) ?? null,
                        message: (r.notes as string | null) ?? null,
                        listingId: null,
                        listingType: null,
                        // What they want, stated where a listing title would be,
                        // so one row reads the same whichever source it came from.
                        listingTitle: [r.category, r.product_model].filter(Boolean).join(' — ') || null,
                        location: (r.location as string | null) ?? null,
                        sellerName: null,
                        sellerPhone: null,
                        ipAddress: (r.ip_address as string | null) ?? null,
                        requirement: {
                            category: (r.category as string) || 'Other',
                            productModel: (r.product_model as string | null) ?? null,
                            condition: (r.condition as string) || 'any',
                            quantity: (r.quantity as string | null) ?? null,
                            budget: (r.budget as string | null) ?? null,
                            neededBy: (r.needed_by as string | null) ?? null,
                            images: ((r.images as string[] | null) ?? []).filter(Boolean),
                            details: (r.details ?? {}) as Record<string, string>,
                            status: (r.status as string) || 'new',
                            adminNote: (r.admin_note as string | null) ?? null,
                        },
                    });
                }
            } catch (err) {
                console.warn('[fetchContactRequests] requirements unavailable:', err);
            }
        }

        // Newest first across both sources, then page.
        merged.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

        const counts = {
            listing: merged.filter(r => r.source === 'listing').length,
            requirement: merged.filter(r => r.source === 'requirement').length,
        };

        const from = (page - 1) * pageSize;
        return {
            data: merged.slice(from, from + pageSize),
            total: merged.length,
            listingTypes,
            counts,
            error: null,
        };
    } catch (err) {
        console.error('[fetchContactRequests] Unexpected error:', err);
        return { ...EMPTY, error: 'Unexpected error.' };
    }
}
