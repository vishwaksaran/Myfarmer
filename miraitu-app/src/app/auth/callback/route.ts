import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Auth callback route handler for Supabase OAuth
 * After Google Sign-In, Supabase redirects here with a code
 * We exchange it for a session
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/home';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    flowType: 'pkce',
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false,
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
    }

    // If there's an error or no code, redirect to login
    return NextResponse.redirect(new URL('/user-login', requestUrl.origin));
}
