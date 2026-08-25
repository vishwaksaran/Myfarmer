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
 * Every form's original wording is recorded in `docs/TEMPORARY-CHANGES.md`
 * (entry 12) — restore from there rather than from memory.
 */
export const SUBMISSION_HEADING = 'Thank You';

export const SUBMISSION_MESSAGE =
    'Thank you for submitting your details. Unfortunately, we’re currently not operating in your area. We appreciate your interest and hope to serve you in the future.';

/**
 * The same two strings in the farmer's chosen language.
 *
 * A hook rather than raw constants because half these forms — the land forms,
 * CCTV, the carts, the loan application — carry no `tp` of their own, and this
 * notice is the one message every farmer is guaranteed to read. Both strings
 * live in `i18n/pageContent.ts`, keyed by their English text; `translatePage`
 * falls back to that English if a language is ever missing, so a gap in the
 * dictionary degrades rather than blanks the modal.
 */
export function useSubmissionCopy(): { heading: string; message: string } {
    const { lang } = useLanguage();
    return {
        heading: translatePage(lang, SUBMISSION_HEADING),
        message: translatePage(lang, SUBMISSION_MESSAGE),
    };
}
