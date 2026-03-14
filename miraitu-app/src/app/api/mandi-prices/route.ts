/* ─────────────────────────────────────────────────────────────
   GET /api/mandi-prices
   ──────────────────────────────────────────────────────────
   Server-side proxy for live mandi commodity prices.

   Data flow (waterfall):
     1. Read from Supabase `mandi_prices` table  (fast, cached)
     2. If empty / stale → fetch from data.gov.in and return
     3. One-time trigger: if Supabase data is >6h old, kick off
        a background sync via /api/mandi-prices/sync

   Query params (all optional):
     state      – e.g. "Maharashtra"
     commodity  – e.g. "Wheat"
     market     – e.g. "Indore"
     limit      – number of records (default 30, max 500)
     offset     – pagination offset (default 0)
     source     – "supabase" | "api" | "auto" (default "auto")
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RESOURCE_ID, DATA_GOV_BASE, type MandiRecord, type DataGovResponse } from '@/lib/mandi-api';

const API_KEY = process.env.DATA_GOV_IN_API_KEY ?? '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const STALE_HOURS = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const state     = searchParams.get('state')     || '';
  const commodity = searchParams.get('commodity')  || '';
  const market    = searchParams.get('market')     || '';
  const limit     = Math.min(Number(searchParams.get('limit'))  || 30, 500);
  const offset    = Number(searchParams.get('offset')) || 0;
  const source    = searchParams.get('source')     || 'auto';

  /* ── 1. Try Supabase first (if available) ───────────────── */
  if (source !== 'api' && SUPABASE_URL && SUPABASE_ANON) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

      let query = supabase
        .from('mandi_prices')
        .select('*', { count: 'exact' })
        .order('arrival_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (state && state !== 'All States')         query = query.eq('state', state);
      if (commodity && commodity !== 'All Crops')   query = query.eq('commodity', commodity);
      if (market)                                   query = query.eq('market', market);

      const { data: rows, count, error: dbError } = await query;

      if (!dbError && rows && rows.length > 0) {
        // Convert DB rows → MandiRecord shape for normalise()
        const records: MandiRecord[] = rows.map(r => {
          // arrival_date is ISO from DB → convert to dd/mm/yyyy for normalise()
          const d = new Date(r.arrival_date);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return {
            state: r.state,
            district: r.district,
            market: r.market,
            commodity: r.commodity,
            variety: r.variety,
            arrival_date: `${dd}/${mm}/${yyyy}`,
            min_price: String(r.min_price),
            max_price: String(r.max_price),
            modal_price: String(r.modal_price),
          };
        });

        // Check staleness – if oldest fetched_at > STALE_HOURS, trigger background sync
        const oldestFetch = rows.reduce((min, r) =>
          r.fetched_at < min ? r.fetched_at : min, rows[0].fetched_at);
        const isStale = Date.now() - new Date(oldestFetch).getTime() > STALE_HOURS * 60 * 60 * 1000;

        if (isStale) {
          // Fire-and-forget background sync
          const syncUrl = new URL('/api/mandi-prices/sync', request.nextUrl.origin);
          fetch(syncUrl.toString(), { method: 'POST' }).catch(() => {});
        }

        return NextResponse.json(
          {
            records,
            total: count ?? rows.length,
            count: rows.length,
            updated: rows[0]?.fetched_at ?? new Date().toISOString(),
            source: 'supabase',
            stale: isStale,
          },
          {
            status: 200,
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
          },
        );
      }
    } catch (err) {
      console.warn('[mandi-prices] Supabase read failed, falling back to data.gov.in', err);
    }
  }

  /* ── 2. Fallback: fetch directly from data.gov.in ────────── */
  const url = new URL(`${DATA_GOV_BASE}/${RESOURCE_ID}`);
  url.searchParams.set('api-key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));

  if (state && state !== 'All States')         url.searchParams.set('filters[state]', state);
  if (commodity && commodity !== 'All Crops')   url.searchParams.set('filters[commodity]', commodity);
  if (market)                                   url.searchParams.set('filters[market]', market);

  try {
    if (!API_KEY) {
      return NextResponse.json(
        { records: [] as MandiRecord[], total: 0, updated: '', error: 'NO_API_KEY' },
        { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } },
      );
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error('[mandi-prices] data.gov.in error', res.status, await res.text());
      return NextResponse.json(
        { records: [] as MandiRecord[], total: 0, updated: '', error: `UPSTREAM_${res.status}` },
        { status: 200 },
      );
    }

    const data: DataGovResponse = await res.json();

    return NextResponse.json(
      {
        records: data.records ?? [],
        total: data.total ?? 0,
        count: data.count ?? 0,
        updated: new Date().toISOString(),
        source: 'data.gov.in',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' },
      },
    );
  } catch (err) {
    console.error('[mandi-prices] fetch error', err);
    return NextResponse.json(
      { records: [] as MandiRecord[], total: 0, updated: '', error: 'FETCH_ERROR' },
      { status: 200 },
    );
  }
}
