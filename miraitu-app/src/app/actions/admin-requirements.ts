'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { RequirementStatus } from '@/lib/requirement-options';

// ─── Buyer requirements, for admin ───────────────────────────────────
//
// The working list behind "Post Your Requirement": what buyers have asked
// for, who to call, and how far along each one is. These never reach the
// browser except here — a requirement carries a phone number and a budget,
// which is precisely the list a competitor would want, so the table is
// service-role only and this is the one way in.

export interface BuyerRequirement {
    id: string;
    category: string;
    productModel: string | null;
    condition: string;
    quantity: string | null;
    budget: string | null;
    location: string | null;
    neededBy: string | null;
    notes: string | null;
    images: string[];
    fullName: string;
    phone: string;
    status: RequirementStatus;
    adminNote: string | null;
    createdAt: string;
    handledAt: string | null;
    /** Whether the buyer happened to be signed in when they asked. */
    hasAccount: boolean;
}

export interface FetchRequirementsResult {
    data: BuyerRequirement[];
    total: number;
    counts: Record<string, number>;
    error: string | null;
}

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
    created_at: string;
    handled_at: string | null;
}

const EMPTY: FetchRequirementsResult = { data: [], total: 0, counts: {}, error: null };

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, error: 'Unauthorized', userId: null };

    const { data: profile, error } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();

    if (error || profile?.role !== 'admin') {
        return { ok: false as const, error: 'Forbidden', userId: null };
    }
    return { ok: true as const, error: null, userId: user.id };
}

export async function fetchBuyerRequirements(
    { status = '', category = '', search = '', page = 1, pageSize = 25 }: {
        status?: string; category?: string; search?: string; page?: number; pageSize?: number;
    } = {},
): Promise<FetchRequirementsResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { ...EMPTY, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;

        let query = admin
            .from('buyer_requirements')
            .select(
                'id, user_id, category, product_model, condition, quantity, budget, location, ' +
                'needed_by, notes, images, full_name, phone, status, admin_note, created_at, handled_at',
                { count: 'exact' },
            )
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category', category);

        const term = search.trim();
        if (term) {
            const like = `%${term.replace(/[%,()]/g, '')}%`;
            query = query.or(
                `full_name.ilike.${like},phone.ilike.${like},product_model.ilike.${like},location.ilike.${like}`,
            );
        }

        const { data, error, count } = await query;
        if (error) {
            console.error('[fetchBuyerRequirements]', error);
            return { ...EMPTY, error: 'Failed to load requirements.' };
        }

        // Tallies for the filter chips, over the whole table rather than this page.
        const counts: Record<string, number> = {};
        for (const s of ['new', 'in_progress', 'fulfilled', 'closed']) {
            const { count: n } = await admin
                .from('buyer_requirements')
                .select('id', { count: 'exact', head: true })
                .eq('status', s);
            counts[s] = n ?? 0;
        }

        const rows = (data ?? []) as unknown as RequirementRow[];

        return {
            data: rows.map(r => ({
                id: r.id,
                category: r.category || 'Other',
                productModel: r.product_model,
                condition: r.condition || 'any',
                quantity: r.quantity,
                budget: r.budget,
                location: r.location,
                neededBy: r.needed_by,
                notes: r.notes,
                images: (r.images ?? []).filter(Boolean),
                fullName: r.full_name || 'Unnamed',
                phone: r.phone || '',
                status: (r.status || 'new') as RequirementStatus,
                adminNote: r.admin_note,
                createdAt: r.created_at,
                handledAt: r.handled_at,
                hasAccount: !!r.user_id,
            })),
            total: count ?? 0,
            counts,
            error: null,
        };
    } catch (err) {
        console.error('[fetchBuyerRequirements] unexpected', err);
        return { ...EMPTY, error: 'Unexpected error.' };
    }
}

export async function updateRequirement(
    id: string,
    patch: { status?: RequirementStatus; adminNote?: string },
): Promise<{ success: boolean; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) return { success: false, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const update: Record<string, unknown> = {};

        if (patch.status) {
            update.status = patch.status;
            // Stamp who picked it up the first time it leaves "new".
            update.handled_by = auth.userId;
            update.handled_at = new Date().toISOString();
        }
        if (patch.adminNote !== undefined) update.admin_note = patch.adminNote.trim() || null;

        if (Object.keys(update).length === 0) return { success: true };

        const { error } = await admin.from('buyer_requirements').update(update).eq('id', id);
        if (error) {
            console.error('[updateRequirement]', error);
            return { success: false, error: 'Could not update that requirement.' };
        }
        return { success: true };
    } catch (err) {
        console.error('[updateRequirement] unexpected', err);
        return { success: false, error: 'Unexpected error.' };
    }
}
