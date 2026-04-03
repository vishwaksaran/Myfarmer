import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { fetchLatestAgriNews } from '@/lib/agri-news';

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const ITEM_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const getLatestItemTimestamp = (items: unknown[]): number | null => {
    if (!Array.isArray(items) || items.length === 0) return null;

    let latest: number | null = null;
    for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const dateVal = (item as { date?: unknown }).date;
        if (typeof dateVal !== 'string') continue;
        const ts = Date.parse(dateVal);
        if (Number.isNaN(ts)) continue;
        if (latest === null || ts > latest) latest = ts;
    }
    return latest;
};

export async function GET() {
    try {
        const supabaseAdmin = createSupabaseAdminClient();
        const { data: cachedRows, error: cacheReadError } = await supabaseAdmin
            .from('agri_news_cache')
            .select('items, live_event, fetched_at')
            .order('fetched_at', { ascending: false })
            .limit(1);

        if (!cacheReadError && cachedRows && cachedRows.length > 0) {
            const cached = cachedRows[0];
            const cachedItems = Array.isArray(cached.items) ? cached.items : [];
            const fetchedAtMs = Date.parse(cached.fetched_at || '');
            const isFresh = !Number.isNaN(fetchedAtMs) && (Date.now() - fetchedAtMs) < CACHE_MAX_AGE_MS;
            const latestItemTs = getLatestItemTimestamp(cachedItems);
            const hasFreshArticles = latestItemTs !== null && (Date.now() - latestItemTs) < ITEM_MAX_AGE_MS;

            if (cachedItems.length > 0 && isFresh && hasFreshArticles) {
                return NextResponse.json(
                    {
                        items: cachedItems,
                        liveEvent: cached.live_event || null,
                        fetchedAt: cached.fetched_at,
                        source: 'cache',
                    },
                    { status: 200 }
                );
            }
        }

        // Fallback path: live fetch + cache write when cache is empty or unavailable.
        const payload = await fetchLatestAgriNews();

        await supabaseAdmin
            .from('agri_news_cache')
            .insert({
                items: payload.items,
                live_event: payload.liveEvent,
                fetched_at: payload.fetchedAt,
            });

        return NextResponse.json(
            {
                items: payload.items,
                liveEvent: payload.liveEvent,
                fetchedAt: payload.fetchedAt,
                source: 'live-fallback',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[agri-news] failed:', error);
        return NextResponse.json({ items: [], liveEvent: null }, { status: 200 });
    }
}
