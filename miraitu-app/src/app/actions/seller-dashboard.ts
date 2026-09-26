'use server';

import { cookies } from 'next/headers';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifySellerJWT, SELLER_COOKIE } from '@/lib/seller-auth';

// ─── The seller workspace, server side ───────────────────────────────
//
// Everything the dashboard shows or does goes through here, and everything
// here starts by resolving the seller from their own session cookie. The
// dashboard never says who it is — it cannot, because a seller signs in with
// admin-issued credentials rather than a Supabase session, so there is no
// client-side identity to trust.
//
// The gate that matters is `approved`. A pending seller can sign in and see
// their dashboard, but cannot publish anything; the moment admin approves
// them, the same dashboard starts posting to `marketplace_listings`, which
// is the table the public boards already read. That is the whole of "once
// verified, what they list shows up in the app" — no second table, no copy
// step, no separate publish queue that could fall behind.

export interface SellerContext {
    sellerId: string;
    /** The auth user who applied; listings are owned by them. */
    userId: string | null;
    sellerType: string;
    fullName: string;
    businessName: string | null;
    location: string | null;
    district: string | null;
    state: string | null;
    phone: string | null;
    status: string;
    reviewNote: string | null;
    approved: boolean;
}

async function resolveSeller(): Promise<
    { ok: true; ctx: SellerContext; admin: ReturnType<typeof createSupabaseAdminClient> }
    | { ok: false; error: string }
> {
    const token = (await cookies()).get(SELLER_COOKIE)?.value;
    if (!token) return { ok: false, error: 'Please sign in again.' };

    const payload = await verifySellerJWT(token);
    if (!payload) return { ok: false, error: 'Your session has expired. Please sign in again.' };

    const admin = createSupabaseAdminClient();

    // The credential must still be live and still be the version this token
    // was minted against — admin may have reset or disabled it since.
    const { data: cred } = await admin
        .from('seller_credentials')
        .select('id, status, session_version')
        .eq('id', payload.credentialId)
        .maybeSingle();

    if (!cred || cred.status !== 'active') return { ok: false, error: 'This login has been turned off.' };
    if (((cred.session_version as number) ?? 1) !== payload.sessionVersion) {
        return { ok: false, error: 'Your session has expired. Please sign in again.' };
    }

    const { data: seller } = await admin
        .from('sellers')
        .select('id, user_id, seller_type, full_name, business_name, location, phone, status, review_note, form_data')
        .eq('id', payload.sellerId)
        .maybeSingle();

    if (!seller) return { ok: false, error: 'We could not find your seller account.' };

    const form = (seller.form_data as Record<string, unknown>) ?? {};
    const pick = (k: string) => {
        const v = form[k];
        return typeof v === 'string' && v.trim() ? v.trim() : null;
    };

    return {
        ok: true,
        admin,
        ctx: {
            sellerId: seller.id as string,
            userId: (seller.user_id as string | null) ?? null,
            sellerType: (seller.seller_type as string) || 'farmer-seller',
            fullName: (seller.full_name as string) || 'Seller',
            businessName: (seller.business_name as string | null) ?? null,
            location: (seller.location as string | null) ?? pick('village'),
            district: pick('district'),
            state: pick('state'),
            phone: (seller.phone as string | null) ?? null,
            status: (seller.status as string) || 'pending',
            reviewNote: (seller.review_note as string | null) ?? null,
            approved: seller.status === 'approved',
        },
    };
}

export interface SellerListing {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
    price: number | null;
    priceUnit: string | null;
    location: string | null;
    images: string[];
    status: string;
    createdAt: string;
}

export interface SellerDashboard {
    seller: SellerContext | null;
    listings: SellerListing[];
    stats: {
        activeListings: number;
        totalListings: number;
        /** Buyers who asked to be called back about one of their listings. */
        buyerRequests: number;
    };
    error: string | null;
}

export async function fetchSellerDashboard(): Promise<SellerDashboard> {
    const resolved = await resolveSeller();
    if (!resolved.ok) {
        return { seller: null, listings: [], stats: { activeListings: 0, totalListings: 0, buyerRequests: 0 }, error: resolved.error };
    }
    const { ctx, admin } = resolved;

    try {
        let listings: SellerListing[] = [];
        if (ctx.userId) {
            const { data } = await admin
                .from('marketplace_listings')
                .select('id, title, category, subcategory, price, price_unit, location, images, status, created_at')
                .eq('user_id', ctx.userId)
                .order('created_at', { ascending: false })
                .limit(100);

            listings = (data ?? []).map(r => ({
                id: r.id as string,
                title: (r.title as string) || 'Untitled',
                category: (r.category as string) || 'other',
                subcategory: (r.subcategory as string | null) ?? null,
                price: (r.price as number | null) ?? null,
                priceUnit: (r.price_unit as string | null) ?? null,
                location: (r.location as string | null) ?? null,
                images: ((r.images as string[] | null) ?? []).filter(Boolean),
                status: (r.status as string) || 'active',
                createdAt: r.created_at as string,
            }));
        }

        // Callback requests naming one of this seller's listings.
        let buyerRequests = 0;
        if (listings.length > 0) {
            const { count } = await admin
                .from('vendor_activity_log')
                .select('id', { count: 'exact', head: true })
                .eq('action', 'listing_contact_request')
                .in('details->>listing_id', listings.map(l => l.id));
            buyerRequests = count ?? 0;
        }

        return {
            seller: ctx,
            listings,
            stats: {
                activeListings: listings.filter(l => l.status === 'active').length,
                totalListings: listings.length,
                buyerRequests,
            },
            error: null,
        };
    } catch (err) {
        console.error('[fetchSellerDashboard]', err);
        return { seller: ctx, listings: [], stats: { activeListings: 0, totalListings: 0, buyerRequests: 0 }, error: 'Could not load your dashboard.' };
    }
}

export interface SellerListingInput {
    title: string;
    category: string;
    subcategory?: string;
    description?: string;
    price?: number | null;
    priceUnit?: string;
    quantity?: string;
    location?: string;
    images?: string[];
}

/**
 * Publishes a listing straight onto the public boards.
 *
 * Only an approved seller reaches the insert. That is the verification gate
 * the whole module hangs on, and it is enforced here rather than in the UI,
 * because the UI cannot be trusted to have hidden the button.
 */
export async function createSellerListing(
    input: SellerListingInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
    const resolved = await resolveSeller();
    if (!resolved.ok) return { success: false, error: resolved.error };
    const { ctx, admin } = resolved;

    if (!ctx.approved) {
        return {
            success: false,
            error: 'Your account is still being verified. You can post as soon as Miraitu approves it.',
        };
    }
    if (!ctx.userId) {
        return { success: false, error: 'Your seller account is not linked to a login yet. Please contact Miraitu.' };
    }

    const title = (input.title ?? '').trim();
    if (title.length < 3) return { success: false, error: 'Give your listing a title.' };

    const location = (input.location ?? ctx.location ?? '').trim();
    if (!location) return { success: false, error: 'Add where it is.' };

    const category = input.category || 'crops';

    try {
        const { data, error } = await admin
            .from('marketplace_listings')
            .insert({
                user_id: ctx.userId,
                listing_mode: 'sale',
                category,
                subcategory: input.subcategory?.trim() || null,
                // Kept in step for anything still reading the pre-030 column.
                listing_type: category === 'animals' ? 'livestock' : category === 'crops' ? 'crops' : 'machinery',
                title,
                description: input.description?.trim() || null,
                price: input.price ?? null,
                price_unit: input.priceUnit?.trim() || null,
                negotiable: false,
                location,
                district: ctx.district,
                state: ctx.state,
                images: (input.images ?? []).filter(Boolean),
                contact_phone: ctx.phone,
                specs: input.quantity?.trim() ? { quantity: input.quantity.trim() } : {},
                // Live immediately, because the seller behind it is verified.
                status: 'active',
            })
            .select('id')
            .single();

        if (error) {
            console.error('[createSellerListing]', error);
            return { success: false, error: 'Could not publish that listing. Please try again.' };
        }

        return { success: true, id: data?.id as string };
    } catch (err) {
        console.error('[createSellerListing] unexpected', err);
        return { success: false, error: 'Could not publish that listing. Please try again.' };
    }
}

/** Takes a listing down without deleting the record. */
export async function setSellerListingStatus(
    listingId: string,
    status: 'active' | 'inactive',
): Promise<{ success: boolean; error?: string }> {
    const resolved = await resolveSeller();
    if (!resolved.ok) return { success: false, error: resolved.error };
    const { ctx, admin } = resolved;
    if (!ctx.userId) return { success: false, error: 'No listings are linked to this account.' };

    // Scoped to their own rows, so a crafted id cannot touch anyone else's.
    const { error } = await admin
        .from('marketplace_listings')
        .update({ status })
        .eq('id', listingId)
        .eq('user_id', ctx.userId);

    if (error) return { success: false, error: 'Could not update that listing.' };
    return { success: true };
}

export async function deleteSellerListing(listingId: string): Promise<{ success: boolean; error?: string }> {
    const resolved = await resolveSeller();
    if (!resolved.ok) return { success: false, error: resolved.error };
    const { ctx, admin } = resolved;
    if (!ctx.userId) return { success: false, error: 'No listings are linked to this account.' };

    const { error } = await admin
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', ctx.userId);

    if (error) return { success: false, error: 'Could not delete that listing.' };
    return { success: true };
}
