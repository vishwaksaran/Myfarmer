'use client';
/* ─────────────────────────────────────────────────────────────
   useMandiPrices – React hook for live mandi commodity data
   ─────────────────────────────────────────────────────────────
   Fetches from /api/mandi-prices (server-side proxy to data.gov.in).
   Returns normalised records with loading / error / refetch.
   Includes a simple in-memory cache so duplicate calls on the
   same page don't cause double-fetches.
   ───────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type NormalisedPrice, type MandiRecord, normalise } from './mandi-api';

export interface UseMandiPricesArgs {
  state?: string;
  commodity?: string;
  market?: string;
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

function cacheKey(args: UseMandiPricesArgs): string {
  return JSON.stringify({
    s: args.state || '',
    c: args.commodity || '',
    m: args.market || '',
    l: args.limit || 30,
    o: args.offset || 0,
  });
}

export function useMandiPrices(args: UseMandiPricesArgs = {}): UseMandiPricesResult {
  const { state, commodity, market, limit = 30, offset = 0, enabled = true } = args;

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

    const key = cacheKey({ state, commodity, market, limit, offset });

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
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    fetch(`/api/mandi-prices?${params.toString()}`)
      .then(res => res.json())
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
  }, [state, commodity, market, limit, offset, enabled, tick]);

  return { data, total, loading, error, updated, source, refetch };
}
