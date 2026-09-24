'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';

// ─── Listing contact actions ─────────────────────────────────────────
//
// Nothing in the app dials a seller anymore, so the old logListingContact —
// which recorded a Call or WhatsApp tap and took the seller's number from
// whatever the browser sent — is gone along with the buttons it served. The
// two action names it wrote survive below so the rows it already logged still
// render in Admin → Activity Log.

const ACTION_BY_CHANNEL = {
    call: 'listing_contact_call',
    whatsapp: 'listing_contact_whatsapp',
    request: 'listing_contact_request',
} as const;

// ─── Contact requests (Buy & Sell / Land) ─────────────────────────────
//
// A buyer tapping "Contact Seller" / "Contact Owner" never sees the seller's
// phone number or address — instead they leave their own name, number and an
// optional note here, and the Miraitu team connects the two sides by hand.
// Requests land in `vendor_activity_log`, and Admin → Contact Requests reads
// them back on their own screen (see actions/contact-requests.ts), with the
// seller's details looked up below rather than taken from the buyer.

export interface ContactRequestInput {
    /** service_bookings.id or marketplace_listings.id the request is about. */
    listingId: string;
    /** 'buy_sell' | 'land_sell' | 'land_lease' | 'land_rent' — where this came from. */
    listingType: string;
    listingTitle?: string;
    sellerName?: string;
    location?: string;
    requesterName: string;
    requesterPhone: string;
    message?: string;
}

/**
 * The seller's own name and number, read here rather than accepted from the
 * browser.
 *
 * The buyer's page no longer has either — the public feeds stopped sending
 * them (see the `contact_phone` omissions in listings/livestock/machinery) so
 * that the number a buyer must not see never reaches their device at all. That
 * leaves the server as the only place they can come from, which is also the
 * only place they can be trusted: a client-supplied `sellerPhone` would have
 * let anyone write whatever number they liked into admin's callback list.
 *
 * Land lives in `service_bookings` and everything else in
 * `marketplace_listings`, both keyed by UUID, so this tries one then the other
 * rather than mapping every listing type to a table by hand. Demo rows carry a
 * 'demo-' id and exist in neither.
 */
async function lookupSeller(
    admin: ReturnType<typeof createSupabaseAdminClient>,
    listingId: string
): Promise<{ name: string | null; phone: string | null }> {
    const empty = { name: null, phone: null };
    if (!listingId || listingId.startsWith('demo-')) return empty;
    // Anything that is not a UUID would make PostgREST error on the id filter.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)) return empty;

    try {
        const { data: listing } = await admin
            .from('marketplace_listings')
            .select('contact_phone, user_id')
            .eq('id', listingId)
            .maybeSingle();

        if (listing) {
            let name: string | null = null;
            if (listing.user_id) {
                const { data: profile } = await admin
                    .from('profiles')
                    .select('full_name')
                    .eq('id', listing.user_id)
                    .maybeSingle();
                name = profile?.full_name || null;
            }
            return { name, phone: listing.contact_phone || null };
        }

        const { data: booking } = await admin
            .from('service_bookings')
            .select('full_name, phone')
            .eq('id', listingId)
            .maybeSingle();

        if (booking) {
            return { name: booking.full_name || null, phone: booking.phone || null };
        }
    } catch (err) {
        // A missing seller only costs admin one lookup — never the request.
        console.error('[lookupSeller] Lookup failed:', err);
    }

    return empty;
}

export async function submitContactRequest(
    input: ContactRequestInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to contact the seller' };

        const name = input.requesterName.trim();
        const phoneDigits = input.requesterPhone.replace(/\D/g, '').slice(-10);
        if (!name) return { success: false, error: 'Please enter your name' };
        if (phoneDigits.length !== 10) return { success: false, error: 'Enter a valid 10-digit phone number' };

        const admin = createSupabaseAdminClient();
        const isSyntheticEmail = user.email?.endsWith('@phone.miraitu.app');
        const { ip, userAgent } = extractRequestMeta(await headers());

        // Read off the listing, not off the request body — the buyer's device
        // no longer holds the seller's number, and should not be believed
        // about it if it claimed to.
        const seller = await lookupSeller(admin, input.listingId);

        const { error } = await admin.from('vendor_activity_log').insert({
            vendor_id: null,
            shop_id: null,
            action: ACTION_BY_CHANNEL.request,
            details: {
                channel: 'request',
                listing_id: input.listingId,
                listing_type: input.listingType,
                listing_title: input.listingTitle ?? null,
                seller_name: seller.name ?? input.sellerName ?? null,
                seller_phone: seller.phone,
                location: input.location ?? null,
                user_id: user.id,
                user_name: name,
                user_phone: phoneDigits,
                user_email: isSyntheticEmail ? null : (user.email ?? null),
                message: (input.message ?? '').trim() || null,
            },
            ip_address: ip,
            user_agent: userAgent,
        });

        if (error) {
            console.error('[submitContactRequest] Insert error:', error);
            return { success: false, error: 'Could not send your request. Please try again.' };
        }

        return { success: true };
    } catch (err) {
        console.error('[submitContactRequest] Unexpected error:', err);
        return { success: false, error: 'Could not send your request. Please try again.' };
    }
}
