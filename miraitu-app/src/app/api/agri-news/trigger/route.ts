import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { fetchLatestAgriNews } from '@/lib/agri-news';

const isAuthorized = (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (bearer && bearer === cronSecret) return true;

  const querySecret = request.nextUrl.searchParams.get('secret') || '';
  if (querySecret && querySecret === cronSecret) return true;

  return false;
};

const runRefresh = async () => {
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
    throw new Error(error.message);
  }

  return payload;
};

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await runRefresh();

    return NextResponse.json(
      {
        ok: true,
        mode: 'manual',
        count: payload.items.length,
        fetchedAt: payload.fetchedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Manual refresh failed', details: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
