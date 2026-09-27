/**
 * What a buyer can ask for, and how.
 *
 * Shared by the homepage panel, the mobile modal and the admin screen so the
 * three cannot drift — admin's category filter is built from the same list the
 * buyer picked from.
 */

export const REQUIREMENT_CATEGORIES = [
    'Tractor',
    'JCB',
    'Harvester',
    'Farm implements',
    'Drone',
    'Power sprayer',
    'Cows',
    'Buffalo',
    'Goats',
    'Seeds',
    'Fertilizers',
    'Pesticides',
    'Farm produce',
    'Other',
] as const;

export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

export const CONDITION_OPTIONS = [
    { value: 'any', label: 'New or used' },
    { value: 'new', label: 'New only' },
    { value: 'used', label: 'Used only' },
] as const;

export type RequirementCondition = (typeof CONDITION_OPTIONS)[number]['value'];

/**
 * Free text rather than a date picker. "Before sowing" and "this week" are
 * both real answers, and a calendar forces a precision the buyer does not have.
 */
export const TIMEFRAME_SUGGESTIONS = [
    'Immediately',
    'Within a week',
    'Within a month',
    'Before next season',
    'Just checking prices',
] as const;

export const REQUIREMENT_STATUSES = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'closed', label: 'Closed' },
] as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number]['value'];

/** Matches the cap the upload route enforces. */
export const MAX_REQUIREMENT_IMAGES = 3;
