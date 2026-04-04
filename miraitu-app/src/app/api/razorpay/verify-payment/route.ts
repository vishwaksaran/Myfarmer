import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay-signature';
import { sendOrderNotifications } from '@/lib/notification-delivery';

export const runtime = 'nodejs';

interface VerifyPaymentBody {
    appOrderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

function isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
    try {
        const paymentMode = String(process.env.NEXT_PUBLIC_RAZORPAY_MODE || 'test').toLowerCase();
        if (paymentMode !== 'live') {
            return NextResponse.json({ error: 'Payment verification is disabled in test mode.' }, { status: 403 });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 500 });
        }

        const supabaseServer = await createSupabaseServerClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Please login to verify payment.' }, { status: 401 });
        }

        const body = (await request.json()) as Partial<VerifyPaymentBody>;

        const appOrderId = String(body.appOrderId || '').trim();
        const razorpayOrderId = String(body.razorpayOrderId || '').trim();
        const razorpayPaymentId = String(body.razorpayPaymentId || '').trim();
        const razorpaySignature = String(body.razorpaySignature || '').trim();

        if (!isValidUuid(appOrderId) || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json({ error: 'Invalid payment verification payload.' }, { status: 400 });
        }

        const isValidSignature = verifyRazorpayPaymentSignature({
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            signature: razorpaySignature,
            secret: keySecret,
        });

        if (!isValidSignature) {
            return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
        }

        const admin = createSupabaseAdminClient();

        const { data: order, error: orderError } = await admin
            .from('shop_orders')
            .select('id, user_id, order_number, total, payment_status, shipping_address')
            .eq('id', appOrderId)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found for this user.' }, { status: 404 });
        }

        const { data: paymentRecord, error: paymentError } = await admin
            .from('shop_payments')
            .select('id, order_id, status, razorpay_order_id, razorpay_payment_id')
            .eq('order_id', appOrderId)
            .single();

        if (paymentError || !paymentRecord) {
            return NextResponse.json({ error: 'Payment record missing for this order.' }, { status: 404 });
        }

        if (paymentRecord.razorpay_order_id !== razorpayOrderId) {
            return NextResponse.json({ error: 'Order id mismatch during verification.' }, { status: 400 });
        }

        if (paymentRecord.status === 'captured' && paymentRecord.razorpay_payment_id === razorpayPaymentId) {
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                orderNumber: order.order_number,
                orderId: order.id,
            });
        }

        if (paymentRecord.status === 'captured' && paymentRecord.razorpay_payment_id !== razorpayPaymentId) {
            return NextResponse.json({ error: 'Order already has a different successful payment id.' }, { status: 409 });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const gatewayPayment = await razorpay.payments.fetch(razorpayPaymentId);
        const gatewayPayload = JSON.parse(JSON.stringify(gatewayPayment)) as Record<string, unknown>;

        const gatewayOrderId = String(gatewayPayment.order_id || '');
        const gatewayStatus = String(gatewayPayment.status || '');
        const gatewayAmountPaise = Number(gatewayPayment.amount || 0);
        const expectedAmountPaise = Math.round(Number(order.total) * 100);

        if (gatewayOrderId !== razorpayOrderId) {
            return NextResponse.json({ error: 'Gateway order id does not match.' }, { status: 400 });
        }

        if (gatewayAmountPaise !== expectedAmountPaise) {
            return NextResponse.json({ error: 'Payment amount mismatch detected.' }, { status: 400 });
        }

        if (gatewayStatus !== 'captured') {
            return NextResponse.json({ error: 'Payment is not captured yet. Please wait and retry.' }, { status: 409 });
        }

        const paidAtIso = new Date().toISOString();

        const { error: updatePaymentError } = await admin
            .from('shop_payments')
            .update({
                status: 'captured',
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature,
                amount: gatewayAmountPaise / 100,
                captured_at: paidAtIso,
                gateway_payload: {
                    verify_payment_response: gatewayPayload,
                },
            })
            .eq('id', paymentRecord.id);

        if (updatePaymentError) {
            console.error('[razorpay/verify-payment] Payment update failed:', updatePaymentError);
            return NextResponse.json({ error: 'Failed to finalize payment status.' }, { status: 500 });
        }

        const { error: updateOrderError } = await admin
            .from('shop_orders')
            .update({
                payment_status: 'paid',
                order_status: 'paid',
                paid_at: paidAtIso,
            })
            .eq('id', order.id);

        if (updateOrderError) {
            console.error('[razorpay/verify-payment] Order update failed:', updateOrderError);
            return NextResponse.json({ error: 'Failed to finalize order status.' }, { status: 500 });
        }

        const sourceKey = `payment:${razorpayPaymentId}:captured`;

        await admin
            .from('shop_order_events')
            .upsert({
                order_id: order.id,
                actor_type: 'system',
                event_type: 'payment_captured',
                message: 'Payment received successfully.',
                metadata: {
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_order_id: razorpayOrderId,
                },
                source_event_id: `event:${sourceKey}`,
            }, { onConflict: 'source_event_id' });

        await admin
            .from('user_notifications')
            .upsert({
                user_id: user.id,
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
                    user_id: user.id,
                    order_number: order.order_number,
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

        return NextResponse.json({
            success: true,
            alreadyProcessed: false,
            orderNumber: order.order_number,
            orderId: order.id,
        });
    } catch (error) {
        console.error('[razorpay/verify-payment] Unexpected error:', error);
        return NextResponse.json({ error: 'Unable to verify payment right now.' }, { status: 500 });
    }
}
