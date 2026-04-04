import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
type DeliveryStatus = 'sent' | 'failed' | 'skipped';

interface DeliveryResult {
    status: DeliveryStatus;
    provider: string;
    externalMessageId?: string;
    errorMessage?: string;
    payload?: Record<string, unknown>;
}

interface ChannelContext {
    sourceEventId: string;
    orderId: string;
    orderNumber: string;
    title: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    includeSms?: boolean;
}

export interface OrderNotificationInput {
    sourceEventId: string;
    orderId: string;
    orderNumber: string;
    title: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    includeSms?: boolean;
}

function escapeHtml(input: string): string {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizePhone(raw: string | undefined): string {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('+')) {
        const digits = `+${trimmed.slice(1).replace(/\D/g, '')}`;
        return digits.length >= 11 ? digits : '';
    }

    const digits = trimmed.replace(/\D/g, '');

    if (digits.length === 10) {
        return `+91${digits}`;
    }

    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }

    return '';
}

function decodeJsonSafe(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return value as Record<string, unknown>;
}

async function markSkipped(params: {
    channel: DeliveryChannel;
    sourceEventId: string;
    recipient: string;
    provider: string;
    reason: string;
    payload?: Record<string, unknown>;
}) {
    const admin = createSupabaseAdminClient();
    await admin
        .from('notification_deliveries')
        .upsert({
            source_event_id: params.sourceEventId,
            channel: params.channel,
            recipient: params.recipient || null,
            provider: params.provider,
            status: 'skipped',
            attempt_count: 0,
            error_message: params.reason,
            payload: params.payload || {},
        }, { onConflict: 'source_event_id,channel' });
}

async function reserveDeliverySlot(params: {
    channel: DeliveryChannel;
    sourceEventId: string;
    recipient: string;
    provider: string;
    payload?: Record<string, unknown>;
}): Promise<boolean> {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
        .from('notification_deliveries')
        .insert({
            source_event_id: params.sourceEventId,
            channel: params.channel,
            recipient: params.recipient,
            provider: params.provider,
            status: 'pending',
            attempt_count: 1,
            payload: params.payload || {},
        });

    if (!error) {
        return true;
    }

    if (error.code === '23505') {
        return false;
    }

    console.error('[notification-delivery] Failed to reserve slot:', error);
    return false;
}

async function finalizeDelivery(params: {
    channel: DeliveryChannel;
    sourceEventId: string;
    result: DeliveryResult;
}) {
    const admin = createSupabaseAdminClient();

    const updatePayload: Record<string, unknown> = {
        status: params.result.status,
        provider: params.result.provider,
        external_message_id: params.result.externalMessageId || null,
        error_message: params.result.errorMessage || null,
        payload: params.result.payload || {},
    };

    if (params.result.status === 'sent') {
        updatePayload.sent_at = new Date().toISOString();
    }

    await admin
        .from('notification_deliveries')
        .update(updatePayload)
        .eq('source_event_id', params.sourceEventId)
        .eq('channel', params.channel);
}

async function sendEmail(context: ChannelContext): Promise<DeliveryResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!context.customerEmail) {
        return {
            status: 'skipped',
            provider: 'resend',
            errorMessage: 'customer_email_missing',
        };
    }

    if (!apiKey || !from) {
        return {
            status: 'skipped',
            provider: 'resend',
            errorMessage: 'resend_config_missing',
        };
    }

    try {
        const customerName = escapeHtml(context.customerName || 'Customer');
        const message = escapeHtml(context.message);
        const orderNumber = escapeHtml(context.orderNumber);
        const title = escapeHtml(context.title);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: [context.customerEmail],
                subject: `${context.title} - Order ${context.orderNumber}`,
                html: `<div><p>Hi ${customerName},</p><p>${message}</p><p><strong>Order:</strong> ${orderNumber}</p><p>Team Miraitu</p></div>`,
                text: `Hi ${context.customerName || 'Customer'},\n\n${context.message}\nOrder: ${context.orderNumber}\n\nTeam Miraitu`,
                tags: [
                    { name: 'module', value: 'shop' },
                    { name: 'order_id', value: context.orderId },
                ],
            }),
            signal: AbortSignal.timeout(12000),
        });

        const raw = await response.json().catch(() => ({}));
        const parsed = decodeJsonSafe(raw);

        if (!response.ok) {
            const providerError = String(parsed.message || parsed.error || 'email_send_failed');
            return {
                status: 'failed',
                provider: 'resend',
                errorMessage: providerError,
                payload: {
                    response: parsed,
                    title,
                },
            };
        }

        return {
            status: 'sent',
            provider: 'resend',
            externalMessageId: String(parsed.id || ''),
            payload: {
                response: parsed,
                title,
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'email_send_failed';
        return {
            status: 'failed',
            provider: 'resend',
            errorMessage: message,
        };
    }
}

async function sendTwilioMessage(params: {
    from: string;
    to: string;
    body: string;
}): Promise<DeliveryResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'twilio_config_missing',
        };
    }

    try {
        const auth = Buffer.from(`${sid}:${token}`).toString('base64');
        const payload = new URLSearchParams({
            From: params.from,
            To: params.to,
            Body: params.body,
        });

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload.toString(),
            signal: AbortSignal.timeout(12000),
        });

        const raw = await response.json().catch(() => ({}));
        const parsed = decodeJsonSafe(raw);

        if (!response.ok) {
            return {
                status: 'failed',
                provider: 'twilio',
                errorMessage: String(parsed.message || parsed.error_message || 'twilio_send_failed'),
                payload: {
                    response: parsed,
                },
            };
        }

        return {
            status: 'sent',
            provider: 'twilio',
            externalMessageId: String(parsed.sid || ''),
            payload: {
                response: parsed,
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'twilio_send_failed';
        return {
            status: 'failed',
            provider: 'twilio',
            errorMessage: message,
        };
    }
}

async function sendWhatsApp(context: ChannelContext): Promise<DeliveryResult> {
    const from = process.env.TWILIO_WHATSAPP_FROM;

    const normalizedPhone = normalizePhone(context.customerPhone);
    if (!normalizedPhone) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'customer_phone_missing_or_invalid',
        };
    }

    if (!from) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'twilio_whatsapp_from_missing',
        };
    }

    return sendTwilioMessage({
        from,
        to: `whatsapp:${normalizedPhone}`,
        body: `[${context.title}] ${context.message} | Order: ${context.orderNumber}`,
    });
}

async function sendSms(context: ChannelContext): Promise<DeliveryResult> {
    if (!context.includeSms) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'sms_disabled',
        };
    }

    const from = process.env.TWILIO_SMS_FROM;
    const normalizedPhone = normalizePhone(context.customerPhone);

    if (!normalizedPhone) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'customer_phone_missing_or_invalid',
        };
    }

    if (!from) {
        return {
            status: 'skipped',
            provider: 'twilio',
            errorMessage: 'twilio_sms_from_missing',
        };
    }

    return sendTwilioMessage({
        from,
        to: normalizedPhone,
        body: `${context.title}: ${context.message} (Order: ${context.orderNumber})`,
    });
}

async function deliverChannel(params: {
    channel: DeliveryChannel;
    context: ChannelContext;
    recipient: string;
    provider: string;
    sender: () => Promise<DeliveryResult>;
}) {
    if (!params.recipient) {
        await markSkipped({
            channel: params.channel,
            sourceEventId: params.context.sourceEventId,
            recipient: '',
            provider: params.provider,
            reason: 'recipient_missing',
            payload: {
                order_id: params.context.orderId,
                order_number: params.context.orderNumber,
            },
        });
        return;
    }

    const reserved = await reserveDeliverySlot({
        channel: params.channel,
        sourceEventId: params.context.sourceEventId,
        recipient: params.recipient,
        provider: params.provider,
        payload: {
            order_id: params.context.orderId,
            order_number: params.context.orderNumber,
            title: params.context.title,
        },
    });

    if (!reserved) {
        return;
    }

    const result = await params.sender();

    await finalizeDelivery({
        channel: params.channel,
        sourceEventId: params.context.sourceEventId,
        result,
    });
}

export async function sendOrderNotifications(input: OrderNotificationInput): Promise<void> {
    const context: ChannelContext = {
        sourceEventId: input.sourceEventId,
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        title: input.title,
        message: input.message,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        includeSms: Boolean(input.includeSms),
    };

    const normalizedPhone = normalizePhone(context.customerPhone);

    await Promise.all([
        deliverChannel({
            channel: 'email',
            context,
            recipient: context.customerEmail || '',
            provider: 'resend',
            sender: () => sendEmail(context),
        }),
        deliverChannel({
            channel: 'whatsapp',
            context,
            recipient: normalizedPhone,
            provider: 'twilio',
            sender: () => sendWhatsApp(context),
        }),
        deliverChannel({
            channel: 'sms',
            context,
            recipient: normalizedPhone,
            provider: 'twilio',
            sender: () => sendSms(context),
        }),
    ]);
}