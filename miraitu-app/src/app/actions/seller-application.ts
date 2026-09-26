'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';
import { headers } from 'next/headers';

// ─── Receiving a "Become a Seller" application ───────────────────────
//
// The form used to save itself from the browser, and only when the
// applicant happened to be signed in:
//
//     if (user && !user.isGuest) { ...createSeller... }
//
// Everyone else got `localStorage.setItem(...)` and a "Request received"
// modal. Nothing reached the database, so nothing reached admin — which is
// exactly why applications were going missing. Worse, the catch block ran
// `setShowSuccess(true)` with the comment "Still show success", so a real
// insert failure also looked like a submission.
//
// Applying is not something you should need an account for, so this takes
// the application from anyone and writes it with the service role. The
// signed-in user is attached when there is one, because that is what links
// the application to the listings they will later post.

export interface SellerApplicationInput {
    sellerType: string;
    fullName: string;
    phone: string;
    email?: string;
    businessName?: string;
    location?: string;
    /** Every answer the four steps collected, kept verbatim for admin. */
    formData: Record<string, unknown>;
    images?: string[];
}

export async function submitSellerApplication(
    input: SellerApplicationInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
    const fullName = (input.fullName ?? '').trim();
    const phoneDigits = (input.phone ?? '').replace(/\D/g, '').slice(-10);

    if (!fullName) return { success: false, error: 'Please enter your name.' };
    if (phoneDigits.length !== 10) return { success: false, error: 'Enter a valid 10-digit phone number.' };
    if (!input.sellerType) return { success: false, error: 'Pick what you want to register as.' };

    try {
        // Attach the account when the applicant has one. A guest still gets
        // their application recorded; admin can reach them on the phone
        // number, and a login is issued on approval either way.
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        const admin = createSupabaseAdminClient();

        // Someone tapping submit twice, or re-applying after a rejection,
        // should not spawn duplicate rows for admin to sort out. An open
        // application for the same phone and type is updated in place.
        const { data: existing } = await admin
            .from('sellers')
            .select('id, status')
            .eq('phone', phoneDigits)
            .eq('seller_type', input.sellerType)
            .in('status', ['pending'])
            .maybeSingle();

        const payload = {
            user_id: user?.id ?? null,
            seller_type: input.sellerType,
            full_name: fullName,
            phone: phoneDigits,
            email: (input.email ?? user?.email ?? '').trim() || null,
            business_name: (input.businessName ?? '').trim() || null,
            location: (input.location ?? '').trim() || null,
            form_data: input.formData ?? {},
            images: (input.images ?? []).filter(Boolean),
            status: 'pending',
        };

        let id: string | undefined;

        if (existing) {
            const { data, error } = await admin
                .from('sellers')
                .update(payload)
                .eq('id', existing.id)
                .select('id')
                .single();
            if (error) throw error;
            id = data?.id as string;
        } else {
            const { data, error } = await admin
                .from('sellers')
                .insert(payload)
                .select('id')
                .single();
            if (error) throw error;
            id = data?.id as string;
        }

        // Surfaces in Admin → Activity Log next to every other tracked action.
        try {
            const { ip, userAgent } = extractRequestMeta(await headers());
            await admin.from('vendor_activity_log').insert({
                vendor_id: null,
                shop_id: null,
                action: 'seller_application_submitted',
                details: {
                    seller_id: id,
                    seller_type: input.sellerType,
                    full_name: fullName,
                    phone: phoneDigits,
                    location: payload.location,
                    signed_in: !!user,
                    resubmitted: !!existing,
                },
                ip_address: ip,
                user_agent: userAgent,
            });
        } catch { /* the application is saved; the log entry is a nicety */ }

        return { success: true, id };
    } catch (err) {
        console.error('[submitSellerApplication]', err);
        return {
            success: false,
            error: 'We could not record your application. Please check your details and try again.',
        };
    }
}
