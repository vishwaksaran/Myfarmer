'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/contact-options';

// ─── Contact Us messages, for admin ───────────────────────────────────
//
// Messages sent from the web Contact Us page (POST /api/contact) by
// companies, partners, press and investors. They live in their own table
// and their own inbox — Admin → Enquiries — apart from farmer callback
// requests, because they are answered by email by different people.

export interface ContactMessageRecord {
    id: string;
    createdAt: string;
    fullName: string;
    email: string;
    phone: string | null;
    company: string | null;
    topic: string;
    subject: string | null;
    message: string;
    status: ContactStatus;
    adminNote: string | null;
    handledAt: string | null;
    userId: string | null;
    ipAddress: string | null;
}

interface ContactMessageRow {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    phone: string | null;
    company: string | null;
    topic: string;
    subject: string | null;
    message: string;
    status: string;
    admin_note: string | null;
    handled_at: string | null;
    user_id: string | null;
    ip_address: string | null;
}

export interface FetchContactMessagesResult {
    data: ContactMessageRecord[];
    total: number;
    /** Unfiltered count per status, for the filter chips. */
    statusCounts: Record<ContactStatus, number>;
    error: string | null;
}

const EMPTY_COUNTS: Record<ContactStatus, number> = { new: 0, in_progress: 0, replied: 0, closed: 0 };

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
    return { ok: true as const, userId: user.id };
}

function toRecord(r: ContactMessageRow): ContactMessageRecord {
    return {
        id: r.id,
        createdAt: r.created_at,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        company: r.company,
        topic: r.topic,
        subject: r.subject,
        message: r.message,
        status: (CONTACT_STATUSES as readonly string[]).includes(r.status) ? r.status as ContactStatus : 'new',
        adminNote: r.admin_note,
        handledAt: r.handled_at,
        userId: r.user_id,
        ipAddress: r.ip_address,
    };
}

export async function fetchContactMessages(
    { page = 1, pageSize = 25, status = '', topic = '', search = '' }:
        { page?: number; pageSize?: number; status?: string; topic?: string; search?: string } = {}
): Promise<FetchContactMessagesResult> {
    const auth = await requireAdmin();
    if (!auth.ok) return { data: [], total: 0, statusCounts: EMPTY_COUNTS, error: auth.error };

    try {
        const admin = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;

        let query = admin
            .from('contact_messages')
            .select('id, created_at, full_name, email, phone, company, topic, subject, message, status, ' +
                'admin_note, handled_at, user_id, ip_address', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

        if (status) query = query.eq('status', status);
        if (topic) query = query.eq('topic', topic);
        const term = search.trim().replace(/[%,()]/g, '');
        if (term) {
            const like = '%' + term + '%';
            query = query.or(
                'full_name.ilike.' + like + ',' +
                'email.ilike.' + like + ',' +
                'company.ilike.' + like + ',' +
                'subject.ilike.' + like + ',' +
                'message.ilike.' + like,
            );
        }

        const { data, count, error } = await query;
        if (error) {
            console.error('[fetchContactMessages]', error);
            return { data: [], total: 0, statusCounts: EMPTY_COUNTS, error: 'Failed to fetch messages. Has migration 037 been applied?' };
        }

        // One small head-count per status for the chips.
        const statusCounts = { ...EMPTY_COUNTS };
        await Promise.all(CONTACT_STATUSES.map(async (s) => {
            const { count: c } = await admin
                .from('contact_messages')
                .select('id', { count: 'exact', head: true })
                .eq('status', s);
            statusCounts[s] = c ?? 0;
        }));

        return {
            data: ((data ?? []) as unknown as ContactMessageRow[]).map(toRecord),
            total: count ?? 0,
            statusCounts,
            error: null,
        };
    } catch (err) {
        console.error('[fetchContactMessages] Unexpected error:', err);
        return { data: [], total: 0, statusCounts: EMPTY_COUNTS, error: 'Unexpected error.' };
    }
}

/** For the badge on the admin sidebar. Fails quietly to 0. */
export async function fetchNewContactMessagesCount(): Promise<number> {
    const auth = await requireAdmin();
    if (!auth.ok) return 0;
    try {
        const admin = createSupabaseAdminClient();
        const { count } = await admin
            .from('contact_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'new');
        return count ?? 0;
    } catch {
        return 0;
    }
}

export async function updateContactMessage(
    id: string,
    patch: { status?: string; adminNote?: string },
): Promise<{ error: string | null }> {
    const auth = await requireAdmin();
    if (!auth.ok) return { error: auth.error };

    const update: Record<string, unknown> = {};
    if (patch.status !== undefined) {
        if (!(CONTACT_STATUSES as readonly string[]).includes(patch.status)) {
            return { error: 'Invalid status.' };
        }
        update.status = patch.status;
        update.handled_by = auth.userId;
        update.handled_at = new Date().toISOString();
    }
    if (patch.adminNote !== undefined) {
        update.admin_note = patch.adminNote.trim().slice(0, 2000) || null;
    }
    if (Object.keys(update).length === 0) return { error: null };

    try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin.from('contact_messages').update(update).eq('id', id);
        if (error) {
            console.error('[updateContactMessage]', error);
            return { error: 'Failed to update message.' };
        }
        return { error: null };
    } catch (err) {
        console.error('[updateContactMessage] Unexpected error:', err);
        return { error: 'Unexpected error.' };
    }
}
