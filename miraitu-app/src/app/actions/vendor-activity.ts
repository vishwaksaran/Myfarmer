'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

interface FetchActivityInput {
    page?: number;
    pageSize?: number;
    action?: string;
    vendorId?: string;
}

export async function fetchActivityLog({ page = 1, pageSize = 30, action = '', vendorId = '' }: FetchActivityInput) {
    try {
        const supabase = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('vendor_activity_log')
            .select(`
                id, action, details, ip_address, user_agent, created_at,
                vendor_credentials(username, display_name),
                shops(name, slug)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (action) {
            query = query.eq('action', action);
        }

        if (vendorId) {
            query = query.eq('vendor_id', vendorId);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[vendor-activity] Fetch error:', error);
            return { error: 'Failed to fetch activity.', data: [], total: 0 };
        }

        return { error: null, data: data || [], total: count || 0 };
    } catch (err) {
        console.error('[vendor-activity] Fetch error:', err);
        return { error: 'Unexpected error.', data: [], total: 0 };
    }
}
