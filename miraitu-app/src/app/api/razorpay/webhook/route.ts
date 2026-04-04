import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay-signature';
import { sendOrderNotifications } from '@/lib/notification-delivery';

export const runtime = 'nodejs';

type RazorpayWebhookEvent = {
    event?: string;
    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
                amount?: number;
                status?: string;
                error_description?: string;
            };
        };
    };
    created_at?: number;
};

async function markPaymentCaptured(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amountPaise: number;
}) {
    const admin = createSupabaseAdminClient();

    const { data: payment } = await admin
        .from('shop_payments')
        .select('id, order_id, status, razorpay_payment_id')
        .eq('razorpay_order_id', input.razorpayOrderId)
        .maybeSingle();

    if (!payment) return;

    if (payment.status === 'captured') {
        return;
    }

    const paidAtIso = new Date().toISOString();

    await admin
        .from('shop_payments')
        .update({
            status: 'captured',
            razorpay_payment_id: input.razorpayPaymentId,
            amount: input.amountPaise / 100,
            captured_at: paidAtIso,
        })
        .eq('id', payment.id);

    const { data: order } = await admin
        .from('shop_orders')
        .update({
            payment_status: 'paid',
            order_status: 'paid',
            paid_at: paidAtIso,
        })
        .eq('id', payment.order_id)
        .select('id, user_id, order_number, shipping_address')
        .single();

    if (!order) return;

    const sourceKey = `payment:${input.razorpayPaymentId}:captured`;

    await admin
        .from('shop_order_events')
        .upsert({
            order_id: order.id,
            actor_type: 'webhook',
            event_type: 'payment_captured',
            message: 'Payment captured via webhook.',
            metadata: {
                razorpay_payment_id: input.razorpayPaymentId,
                razorpay_order_id: input.razorpayOrderId,
            },
            source_event_id: `event:${sourceKey}`,
        }, { onConflict: 'source_event_id' });

    await admin
        .from('user_notifications')
        .upsert({
            user_id: order.user_id,
            order_id: order.id,
            type: 'payment_received',
            title: 'Payment Successful',
            message: `We received your payment for order ${order.order_number}.`,
            source_event_id: `user:${sourceKey}`,
            metadata: {
                order_number: order.order_number,
            },
        }, { onConflict: 'source_event_id' });

    await admin
        .from('admin_notifications')
        .upsert({
            order_id: order.id,
            type: 'payment_received',
            title: 'New Paid Shop Order',
            message: `Payment captured for order ${order.order_number}.`,
            source_event_id: `admin:${sourceKey}`,
            metadata: {
                order_number: order.order_number,
                user_id: order.user_id,
            },
        }, { onConflict: 'source_event_id' });

    const shippingAddress = (order.shipping_address || {}) as Record<string, string>;

    await sendOrderNotifications({
        sourceEventId: sourceKey,
        orderId: order.id,
        orderNumber: order.order_number,
        title: 'Payment Successful',
        message: `We received your payment for order ${order.order_number}.`,
        customerName: String(shippingAddress.fullName || ''),
        customerEmail: String(shippingAddress.email || ''),
        customerPhone: String(shippingAddress.phone || ''),
        includeSms: false,
    });
}

async function markPaymentFailed(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    reason: string;
}) {
    const admin = createSupabaseAdminClient();

    const { data: payment } = await admin
        .from('shop_payments')
        .select('id, order_id, status')
        .eq('razorpay_order_id', input.razorpayOrderId)
        .maybeSingle();

    if (!payment) return;

    if (payment.status === 'captured') {
        return;
    }

    await admin
        .from('shop_payments')
        .update({
            status: 'failed',
            razorpay_payment_id: input.razorpayPaymentId,
            failure_reason: input.reason,
        })
        .eq('id', payment.id);

    const { data: order } = await admin
        .from('shop_orders')
        .update({
            payment_status: 'failed',
            order_status: 'payment_failed',
        })
        .eq('id', payment.order_id)
        .neq('payment_status', 'paid')
        .select('id, user_id, order_number, shipping_address')
        .maybeSingle();

    if (!order) return;

    const sourceKey = `payment:${input.razorpayPaymentId}:failed`;

    await admin
        .from('shop_order_events')
        .upsert({
            order_id: order.id,
            actor_type: 'webhook',
            event_type: 'payment_failed',
            message: `Payment failed: ${input.reason || 'Unknown reason'}`,
            metadata: {
                razorpay_payment_id: input.razorpayPaymentId,
                razorpay_order_id: input.razorpayOrderId,
            },
            source_event_id: `event:${sourceKey}`,
        }, { onConflict: 'source_event_id' });

    await admin
        .from('user_notifications')
        .upsert({
            user_id: order.user_id,
            order_id: order.id,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Payment failed for order ${order.order_number}. You can retry from My Orders.`,
            source_event_id: `user:${sourceKey}`,
            metadata: {
                reason: input.reason,
                order_number: order.order_number,
            },
        }, { onConflict: 'source_event_id' });

    await admin
        .from('admin_notifications')
        .upsert({
            order_id: order.id,
            type: 'payment_failed',
            title: 'Shop Payment Failed',
            message: `Payment failed for order ${order.order_number}.`,
            source_event_id: `admin:${sourceKey}`,
            metadata: {
                reason: input.reason,
                order_number: order.order_number,
                user_id: order.user_id,
            },
        }, { onConflict: 'source_event_id' });

    const shippingAddress = (order.shipping_address || {}) as Record<string, string>;

    await sendOrderNotifications({
        sourceEventId: sourceKey,
        orderId: order.id,
        orderNumber: order.order_number,
        title: 'Payment Failed',
        message: `Payment failed for order ${order.order_number}. You can retry from My Orders.`,
        customerName: String(shippingAddress.fullName || ''),
        customerEmail: String(shippingAddress.email || ''),
        customerPhone: String(shippingAddress.phone || ''),
        includeSms: false,
    });
}

export async function POST(request: NextRequest) {
    try {
        const paymentMode = String(process.env.NEXT_PUBLIC_RAZORPAY_MODE || 'test').toLowerCase();
        if (paymentMode !== 'live') {
            return NextResponse.json({ ok: true, skipped: 'test_mode' });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
        }

        const signature = request.headers.get('x-razorpay-signature');
        if (!signature) {
            return NextResponse.json({ error: 'Missing webhook signature.' }, { status: 400 });
        }

        const rawBody = await request.text();
        const isSignatureValid = verifyRazorpayWebhookSignature({
            rawBody,
            signature,
            secret: webhookSecret,
        });

        if (!isSignatureValid) {
            return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
        }

        const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
        const eventType = String(event.event || '');

        const paymentEntity = event.payload?.payment?.entity;
        if (!paymentEntity) {
            return NextResponse.json({ ok: true });
        }

        const razorpayPaymentId = String(paymentEntity.id || '');
        const razorpayOrderId = String(paymentEntity.order_id || '');
        const amountPaise = Number(paymentEntity.amount || 0);

        if (!razorpayOrderId) {
            return NextResponse.json({ ok: true });
        }

        if (eventType === 'payment.captured') {
            await markPaymentCaptured({
                razorpayOrderId,
                razorpayPaymentId,
                amountPaise,
            });
        }

        if (eventType === 'payment.failed') {
            await markPaymentFailed({
                razorpayOrderId,
                razorpayPaymentId,
                reason: String(paymentEntity.error_description || 'Payment failed at gateway'),
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[razorpay/webhook] Unexpected error:', error);
        return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }
}
