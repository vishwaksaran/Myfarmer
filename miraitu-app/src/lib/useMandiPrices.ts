'use client';
/* ─────────────────────────────────────────────────────────────
   useMandiPrices – React hook for live mandi commodity data
   ─────────────────────────────────────────────────────────────
   Fetches from /api/mandi-prices (server-side proxy to data.gov.in).
   Returns normalised records with loading / error / refetch.

   Two layers stop the same query going out twice:
     • a 5-minute result cache, so revisiting a filter or paging
       back to a page already seen costs nothing, and
     • an in-flight map, so callers that ask for the same thing
       before the first answer lands share that one request.

   The second one matters more than it looks. The cache is only
   written once a response arrives, so it cannot help concurrent
   callers — and React StrictMode runs every effect twice in
   development, which meant each filter change fired two identical
   requests. Sharing the promise collapses them into one.
   ───────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type NormalisedPrice, type MandiRecord, normalise } from './mandi-api';

export interface UseMandiPricesArgs {
  state?: string;
  commodity?: string;
  market?: string;
  /** Free text matched against crop, mandi and district, in the database. */
  q?: string;
  limit?: number;
  offset?: number;
  /** Set false to defer fetching until a condition is met */
  enabled?: boolean;
}

export interface UseMandiPricesResult {
  data: NormalisedPrice[];
  total: number;
  loading: boolean;
  error: string | null;
  updated: string;             // ISO timestamp of last fetch
  source: 'supabase' | 'data.gov.in' | '';  // where the data came from
  refetch: () => void;
}

// Simple in-memory deduplication cache (lives per page load)
const cache = new Map<string, { data: NormalisedPrice[]; total: number; updated: string; source: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min client-side

/** Requests that have gone out and not yet come back, keyed like the cache. */
const inflight = new Map<string, Promise<ApiPayload>>();

interface ApiPayload {
  records?: MandiRecord[];
  total?: number;
  updated?: string;
  source?: string;
  error?: string;
}

/**
 * One network call per distinct query, however many callers want it.
 *
 * Everyone asking for a key that is already in flight waits on the same
 * promise instead of opening a second identical request.
 */
function fetchShared(key: string, url: string): Promise<ApiPayload> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const request = fetch(url).then(res => res.json() as Promise<ApiPayload>);
  inflight.set(key, request);
  // Cleared either way: a failed request must not wedge the key shut.
  request.then(
    () => inflight.delete(key),
    () => inflight.delete(key),
  );
  return request;
}

function cacheKey(args: UseMandiPricesArgs): string {
  return JSON.stringify({
    s: args.state || '',
    c: args.commodity || '',
    m: args.market || '',
    q: args.q || '',
    l: args.limit || 30,
    o: args.offset || 0,
  });
}

export function useMandiPrices(args: UseMandiPricesArgs = {}): UseMandiPricesResult {
  const { state, commodity, market, q, limit = 30, offset = 0, enabled = true } = args;

  const [data, setData]       = useState<NormalisedPrice[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [updated, setUpdated] = useState('');
  const [source, setSource]   = useState<'supabase' | 'data.gov.in' | ''>('');
  const [tick, setTick]       = useState(0);

  // Keep args ref for stable identity checks
  const argsRef = useRef(args);
  argsRef.current = args;

  const refetch = useCallback(() => {
    // Bust cache for this key
    cache.delete(cacheKey(argsRef.current));
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }

    const key = cacheKey({ state, commodity, market, q, limit, offset });

    // Check client-side cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data);
      setTotal(cached.total);
      setUpdated(cached.updated);
      setSource((cached.source || '') as 'supabase' | 'data.gov.in' | '');
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (state && state !== 'All States')       params.set('state', state);
    if (commodity && commodity !== 'All Crops') params.set('commodity', commodity);
    if (market)                                 params.set('market', market);
    if (q && q.trim())                          params.set('q', q.trim());
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    fetchShared(key, `/api/mandi-prices?${params.toString()}`)
      .then(json => {
        if (cancelled) return;
        if (json.error === 'NO_API_KEY') {
          setError('NO_API_KEY');
          setData([]);
          setTotal(0);
          setSource('');
          setLoading(false);
          return;
        }
        if (json.error) {
          setError(json.error);
          setData([]);
          setTotal(0);
          setSource('');
          setLoading(false);
          return;
        }
        const normalised = (json.records as MandiRecord[]).map(normalise);
        const src = (json.source || 'data.gov.in') as 'supabase' | 'data.gov.in';
        setData(normalised);
        setTotal(json.total ?? 0);
        setUpdated(json.updated ?? '');
        setSource(src);
        setError(null);
        setLoading(false);
        cache.set(key, { data: normalised, total: json.total ?? 0, updated: json.updated ?? '', source: src, ts: Date.now() });
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[useMandiPrices]', err);
        setError('NETWORK_ERROR');
        setData([]);
        setSource('');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [state, commodity, market, q, limit, offset, enabled, tick]);

  return { data, total, loading, error, updated, source, refetch };
}
