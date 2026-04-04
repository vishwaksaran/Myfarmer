import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);

    if (aBuf.length !== bBuf.length) {
        return false;
    }

    return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyRazorpayPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
    secret: string;
}): boolean {
    const payload = `${params.orderId}|${params.paymentId}`;
    const expected = crypto.createHmac('sha256', params.secret).update(payload).digest('hex');
    return safeCompare(expected, params.signature);
}

export function verifyRazorpayWebhookSignature(params: {
    rawBody: string;
    signature: string;
    secret: string;
}): boolean {
    const expected = crypto.createHmac('sha256', params.secret).update(params.rawBody).digest('hex');
    return safeCompare(expected, params.signature);
}
