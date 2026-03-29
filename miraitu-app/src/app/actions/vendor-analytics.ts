'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function fetchDashboardStats(shopId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const [productsRes, activeOrdersRes, pendingRes, revenueRes] = await Promise.all([
            supabase.from('crm_products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
            supabase.from('crm_orders').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).in('status', ['pending', 'confirmed', 'processing', 'shipped']),
            supabase.from('crm_orders').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).eq('status', 'pending'),
            supabase.from('crm_orders').select('total').eq('shop_id', shopId).in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
        ]);

        const totalProducts = productsRes.count || 0;
        const activeOrders = activeOrdersRes.count || 0;
        const pendingOrders = pendingRes.count || 0;
        const revenue = (revenueRes.data || []).reduce((sum, o) => sum + (parseFloat(String(o.total)) || 0), 0);

        return {
            error: null,
            data: { totalProducts, activeOrders, pendingOrders, revenue },
        };
    } catch (err) {
        console.error('[vendor-analytics] Stats error:', err);
        return { error: 'Unexpected error.', data: { totalProducts: 0, activeOrders: 0, pendingOrders: 0, revenue: 0 } };
    }
}

export async function fetchRecentOrders(shopId: string, limit = 5) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('crm_orders')
            .select('id, order_number, customer_name, total, status, payment_status, created_at')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) return { error: 'Failed to fetch recent orders.', data: [] };
        return { error: null, data: data || [] };
    } catch (err) {
        console.error('[vendor-analytics] Recent orders error:', err);
        return { error: 'Unexpected error.', data: [] };
    }
}

export async function fetchTopProducts(shopId: string, limit = 5) {
    try {
        const supabase = createSupabaseAdminClient();

        // Get all delivered/confirmed order items for this shop
        const { data: orders } = await supabase
            .from('crm_orders')
            .select('id')
            .eq('shop_id', shopId)
            .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

        if (!orders || orders.length === 0) {
            return { error: null, data: [] };
        }

        const orderIds = orders.map(o => o.id);

        const { data: items } = await supabase
            .from('crm_order_items')
            .select('product_id, product_name, quantity, total_price')
            .in('order_id', orderIds);

        if (!items || items.length === 0) {
            return { error: null, data: [] };
        }

        // Aggregate by product
        const productMap = new Map<string, { name: string; unitsSold: number; revenue: number }>();
        for (const item of items) {
            const existing = productMap.get(item.product_id) || { name: item.product_name, unitsSold: 0, revenue: 0 };
            existing.unitsSold += item.quantity;
            existing.revenue += parseFloat(String(item.total_price)) || 0;
            productMap.set(item.product_id, existing);
        }

        const sorted = Array.from(productMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, limit);

        return { error: null, data: sorted };
    } catch (err) {
        console.error('[vendor-analytics] Top products error:', err);
        return { error: 'Unexpected error.', data: [] };
    }
}

export async function fetchOrderStatusBreakdown(shopId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('crm_orders')
            .select('status')
            .eq('shop_id', shopId);

        if (error) return { error: 'Failed.', data: {} };

        const breakdown: Record<string, number> = {};
        for (const o of data || []) {
            breakdown[o.status] = (breakdown[o.status] || 0) + 1;
        }

        return { error: null, data: breakdown };
    } catch (err) {
        console.error('[vendor-analytics] Breakdown error:', err);
        return { error: 'Unexpected error.', data: {} };
    }
}

export async function fetchRevenueByPeriod(shopId: string, days = 30) {
    try {
        const supabase = createSupabaseAdminClient();
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('crm_orders')
            .select('total, created_at')
            .eq('shop_id', shopId)
            .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: true });

        if (error) return { error: 'Failed.', data: [] };

        // Group by date
        const dailyMap = new Map<string, number>();
        for (const o of data || []) {
            const date = new Date(o.created_at).toISOString().split('T')[0];
            dailyMap.set(date, (dailyMap.get(date) || 0) + (parseFloat(String(o.total)) || 0));
        }

        const result = Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue }));
        return { error: null, data: result };
    } catch (err) {
        console.error('[vendor-analytics] Revenue error:', err);
        return { error: 'Unexpected error.', data: [] };
    }
}
