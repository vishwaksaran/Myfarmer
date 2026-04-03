import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { fetchLatestAgriNews } from '@/lib/agri-news';

export async function GET(request: NextRequest) {
    try {
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization') || '';
        const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (!cronSecret || bearer !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await fetchLatestAgriNews();
        const supabaseAdmin = createSupabaseAdminClient();

        const { error } = await supabaseAdmin
            .from('agri_news_cache')
            .insert({
                items: payload.items,
                live_event: payload.liveEvent,
                fetched_at: payload.fetchedAt,
            });

        if (error) {
            console.error('[agri-news-refresh] supabase insert failed:', error);
            return NextResponse.json({ error: 'Failed to cache agri news' }, { status: 500 });
        }

        return NextResponse.json({ ok: true, count: payload.items.length, fetchedAt: payload.fetchedAt });
    } catch (error) {
        console.error('[agri-news-refresh] failed:', error);
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
    }
}
