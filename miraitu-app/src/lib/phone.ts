/**
 * Normalize a raw phone-field value into a clean 10-digit Indian mobile number.
 *
 * Handles mobile autofill / paste that includes the country code, e.g.
 * "+91 9312321945", "91 9312321945" or "919312321945" — the leading "91"
 * (and any leading zero) is stripped so we keep the true 10-digit number
 * "9312321945" instead of naively slicing the first 10 characters (which would
 * wrongly keep "9193123219").
 *
 * NOTE: pair this with a generous `maxLength` (>= 13) on the input so the
 * browser doesn't truncate the autofilled country-code value before this runs.
 */
export function normalizeIndianPhone(raw: string): string {
    let digits = (raw || '').replace(/\D/g, '');

    // Strip the +91 / 91 country code when a full international number arrives.
    if (digits.length > 10 && digits.startsWith('91')) {
        digits = digits.slice(2);
    }

    // Strip a leading trunk zero (e.g. "09312321945").
    if (digits.length > 10 && digits.startsWith('0')) {
        digits = digits.replace(/^0+/, '');
    }

    return digits.slice(0, 10);
}
