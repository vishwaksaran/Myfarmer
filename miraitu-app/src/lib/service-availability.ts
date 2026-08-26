'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

/**
 * What every form says back once it has taken a farmer's details, while
 * Miraitu is not yet operating in their area.
 *
 * One constant rather than sixteen copies. Each board, land form and service
 * page had grown its own confirmation and they had drifted — five different
 * verbs ("Booked", "Requested", "Sent", "Submitted", "Scheduled") for what is
 * the same saved row. When service resumes, the wording changes here once.
 *
 * The submission itself is unchanged: the lead still reaches Supabase. Only
 * the promise of a callback is withdrawn.
 *
 * This used to open with "Thank You" over a green tick, which read as a
 * confirmed booking — farmers had to reach the third sentence before learning
 * nothing had been booked. The heading now carries the outcome and the tick is
 * gone; the thanks moved to the end, where it no longer contradicts the news.
 *
 * Every form's original wording is recorded in `docs/TEMPORARY-CHANGES.md`
 * (entry 12) — restore from there rather than from memory.
 */

/**
 * Whether the form the farmer just submitted books something (a machine, a
 * visit, a service slot) or asks for something (a listing, a membership, a
 * test). Only the heading noun differs; everything else is shared.
 */
export type SubmissionKind = 'booking' | 'request';

export const SUBMISSION_HEADINGS: Record<SubmissionKind, string> = {
    booking: 'Booking Not Confirmed',
    request: 'Request Not Confirmed',
};

/** Sits directly under the heading, so the reason is visible without reading on. */
export const SUBMISSION_BADGE = 'Not serviceable in your area';

export const SUBMISSION_MESSAGE =
    'We have your details, but Miraitu does not operate in your area yet, so we could not confirm this. We will get in touch as soon as we start serving your area. Thank you for your interest.';

/**
 * The card's visual treatment. Amber, not green, and a struck-through location
 * pin rather than a tick — the icon has to carry the same news as the heading,
 * because it is the first thing read and the last thing remembered.
 */
export const SUBMISSION_ICON = 'wrong_location';

export const SUBMISSION_ACCENT = {
    /** For the circle behind the icon. */
    circle: 'bg-amber-100 dark:bg-amber-500/15',
    /** For the icon itself — replaces the `text-white` these cards used on green. */
    icon: 'text-amber-600 dark:text-amber-400',
    /** For the badge pill under the heading. */
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
};

/**
 * The strings in the farmer's chosen language.
 *
 * A hook rather than raw constants because half these forms — the land forms,
 * CCTV, the carts, the loan application — carry no `tp` of their own, and this
 * notice is the one message every farmer is guaranteed to read. The strings
 * live in `i18n/pageContent.ts`, keyed by their English text; `translatePage`
 * falls back to that English if a language is ever missing, so a gap in the
 * dictionary degrades rather than blanks the modal.
 */
export function useSubmissionCopy(kind: SubmissionKind = 'request'): {
    heading: string;
    badge: string;
    message: string;
} {
    const { lang } = useLanguage();
    return {
        heading: translatePage(lang, SUBMISSION_HEADINGS[kind]),
        badge: translatePage(lang, SUBMISSION_BADGE),
        message: translatePage(lang, SUBMISSION_MESSAGE),
    };
}
