'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

export interface ProviderReview {
    id: string;
    provider_id: string;
    booking_id: string | null;
    reviewer_id: string | null;
    reviewer_name: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface ReviewSummary {
    average: number;
    count: number;
}

interface ActionResult {
    success: boolean;
    error?: string;
}

// ─── Provider: fetch reviews received + summary ──────────────────────

export async function fetchMyReviews(): Promise<{
    reviews: ProviderReview[];
    summary: ReviewSummary;
    error?: string;
}> {
    const empty = { reviews: [], summary: { average: 0, count: 0 } };
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { ...empty, error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('provider_reviews')
            .select('*')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[fetchMyReviews] Error:', error);
            return { ...empty, error: error.message };
        }

        const reviews = (data as ProviderReview[]) || [];
        const count = reviews.length;
        const average = count > 0
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
            : 0;

        return { reviews, summary: { average, count } };
    } catch (err) {
        console.error('[fetchMyReviews] Unexpected error:', err);
        return { ...empty, error: 'Failed to fetch reviews' };
    }
}

// ─── Customer: create a review for a provider ────────────────────────

export async function createProviderReview(
    providerId: string,
    rating: number,
    comment?: string,
    bookingId?: string,
): Promise<ActionResult> {
    if (!providerId) return { success: false, error: 'Provider is required' };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
    }
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const reviewerName =
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            null;

        const { error } = await supabase.from('provider_reviews').insert({
            provider_id: providerId,
            reviewer_id: user.id,
            reviewer_name: reviewerName,
            rating,
            comment: comment?.trim() || null,
            booking_id: bookingId || null,
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        console.error('[createProviderReview] Unexpected error:', err);
        return { success: false, error: 'Failed to submit review' };
    }
}
