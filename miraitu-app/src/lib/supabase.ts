import { createBrowserClient } from '@supabase/ssr';

// Ensure URL always has a valid https:// prefix
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : rawUrl
        ? `https://${rawUrl}`
        : 'https://placeholder.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a single Supabase browser client that stores tokens in cookies
// (required so the server-side proxy can read auth session via cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export default supabase;
