/* ─────────────────────────────────────────────────────────────
   POST /api/mandi-prices/sync
   ──────────────────────────────────────────────────────────
   Fetches fresh commodity prices from data.gov.in and upserts
   them into the Supabase `mandi_prices` table.

   Call this:
     • Manually from admin panel / cURL
     • Via pg_cron → net.http_post (Pro plan)
     • Via Vercel Cron  (vercel.json: { "crons": [...] })
     • On page visit if data is stale (>6 hours)

   Headers:
     Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>       (optional extra auth)
     x-sync-secret:  <any value matching env SYNC_SECRET>    (optional)

   Returns: { synced: number, total: number, errors: string[] }
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { RESOURCE_ID, DATA_GOV_BASE, type MandiRecord, type DataGovResponse } from '@/lib/mandi-api';

const API_KEY = process.env.DATA_GOV_IN_API_KEY ?? '';

// States to sync — top agricultural states
const STATES_TO_SYNC = [
  '', // empty = all states (first pass, limited records)
];

const BATCH_LIMIT = 500; // data.gov.in max per request

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'DATA_GOV_IN_API_KEY not configured' },
        { status: 500 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const errors: string[] = [];
    let totalSynced = 0;
    let totalFetched = 0;

    // Fetch from data.gov.in
    for (const state of STATES_TO_SYNC) {
      try {
        const url = new URL(`${DATA_GOV_BASE}/${RESOURCE_ID}`);
        url.searchParams.set('api-key', API_KEY);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', String(BATCH_LIMIT));
        url.searchParams.set('offset', '0');
        if (state) url.searchParams.set('filters[state]', state);

        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!res.ok) {
          errors.push(`data.gov.in returned ${res.status} for state="${state}"`);
          continue;
        }

        const data: DataGovResponse = await res.json();
        const records = data.records ?? [];
        totalFetched += records.length;

        if (records.length === 0) continue;

        // Transform to Supabase row format
        const rows = records.map((r: MandiRecord) => {
          const [dd, mm, yyyy] = (r.arrival_date || '').split('/');
          const arrivalDate = dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : null;

          return {
            state: r.state?.trim() ?? '',
            district: r.district?.trim() ?? '',
            market: r.market?.trim() ?? '',
            commodity: r.commodity?.trim() ?? '',
            variety: r.variety?.trim() ?? '',
            arrival_date: arrivalDate,
            min_price: Number(r.min_price) || 0,
            max_price: Number(r.max_price) || 0,
            modal_price: Number(r.modal_price) || 0,
            fetched_at: new Date().toISOString(),
          };
        }).filter(r => r.arrival_date); // skip rows with invalid dates

        // Upsert in batches of 100
        const UPSERT_BATCH = 100;
        for (let i = 0; i < rows.length; i += UPSERT_BATCH) {
          const batch = rows.slice(i, i + UPSERT_BATCH);

          const { error: upsertError, count } = await supabase
            .from('mandi_prices')
            .upsert(batch, {
              onConflict: 'state,market,commodity,variety,arrival_date',
              ignoreDuplicates: false,  // update existing rows with fresh data
              count: 'exact',
            });

          if (upsertError) {
            errors.push(`Upsert error batch ${i}: ${upsertError.message}`);
          } else {
            totalSynced += count ?? batch.length;
          }
        }

      } catch (err) {
        errors.push(`Fetch error for state="${state}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({
      synced: totalSynced,
      fetched: totalFetched,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[mandi-sync] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// GET also supported for easy browser/cron testing
export async function GET(request: NextRequest) {
  return POST(request);
}
