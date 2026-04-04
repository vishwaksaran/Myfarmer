import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { calculateShopOrder, type CheckoutItemInput } from '@/lib/shop-catalog';

export const runtime = 'nodejs';

interface ShippingAddress {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
}

interface CreateOrderBody {
    checkoutAttemptId: string;
    items: CheckoutItemInput[];
    shippingAddress: ShippingAddress;
}

function isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeItems(input: unknown): CheckoutItemInput[] {
    if (!Array.isArray(input)) {
        throw new Error('Invalid cart payload.');
    }

    return input.map((raw) => {
        if (!raw || typeof raw !== 'object') {
            throw new Error('Invalid cart item.');
        }

        const maybe = raw as { productId?: unknown; quantity?: unknown };
        const productId = Number(maybe.productId);
        const quantity = Number(maybe.quantity);

        return {
            productId,
            quantity,
        };
    });
}

function validateShippingAddress(input: unknown): { value?: ShippingAddress; error?: string } {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid shipping address.' };
    }

    const addr = input as Record<string, unknown>;

    const value: ShippingAddress = {
        fullName: String(addr.fullName || '').trim(),
        phone: String(addr.phone || '').trim(),
        email: String(addr.email || '').trim(),
        address: String(addr.address || '').trim(),
        city: String(addr.city || '').trim(),
        state: String(addr.state || '').trim(),
        pincode: String(addr.pincode || '').trim(),
        landmark: String(addr.landmark || '').trim(),
    };

    if (!value.fullName) return { error: 'Full name is required.' };
    if (!/^\d{10}$/.test(value.phone)) return { error: 'Valid 10-digit phone is required.' };
    if (!value.address) return { error: 'Address is required.' };
    if (!value.city) return { error: 'City is required.' };
    if (!value.state) return { error: 'State is required.' };
    if (!/^\d{6}$/.test(value.pincode)) return { error: 'Valid 6-digit pincode is required.' };

    if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
        return { error: 'Invalid email format.' };
    }

    return { value };
}

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured.');
    }

    return {
        keyId,
        client: new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        }),
    };
}

export async function POST(request: NextRequest) {
    try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Please login to continue checkout.' }, { status: 401 });
        }

        const body = (await request.json()) as Partial<CreateOrderBody>;

        const checkoutAttemptId = String(body.checkoutAttemptId || '').trim();
        if (!isValidUuid(checkoutAttemptId)) {
            return NextResponse.json({ error: 'Invalid checkout attempt id.' }, { status: 400 });
        }

        const shipping = validateShippingAddress(body.shippingAddress);
        if (shipping.error || !shipping.value) {
            return NextResponse.json({ error: shipping.error || 'Invalid shipping details.' }, { status: 400 });
        }

        const items = normalizeItems(body.items);
        const orderMath = calculateShopOrder(items);

        const admin = createSupabaseAdminClient();

        // Idempotency: if this checkout attempt already created a Razorpay order, return it.
        const { data: existingPayment } = await admin
            .from('shop_payments')
            .select('order_id, razorpay_order_id, amount, currency, status')
            .eq('checkout_attempt_id', checkoutAttemptId)
            .maybeSingle();

        if (existingPayment) {
            const { data: existingOrder } = await admin
                .from('shop_orders')
                .select('id, order_number, total, user_id, payment_status')
                .eq('id', existingPayment.order_id)
                .maybeSingle();

            if (existingOrder && existingOrder.user_id === user.id) {
                if (existingOrder.payment_status === 'paid') {
                    return NextResponse.json({
                        error: `Order ${existingOrder.order_number} is already paid.`,
                        alreadyPaid: true,
                        appOrderId: existingOrder.id,
                        orderNumber: existingOrder.order_number,
                    }, { status: 409 });
                }

                if (existingOrder.payment_status === 'payment_pending') {
                    const { keyId } = getRazorpayClient();

                    return NextResponse.json({
                        appOrderId: existingOrder.id,
                        orderNumber: existingOrder.order_number,
                        razorpayOrderId: existingPayment.razorpay_order_id,
                        amount: Math.round(Number(existingOrder.total) * 100),
                        currency: existingPayment.currency || 'INR',
                        razorpayKeyId: keyId,
                        reused: true,
                    });
                }
            }
        }

        const orderNumber = `MIR${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

        const { data: createdOrder, error: createOrderError } = await admin
            .from('shop_orders')
            .insert({
                user_id: user.id,
                order_number: orderNumber,
                checkout_attempt_id: checkoutAttemptId,
                shipping_address: shipping.value,
                subtotal: orderMath.subtotal,
                delivery_fee: orderMath.deliveryFee,
                total: orderMath.total,
                currency: 'INR',
                payment_method: 'razorpay',
                payment_status: 'payment_pending',
                order_status: 'created',
            })
            .select('id, order_number, total')
            .single();

        if (createOrderError || !createdOrder) {
            console.error('[razorpay/create-order] Failed to create app order:', createOrderError);
            return NextResponse.json({ error: 'Failed to initialize order.' }, { status: 500 });
        }

        const orderItemsPayload = orderMath.items.map((item) => ({
            order_id: createdOrder.id,
            product_id: item.productId,
            product_name: item.productName,
            unit_price: item.unitPrice,
            quantity: item.quantity,
            line_total: item.lineTotal,
        }));

        const { error: insertItemsError } = await admin
            .from('shop_order_items')
            .insert(orderItemsPayload);

        if (insertItemsError) {
            console.error('[razorpay/create-order] Failed to insert order items:', insertItemsError);
            await admin.from('shop_orders').delete().eq('id', createdOrder.id);
            return NextResponse.json({ error: 'Failed to initialize order items.' }, { status: 500 });
        }

        const { keyId, client } = getRazorpayClient();

        const razorpayOrder = await client.orders.create({
            amount: orderMath.totalPaise,
            currency: 'INR',
            receipt: createdOrder.order_number,
            notes: {
                app_order_id: createdOrder.id,
                user_id: user.id,
            },
        });

        const { error: insertPaymentError } = await admin
            .from('shop_payments')
            .insert({
                order_id: createdOrder.id,
                checkout_attempt_id: checkoutAttemptId,
                razorpay_order_id: razorpayOrder.id,
                amount: orderMath.total,
                currency: 'INR',
                status: 'created',
                gateway_payload: {
                    create_order_response: razorpayOrder,
                },
            });

        if (insertPaymentError) {
            console.error('[razorpay/create-order] Failed to persist payment record:', insertPaymentError);
            return NextResponse.json({ error: 'Failed to initialize payment.' }, { status: 500 });
        }

        await admin
            .from('shop_order_events')
            .insert({
                order_id: createdOrder.id,
                actor_type: 'system',
                event_type: 'order_created',
                message: 'Order created and payment initiated.',
                metadata: {
                    razorpay_order_id: razorpayOrder.id,
                },
                source_event_id: `create:${createdOrder.id}`,
            });

        return NextResponse.json({
            appOrderId: createdOrder.id,
            orderNumber: createdOrder.order_number,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            razorpayKeyId: keyId,
            reused: false,
        });
    } catch (error) {
        console.error('[razorpay/create-order] Unexpected error:', error);
        return NextResponse.json({ error: 'Unable to start payment right now. Please try again.' }, { status: 500 });
    }
}
