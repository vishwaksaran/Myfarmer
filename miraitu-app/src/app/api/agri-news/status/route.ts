import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type CachedNewsRow = {
    fetched_at: string;
    created_at: string;
    items: unknown;
    live_event: unknown;
};

const toItemCount = (items: unknown) => {
    if (!Array.isArray(items)) return 0;
    return items.length;
};

const toLiveEventTitle = (liveEvent: unknown) => {
    if (!liveEvent || typeof liveEvent !== 'object') return null;
    const title = (liveEvent as { title?: unknown }).title;
    return typeof title === 'string' ? title : null;
};

export async function GET() {
    try {
        const supabaseAdmin = createSupabaseAdminClient();

        const { data, error } = await supabaseAdmin
            .from('agri_news_cache')
            .select('fetched_at, created_at, items, live_event')
            .order('fetched_at', { ascending: false })
            .limit(1)
            .returns<CachedNewsRow[]>();

        if (error) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Failed to read agri news cache',
                    details: error.message,
                },
                { status: 500 }
            );
        }

        const row = data?.[0];

        if (!row) {
            return NextResponse.json(
                {
                    ok: true,
                    hasCache: false,
                    message: 'No cached agri news rows found yet. Wait for cron or call refresh endpoint once.',
                },
                { status: 200 }
            );
        }

        const fetchedAtMs = Date.parse(row.fetched_at);
        const ageMinutes = Number.isNaN(fetchedAtMs)
            ? null
            : Math.max(0, Math.floor((Date.now() - fetchedAtMs) / 60000));

        return NextResponse.json(
            {
                ok: true,
                hasCache: true,
                fetchedAt: row.fetched_at,
                createdAt: row.created_at,
                ageMinutes,
                itemCount: toItemCount(row.items),
                liveEventTitle: toLiveEventTitle(row.live_event),
            },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                ok: false,
                message: 'Status endpoint failed',
                details: message,
            },
            { status: 500 }
        );
    }
}
