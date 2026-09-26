/* ─────────────────────────────────────────────────────────────
   GET /api/mandi-prices/facets
   ──────────────────────────────────────────────────────────
   The crop and state names that actually occur in the price
   cache, so the filters on the Mandi Prices board can only
   offer values that can return something.

   The crop dropdown used to be a hand-written list. Two of its
   twelve entries — "Chilli(Green)" and "Gram" — match no row in
   the data at all (the real names are "Green Chilli", "Dry
   Chillies", "Bengal Gram(Gram)(Whole)" and so on), so picking
   either one guaranteed an empty query, and an empty query used
   to fall through to data.gov.in and fail. Reading the names
   back from the data keeps the list honest as the feed changes.

   Query params:
     state – narrow the crop list to one state's markets

   Response: { commodities: string[], states: string[], sampled: number }
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** PostgREST caps a single page; walk a few of them to see the whole vocabulary. */
const PAGE = 1000;
const MAX_PAGES = 12;

/** Distinct names settle long before the rows run out, so this is cached hard. */
const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { body: FacetsBody; ts: number }>();

interface FacetsBody {
    commodities: string[];
    states: string[];
    sampled: number;
    error?: string;
}

export async function GET(request: NextRequest) {
    const state = request.nextUrl.searchParams.get('state') || '';
    const key = state.toLowerCase();

    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < TTL_MS) {
        return NextResponse.json(hit.body, {
            status: 200,
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
        });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON) {
        return NextResponse.json(
            { commodities: [], states: [], sampled: 0, error: 'NO_CACHE' } satisfies FacetsBody,
            { status: 200 },
        );
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
        const commodities = new Set<string>();
        const states = new Set<string>();
        let sampled = 0;

        for (let page = 0; page < MAX_PAGES; page++) {
            let query = supabase
                .from('mandi_prices')
                .select('commodity, state')
                // Newest first, so a short walk still covers everything
                // currently being traded rather than last season's rows.
                .order('arrival_date', { ascending: false })
                .range(page * PAGE, page * PAGE + PAGE - 1);

            if (state && state !== 'All States') query = query.ilike('state', state);

            const { data, error } = await query;
            if (error) break;
            if (!data || data.length === 0) break;

            for (const row of data) {
                if (row.commodity) commodities.add(String(row.commodity));
                if (row.state) states.add(String(row.state));
            }
            sampled += data.length;
            if (data.length < PAGE) break;
        }

        const body: FacetsBody = {
            commodities: [...commodities].sort((a, b) => a.localeCompare(b)),
            states: [...states].sort((a, b) => a.localeCompare(b)),
            sampled,
        };

        cache.set(key, { body, ts: Date.now() });

        return NextResponse.json(body, {
            status: 200,
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
        });
    } catch (err) {
        console.error('[mandi-prices/facets] failed', err);
        return NextResponse.json(
            { commodities: [], states: [], sampled: 0, error: 'FACETS_ERROR' } satisfies FacetsBody,
            { status: 200 },
        );
    }
}
