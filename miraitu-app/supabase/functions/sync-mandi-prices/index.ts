// ─────────────────────────────────────────────────────────────
// Supabase Edge Function: sync-mandi-prices
// ─────────────────────────────────────────────────────────────
// Deno-based Edge Function that fetches mandi prices from
// data.gov.in and upserts into the mandi_prices table.
//
// Deploy with:
//   npx supabase functions deploy sync-mandi-prices
//
// Invoke:
//   curl -X POST https://<project>.supabase.co/functions/v1/sync-mandi-prices \
//     -H "Authorization: Bearer <anon-key>"
//
// Schedule via pg_cron (Pro plan):
//   SELECT cron.schedule('sync-mandi-prices', '0 */6 * * *', $$...$$);
// ─────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_BASE = 'https://api.data.gov.in/resource';
const BATCH_LIMIT = 500;

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Get API key from Supabase Vault (or fallback to env)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Try to get API key from Vault first
    let apiKey = '';
    try {
      const { data: vaultData } = await supabase
        .rpc('get_secret', { secret_name: 'DATA_GOV_IN_API_KEY' });
      if (vaultData) apiKey = vaultData;
    } catch {
      // Vault not set up — fallback to env
    }
    if (!apiKey) {
      apiKey = Deno.env.get('DATA_GOV_IN_API_KEY') || '';
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No API key found in Vault or env' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Fetch from data.gov.in
    const url = new URL(`${DATA_GOV_BASE}/${RESOURCE_ID}`);
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(BATCH_LIMIT));
    url.searchParams.set('offset', '0');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `data.gov.in returned ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    const records: MandiRecord[] = data.records ?? [];

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ synced: 0, message: 'No records from data.gov.in' }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Transform records
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
    }).filter((r: { arrival_date: string | null }) => r.arrival_date);

    // Upsert in batches
    let totalSynced = 0;
    const errors: string[] = [];
    const UPSERT_BATCH = 100;

    for (let i = 0; i < rows.length; i += UPSERT_BATCH) {
      const batch = rows.slice(i, i + UPSERT_BATCH);
      const { error, count } = await supabase
        .from('mandi_prices')
        .upsert(batch, {
          onConflict: 'state,market,commodity,variety,arrival_date',
          ignoreDuplicates: false,
          count: 'exact',
        });

      if (error) {
        errors.push(`Batch ${i}: ${error.message}`);
      } else {
        totalSynced += count ?? batch.length;
      }
    }

    // Cleanup: remove data older than 90 days
    await supabase
      .from('mandi_prices')
      .delete()
      .lt('arrival_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return new Response(
      JSON.stringify({
        synced: totalSynced,
        fetched: records.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
