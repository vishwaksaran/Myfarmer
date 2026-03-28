// Server-only utility — imported by API routes and server actions

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

interface LogActivityParams {
    vendorId?: string;
    shopId?: string;
    action: string;
    details?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
}

/**
 * Logs a vendor/admin action to the vendor_activity_log table.
 * Uses service-role client to bypass RLS.
 * 
 * Common action types:
 * - credential_created, credential_deactivated, credential_deleted
 * - vendor_login, vendor_login_failed, vendor_logout
 * - username_changed, password_changed, password_reset
 * - product_created, product_updated, product_deleted
 * - order_created, order_status_changed
 * - shop_created, shop_updated, shop_approved, shop_rejected
 */
export async function logActivity({
    vendorId,
    shopId,
    action,
    details = {},
    ip,
    userAgent,
}: LogActivityParams): Promise<void> {
    try {
        const supabase = createSupabaseAdminClient();
        await supabase.from('vendor_activity_log').insert({
            vendor_id: vendorId || null,
            shop_id: shopId || null,
            action,
            details,
            ip_address: ip || null,
            user_agent: userAgent || null,
        });
    } catch (err) {
        // Log but don't throw — activity logging should never break the main flow
        console.error('[activity-logger] Failed to log activity:', action, err);
    }
}

/**
 * Extracts IP address and user-agent from request headers.
 * Works with both NextRequest and standard Headers objects.
 */
export function extractRequestMeta(headers: Headers): { ip: string; userAgent: string } {
    const ip =
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        'unknown';
    const userAgent = headers.get('user-agent') || 'unknown';
    return { ip, userAgent };
}
