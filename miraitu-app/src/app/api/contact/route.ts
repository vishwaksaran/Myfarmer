/* ─────────────────────────────────────────────────────────────
   POST /api/contact
   ──────────────────────────────────────────────────────────
   Takes a message from the web Contact Us page — companies,
   partners, press, investors — and stores it for admin under
   Admin → Enquiries.

   Open to anyone, like /api/requirements: a company writing in
   has no Miraitu account and should not need one. Because of
   that it carries two cheap spam guards: a hidden honeypot
   field bots fill in, and a per-IP cap over a short window.
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';
import { CONTACT_TOPIC_VALUES, CONTACT_LIMITS } from '@/lib/contact-options';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null) as Record<string, unknown> | null;
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
        }
        const str = (k: string, max: number) => String(body[k] ?? '').trim().slice(0, max);

        // Honeypot: a real visitor never sees this field. Pretend it worked
        // so the bot has nothing to learn from.
        if (str('website', 200)) {
            return NextResponse.json({ success: true });
        }

        const fullName = str('fullName', CONTACT_LIMITS.name);
        const email = str('email', CONTACT_LIMITS.email).toLowerCase();
        const phoneDigits = str('phone', 20).replace(/\D/g, '');
        const company = str('company', CONTACT_LIMITS.company);
        const topic = str('topic', 40) || 'other';
        const subject = str('subject', CONTACT_LIMITS.subject);
        const message = str('message', CONTACT_LIMITS.message);

        if (!fullName) {
            return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
        }
        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }
        if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
            return NextResponse.json({ error: 'Enter a valid phone number, or leave it blank.' }, { status: 400 });
        }
        if (!CONTACT_TOPIC_VALUES.includes(topic)) {
            return NextResponse.json({ error: 'Pick what your message is about.' }, { status: 400 });
        }
        if (message.length < CONTACT_LIMITS.minMessage) {
            return NextResponse.json({ error: 'Please write a little more in your message.' }, { status: 400 });
        }

        const admin = createSupabaseAdminClient();
        const { ip, userAgent } = extractRequestMeta(request.headers);

        if (ip && ip !== 'unknown') {
            const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
            const { count } = await admin
                .from('contact_messages')
                .select('id', { count: 'exact', head: true })
                .eq('ip_address', ip)
                .gte('created_at', since);
            if ((count ?? 0) >= RATE_MAX) {
                return NextResponse.json(
                    { error: 'You have sent several messages already. Please try again in a few minutes.' },
                    { status: 429 },
                );
            }
        }

        let userId: string | null = null;
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id ?? null;
        } catch { /* signed out is the normal case */ }

        const { data: row, error: insertError } = await admin
            .from('contact_messages')
            .insert({
                user_id: userId,
                full_name: fullName,
                email,
                phone: phoneDigits || null,
                company: company || null,
                topic,
                subject: subject || null,
                message,
                status: 'new',
                ip_address: ip,
                user_agent: userAgent.slice(0, 400),
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('[contact] insert failed', insertError);
            return NextResponse.json(
                { error: 'We could not send your message. Please try again.' },
                { status: 500 },
            );
        }

        // Shows up in Admin → Activity Log alongside every other event.
        try {
            await admin.from('vendor_activity_log').insert({
                vendor_id: null,
                shop_id: null,
                action: 'contact_message_submitted',
                details: {
                    contact_message_id: row?.id,
                    full_name: fullName,
                    email,
                    company: company || null,
                    topic,
                    signed_in: !!userId,
                },
                ip_address: ip,
                user_agent: userAgent,
            });
        } catch { /* the message is saved; the log line is a nicety */ }

        return NextResponse.json({ success: true, id: row?.id });
    } catch (err) {
        console.error('[contact]', err);
        return NextResponse.json(
            { error: 'We could not send your message. Please try again.' },
            { status: 500 },
        );
    }
}
