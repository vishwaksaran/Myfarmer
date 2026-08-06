'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';

// ─── Listing contact tracking ────────────────────────────────────────
//
// Records that a signed-in user tapped Call or WhatsApp on a public land
// listing. Events land in `vendor_activity_log` (vendor_id/shop_id null) so
// they show up in Admin → Activity Log alongside every other tracked action.

export type ContactChannel = 'call' | 'whatsapp';

export interface ListingContactInput {
    channel: ContactChannel;
    /** service_bookings.id — 'demo-*' for the showcase listings. */
    listingId: string;
    /** 'sell' | 'lease' | 'rent' — which public page the listing came from. */
    listingType: string;
    listingTitle?: string;
    sellerName?: string;
    sellerPhone?: string;
    location?: string;
}

const ACTION_BY_CHANNEL: Record<ContactChannel, string> = {
    call: 'listing_contact_call',
    whatsapp: 'listing_contact_whatsapp',
};

export async function logListingContact(
    input: ListingContactInput
): Promise<{ success: boolean }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Only signed-in users are tracked — guests never reach these buttons.
        if (!user) return { success: false };

        const admin = createSupabaseAdminClient();

        // Enrich with the caller's profile so admin sees a name, not just a UUID.
        let profile: { full_name?: string | null; phone?: string | null } | null = null;
        try {
            const { data } = await admin
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .maybeSingle();
            profile = data;
        } catch { /* profile lookup is best-effort */ }

        const meta = user.user_metadata || {};
        const isSyntheticEmail = user.email?.endsWith('@phone.miraitu.app');
        const { ip, userAgent } = extractRequestMeta(await headers());

        const { error } = await admin.from('vendor_activity_log').insert({
            vendor_id: null,
            shop_id: null,
            action: ACTION_BY_CHANNEL[input.channel] ?? 'listing_contact_call',
            details: {
                channel: input.channel,
                listing_id: input.listingId,
                listing_type: input.listingType,
                listing_title: input.listingTitle ?? null,
                seller_name: input.sellerName ?? null,
                seller_phone: input.sellerPhone ?? null,
                location: input.location ?? null,
                user_id: user.id,
                user_name: profile?.full_name || meta.full_name || meta.name || null,
                user_phone: profile?.phone || user.phone || meta.phone || null,
                user_email: isSyntheticEmail ? null : (user.email ?? null),
            },
            ip_address: ip,
            user_agent: userAgent,
        });

        if (error) {
            console.error('[logListingContact] Insert error:', error);
            return { success: false };
        }

        return { success: true };
    } catch (err) {
        // Never break the contact flow — the call/WhatsApp link still opens.
        console.error('[logListingContact] Unexpected error:', err);
        return { success: false };
    }
}
