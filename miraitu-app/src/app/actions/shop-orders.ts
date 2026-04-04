'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendOrderNotifications } from '@/lib/notification-delivery';

export type ShopPaymentStatus = 'payment_pending' | 'paid' | 'failed' | 'refunded';
export type ShopOrderStatus = 'created' | 'paid' | 'packed' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded';

export interface ShopOrderItemRecord {
    id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface ShopOrderEventRecord {
    id: string;
    event_type: string;
    message: string;
    created_at: string;
    metadata: Record<string, unknown>;
}

export interface ShopPaymentRecord {
    id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string | null;
    status: string;
    failure_reason: string | null;
    created_at: string;
    captured_at: string | null;
}

export interface ShopOrderRecord {
    id: string;
    user_id: string;
    order_number: string;
    shipping_address: Record<string, string>;
    subtotal: number;
    delivery_fee: number;
    total: number;
    currency: string;
    payment_status: ShopPaymentStatus;
    order_status: ShopOrderStatus;
    transporter_name: string | null;
    tracking_id: string | null;
    tracking_url: string | null;
    admin_notes: string | null;
    created_at: string;
    paid_at: string | null;
    dispatched_at: string | null;
    delivered_at: string | null;
    items: ShopOrderItemRecord[];
    events: ShopOrderEventRecord[];
    payment: ShopPaymentRecord | null;
}

export interface AdminShopOrderRecord extends ShopOrderRecord {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
}

const ORDER_TRANSITIONS: Record<ShopOrderStatus, ShopOrderStatus[]> = {
    created: ['paid', 'cancelled', 'payment_failed'],
    paid: ['packed', 'cancelled', 'refunded'],
    packed: ['dispatched', 'cancelled'],
    dispatched: ['in_transit', 'delivered', 'cancelled'],
    in_transit: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    payment_failed: ['created', 'paid', 'cancelled'],
    refunded: [],
};

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { ok: false as const, error: 'Unauthorized' };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || profile?.role !== 'admin') {
        return { ok: false as const, error: 'Forbidden' };
    }

    return { ok: true as const, adminId: user.id };
}

function normalizeOrder(raw: Record<string, unknown>): ShopOrderRecord {
    return {
        id: String(raw.id),
        user_id: String(raw.user_id),
        order_number: String(raw.order_number),
        shipping_address: (raw.shipping_address || {}) as Record<string, string>,
        subtotal: Number(raw.subtotal || 0),
        delivery_fee: Number(raw.delivery_fee || 0),
        total: Number(raw.total || 0),
        currency: String(raw.currency || 'INR'),
        payment_status: String(raw.payment_status || 'payment_pending') as ShopPaymentStatus,
        order_status: String(raw.order_status || 'created') as ShopOrderStatus,
        transporter_name: (raw.transporter_name as string | null) || null,
        tracking_id: (raw.tracking_id as string | null) || null,
        tracking_url: (raw.tracking_url as string | null) || null,
        admin_notes: (raw.admin_notes as string | null) || null,
        created_at: String(raw.created_at),
        paid_at: (raw.paid_at as string | null) || null,
        dispatched_at: (raw.dispatched_at as string | null) || null,
        delivered_at: (raw.delivered_at as string | null) || null,
        items: Array.isArray(raw.shop_order_items)
            ? (raw.shop_order_items as Record<string, unknown>[]).map((item) => ({
                id: String(item.id),
                product_name: String(item.product_name),
                unit_price: Number(item.unit_price || 0),
                quantity: Number(item.quantity || 0),
                line_total: Number(item.line_total || 0),
            }))
            : [],
        events: Array.isArray(raw.shop_order_events)
            ? (raw.shop_order_events as Record<string, unknown>[]).map((event) => ({
                id: String(event.id),
                event_type: String(event.event_type),
                message: String(event.message),
                created_at: String(event.created_at),
                metadata: (event.metadata || {}) as Record<string, unknown>,
            }))
            : [],
        payment: Array.isArray(raw.shop_payments) && raw.shop_payments[0]
            ? {
                id: String((raw.shop_payments[0] as Record<string, unknown>).id),
                razorpay_order_id: String((raw.shop_payments[0] as Record<string, unknown>).razorpay_order_id),
                razorpay_payment_id: ((raw.shop_payments[0] as Record<string, unknown>).razorpay_payment_id as string | null) || null,
                status: String((raw.shop_payments[0] as Record<string, unknown>).status || 'created'),
                failure_reason: ((raw.shop_payments[0] as Record<string, unknown>).failure_reason as string | null) || null,
                created_at: String((raw.shop_payments[0] as Record<string, unknown>).created_at),
                captured_at: ((raw.shop_payments[0] as Record<string, unknown>).captured_at as string | null) || null,
            }
            : null,
    };
}

export async function fetchAdminShopOrders(): Promise<{ data: AdminShopOrderRecord[]; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return { data: [], error: auth.error };
    }

    try {
        const admin = createSupabaseAdminClient();
        const { data, error } = await admin
            .from('shop_orders')
            .select('id, user_id, order_number, shipping_address, subtotal, delivery_fee, total, currency, payment_status, order_status, transporter_name, tracking_id, tracking_url, admin_notes, created_at, paid_at, dispatched_at, delivered_at, shop_order_items(id, product_name, unit_price, quantity, line_total), shop_order_events(id, event_type, message, created_at, metadata), shop_payments(id, razorpay_order_id, razorpay_payment_id, status, failure_reason, created_at, captured_at)')
            .order('created_at', { ascending: false })
            .limit(300);

        if (error) {
            console.error('[shop-orders] fetchAdminShopOrders error:', error);
            return { data: [], error: error.message };
        }

        const orders = (data || []).map((row) => normalizeOrder(row as Record<string, unknown>));

        const enriched = orders.map((order) => {
            const addr = order.shipping_address || {};
            return {
                ...order,
                customer_name: String(addr.fullName || 'Customer'),
                customer_phone: String(addr.phone || '—'),
                customer_email: String(addr.email || ''),
            } as AdminShopOrderRecord;
        });

        return { data: enriched };
    } catch (err) {
        console.error('[shop-orders] fetchAdminShopOrders unexpected:', err);
        return { data: [], error: 'Failed to fetch shop orders.' };
    }
}

export async function fetchUserShopOrders(): Promise<{ data: ShopOrderRecord[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: [], error: 'Please login to view your orders.' };
        }

        const { data, error } = await supabase
            .from('shop_orders')
            .select('id, user_id, order_number, shipping_address, subtotal, delivery_fee, total, currency, payment_status, order_status, transporter_name, tracking_id, tracking_url, admin_notes, created_at, paid_at, dispatched_at, delivered_at, shop_order_items(id, product_name, unit_price, quantity, line_total), shop_order_events(id, event_type, message, created_at, metadata), shop_payments(id, razorpay_order_id, razorpay_payment_id, status, failure_reason, created_at, captured_at)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) {
            console.error('[shop-orders] fetchUserShopOrders error:', error);
            return { data: [], error: error.message };
        }

        const orders = (data || []).map((row) => normalizeOrder(row as Record<string, unknown>));

        for (const order of orders) {
            order.events = [...order.events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        return { data: orders };
    } catch (err) {
        console.error('[shop-orders] fetchUserShopOrders unexpected:', err);
        return { data: [], error: 'Failed to fetch your orders.' };
    }
}

interface UpdateAdminShopOrderInput {
    orderId: string;
    orderStatus?: ShopOrderStatus;
    transporterName?: string;
    trackingId?: string;
    trackingUrl?: string;
    adminNotes?: string;
}

export async function updateAdminShopOrder(input: UpdateAdminShopOrderInput): Promise<{ success: boolean; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return { success: false, error: auth.error };
    }

    try {
        const admin = createSupabaseAdminClient();

        const { data: currentOrder, error: currentError } = await admin
            .from('shop_orders')
            .select('id, user_id, order_number, order_status, payment_status, transporter_name, tracking_id, tracking_url, admin_notes, shipping_address')
            .eq('id', input.orderId)
            .single();

        if (currentError || !currentOrder) {
            return { success: false, error: 'Order not found.' };
        }

        const updates: Record<string, unknown> = {};

        let statusChanged = false;
        let nextStatus: ShopOrderStatus | null = null;

        if (input.orderStatus && input.orderStatus !== currentOrder.order_status) {
            const allowed = ORDER_TRANSITIONS[currentOrder.order_status as ShopOrderStatus] || [];
            if (!allowed.includes(input.orderStatus)) {
                return { success: false, error: `Invalid transition from ${currentOrder.order_status} to ${input.orderStatus}.` };
            }

            statusChanged = true;
            nextStatus = input.orderStatus;
            updates.order_status = input.orderStatus;

            if (input.orderStatus === 'dispatched') {
                updates.dispatched_at = new Date().toISOString();
            }

            if (input.orderStatus === 'delivered') {
                updates.delivered_at = new Date().toISOString();
            }

            if (input.orderStatus === 'refunded') {
                updates.payment_status = 'refunded';
            }
        }

        if (typeof input.transporterName === 'string') {
            updates.transporter_name = input.transporterName.trim() || null;
        }

        if (typeof input.trackingId === 'string') {
            updates.tracking_id = input.trackingId.trim() || null;
        }

        if (typeof input.trackingUrl === 'string') {
            updates.tracking_url = input.trackingUrl.trim() || null;
        }

        if (typeof input.adminNotes === 'string') {
            updates.admin_notes = input.adminNotes.trim() || null;
        }

        if (Object.keys(updates).length === 0) {
            return { success: true };
        }

        const { error: updateError } = await admin
            .from('shop_orders')
            .update(updates)
            .eq('id', input.orderId);

        if (updateError) {
            console.error('[shop-orders] updateAdminShopOrder update error:', updateError);
            return { success: false, error: updateError.message };
        }

        const eventId = `admin:${input.orderId}:${Date.now()}`;

        await admin
            .from('shop_order_events')
            .insert({
                order_id: input.orderId,
                actor_type: 'admin',
                actor_id: auth.adminId,
                event_type: statusChanged ? 'order_status_updated' : 'order_updated',
                message: statusChanged
                    ? `Order moved to ${nextStatus}.`
                    : 'Order details updated by admin.',
                metadata: {
                    updates,
                },
                source_event_id: eventId,
            });

        if (statusChanged && nextStatus) {
            const statusSourceKey = `order-status:${input.orderId}:${nextStatus}`;

            await admin
                .from('user_notifications')
                .upsert({
                    user_id: currentOrder.user_id,
                    order_id: input.orderId,
                    type: 'order_status',
                    title: 'Order Status Updated',
                    message: `Your order ${currentOrder.order_number} is now ${nextStatus.replaceAll('_', ' ')}.`,
                    source_event_id: `user:${statusSourceKey}`,
                    metadata: {
                        order_status: nextStatus,
                        order_number: currentOrder.order_number,
                    },
                }, { onConflict: 'source_event_id' });

            const shippingAddress = (currentOrder.shipping_address || {}) as Record<string, string>;

            await sendOrderNotifications({
                sourceEventId: statusSourceKey,
                orderId: input.orderId,
                orderNumber: currentOrder.order_number,
                title: 'Order Status Updated',
                message: `Your order ${currentOrder.order_number} is now ${nextStatus.replaceAll('_', ' ')}.`,
                customerName: String(shippingAddress.fullName || ''),
                customerEmail: String(shippingAddress.email || ''),
                customerPhone: String(shippingAddress.phone || ''),
                includeSms: false,
            });
        }

        revalidatePath('/admin/shop-orders');
        revalidatePath('/home/shop/orders');

        return { success: true };
    } catch (err) {
        console.error('[shop-orders] updateAdminShopOrder unexpected:', err);
        return { success: false, error: 'Failed to update order.' };
    }
}

export async function fetchAdminUnreadPaymentNotificationsCount(): Promise<{ count: number; error?: string }> {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return { count: 0, error: auth.error };
    }

    try {
        const admin = createSupabaseAdminClient();
        const { count, error } = await admin
            .from('admin_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('type', 'payment_received');

        if (error) {
            return { count: 0, error: error.message };
        }

        return { count: count || 0 };
    } catch (err) {
        console.error('[shop-orders] fetchAdminUnreadPaymentNotificationsCount unexpected:', err);
        return { count: 0, error: 'Failed to load notification count.' };
    }
}
