'use client';

import { useState } from 'react';
import { submitBooking, type BookingFormData, type BookingResult } from '@/app/actions/bookings';

/**
 * Hook to submit any booking form to Supabase via server action.
 * 
 * Usage:
 *   const { submit, submitting, result } = useBookingSubmit();
 *   await submit({ module: 'services', category: 'harvester', full_name, phone, location });
 */
export function useBookingSubmit() {
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<BookingResult | null>(null);

    const submit = async (data: BookingFormData): Promise<BookingResult> => {
        setSubmitting(true);
        setResult(null);
        try {
            const res = await submitBooking(data);
            setResult(res);
            return res;
        } catch {
            const errorResult: BookingResult = { success: false, error: 'Network error. Please try again.' };
            setResult(errorResult);
            return errorResult;
        } finally {
            setSubmitting(false);
        }
    };

    return { submit, submitting, result };
}
