import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

/**
 * GET /api/vendor/shop-info?slug=ralos
 * Returns basic shop info for the vendor login page branding.
 */
export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Shop slug is required.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: shop, error } = await supabase
        .from('shops')
        .select('id, slug, name, logo_url, status')
        .eq('slug', slug)
        .single();

    if (error || !shop) {
        return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    if (shop.status !== 'active') {
        return NextResponse.json({ error: 'Shop is inactive.' }, { status: 404 });
    }

    return NextResponse.json({
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        logoUrl: shop.logo_url,
    });
}
