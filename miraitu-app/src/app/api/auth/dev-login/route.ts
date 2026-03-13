import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * DEV-ONLY: Create or sign in a test admin user for local development.
 * This endpoint only works when NEXT_PUBLIC_SITE_URL contains "localhost".
 * 
 * Uses Supabase Admin API (service_role key) to create a user with a password
 * and then signs them in via the regular client.
 */

const DEV_EMAIL = 'admin@miraitu.dev';
const DEV_PASSWORD = 'miraitu-dev-2026';

export async function POST() {
    // SAFETY: Only allow in local development
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (!siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1')) {
        return NextResponse.json(
            { error: 'Dev login is only available in local development' },
            { status: 403 }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If no service role key, fall back to anon key sign-in only (user must already exist)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
        // Step 1: Try to create the dev user via admin API (if service role key available)
        if (serviceRoleKey) {
            const adminClient = createClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false },
            });

            // Check if user exists
            const { data: existingUsers } = await adminClient.auth.admin.listUsers();
            const devUser = existingUsers?.users?.find(u => u.email === DEV_EMAIL);

            if (!devUser) {
                // Create the dev admin user
                const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
                    email: DEV_EMAIL,
                    password: DEV_PASSWORD,
                    email_confirm: true,
                    user_metadata: { full_name: 'Dev Admin', role: 'admin' },
                });

                if (createError) {
                    console.error('[Dev Login] Failed to create user:', createError);
                }

                // Also create a profile entry
                if (createdUser?.user) {
                    await adminClient.from('profiles').upsert({
                        id: createdUser.user.id,
                        full_name: 'Dev Admin',
                        role: 'admin',
                        phone: '+910000000000',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                }
            }
        }

        // Step 2: Sign in with the dev credentials using the regular client
        const client = createClient(supabaseUrl, anonKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await client.auth.signInWithPassword({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
        });

        if (error) {
            // If sign-in fails and we don't have service role key, 
            // the user doesn't exist yet
            if (!serviceRoleKey) {
                return NextResponse.json({
                    error: 'Dev user does not exist. Add SUPABASE_SERVICE_ROLE_KEY to .env.local to auto-create it, or create a user manually in Supabase Dashboard with email: admin@miraitu.dev password: miraitu-dev-2026',
                }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            session: {
                access_token: data.session!.access_token,
                refresh_token: data.session!.refresh_token,
            },
            user: {
                id: data.user!.id,
                email: data.user!.email,
            },
        });
    } catch (err) {
        console.error('[Dev Login] Error:', err);
        return NextResponse.json({ error: 'Dev login failed' }, { status: 500 });
    }
}
