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

// ─── What to ask, per category ───────────────────────────────────────
//
// One fixed question set asked a farmer buying a cow whether she was "new or
// used", and offered "e.g. 1 unit, 20 bags" as the quantity hint whether they
// wanted a tractor or twenty quintals of paddy. The shared fields now adapt,
// and each group gains the two or three things a seller would ring back and
// ask anyway.

export interface ExtraField {
    /** Stored under this key in `details`. */
    key: string;
    label: string;
    placeholder?: string;
    /** Given options, renders a dropdown instead of a text box. */
    options?: string[];
}

export interface CategoryQuestions {
    /** New or used only means something for things that wear out. */
    showCondition: boolean;
    /** Null hides the product/model row entirely. */
    modelLabel: string | null;
    modelPlaceholder: string;
    quantityLabel: string;
    quantityPlaceholder: string;
    budgetPlaceholder: string;
    extras: ExtraField[];
}

const MACHINERY_BASE: Omit<CategoryQuestions, 'extras'> = {
    showCondition: true,
    modelLabel: 'Brand / model',
    modelPlaceholder: 'e.g. Mahindra 575',
    quantityLabel: 'How many',
    quantityPlaceholder: 'e.g. 1 unit',
    budgetPlaceholder: 'e.g. under ₹5 lakh',
};

const LIVESTOCK_BASE: Omit<CategoryQuestions, 'extras'> = {
    showCondition: false,
    modelLabel: null,
    modelPlaceholder: '',
    quantityLabel: 'How many animals',
    quantityPlaceholder: 'e.g. 5',
    budgetPlaceholder: 'e.g. ₹50,000 per animal',
};

const INPUT_BASE: Omit<CategoryQuestions, 'extras'> = {
    showCondition: false,
    modelLabel: 'Brand (if any)',
    modelPlaceholder: 'e.g. Coromandel',
    quantityLabel: 'Quantity needed',
    quantityPlaceholder: 'e.g. 20 bags, 50 kg',
    budgetPlaceholder: 'e.g. ₹1,200 per bag',
};

/** Age reads the same for every animal, so it is written once. */
const AGE_FIELD: ExtraField = { key: 'age', label: 'Age wanted', placeholder: 'e.g. 2 to 3 years' };

const USED_FIELDS: ExtraField[] = [
    { key: 'year', label: 'Year (if used)', placeholder: 'e.g. 2019' },
    { key: 'hoursRun', label: 'Hours run (if used)', placeholder: 'e.g. under 2000' },
];

export const CATEGORY_QUESTIONS: Record<string, CategoryQuestions> = {
    Tractor: {
        ...MACHINERY_BASE,
        extras: [{ key: 'hp', label: 'Horsepower', placeholder: 'e.g. 45 HP' }, ...USED_FIELDS],
    },
    JCB: {
        ...MACHINERY_BASE,
        modelPlaceholder: 'e.g. JCB 3DX',
        extras: [
            { key: 'purpose', label: 'What for', placeholder: 'e.g. pond digging, levelling' },
            ...USED_FIELDS,
        ],
    },
    Harvester: {
        ...MACHINERY_BASE,
        modelPlaceholder: 'e.g. Kartar 4000',
        extras: [
            { key: 'cropType', label: 'Which crop', placeholder: 'e.g. paddy, wheat' },
            ...USED_FIELDS,
        ],
    },
    'Farm implements': {
        ...MACHINERY_BASE,
        modelPlaceholder: 'e.g. rotavator, cultivator',
        extras: [
            { key: 'implementType', label: 'Type of implement', placeholder: 'e.g. rotavator, seed drill' },
            { key: 'tractorHp', label: 'Your tractor HP', placeholder: 'e.g. 45 HP' },
        ],
    },
    Drone: {
        ...MACHINERY_BASE,
        modelPlaceholder: 'e.g. Garuda Kisan',
        extras: [
            { key: 'tankCapacity', label: 'Tank capacity', placeholder: 'e.g. 10 litres' },
            { key: 'dgcaNeeded', label: 'DGCA certified needed?', options: ['Yes', 'No', 'Not sure'] },
        ],
    },
    'Power sprayer': {
        ...MACHINERY_BASE,
        modelPlaceholder: 'e.g. Aspee knapsack',
        extras: [
            { key: 'sprayerType', label: 'Type', options: ['Battery', 'Manual', 'Engine / petrol', 'Not sure'] },
            { key: 'tankCapacity', label: 'Tank capacity', placeholder: 'e.g. 16 litres' },
        ],
    },

    Cows: {
        ...LIVESTOCK_BASE,
        extras: [
            { key: 'breed', label: 'Breed', placeholder: 'e.g. Sahiwal, Gir, HF' },
            AGE_FIELD,
            { key: 'milkYield', label: 'Milk yield wanted', placeholder: 'e.g. 12 litres a day' },
            { key: 'lactation', label: 'Lactation', options: ['First', 'Second', 'Third or more', 'No preference'] },
        ],
    },
    Buffalo: {
        ...LIVESTOCK_BASE,
        extras: [
            { key: 'breed', label: 'Breed', placeholder: 'e.g. Murrah, Jaffarabadi' },
            AGE_FIELD,
            { key: 'milkYield', label: 'Milk yield wanted', placeholder: 'e.g. 10 litres a day' },
            { key: 'lactation', label: 'Lactation', options: ['First', 'Second', 'Third or more', 'No preference'] },
        ],
    },
    Goats: {
        ...LIVESTOCK_BASE,
        budgetPlaceholder: 'e.g. ₹8,000 per goat',
        extras: [
            { key: 'breed', label: 'Breed', placeholder: 'e.g. Osmanabadi, Sirohi' },
            AGE_FIELD,
            { key: 'purpose', label: 'What for', options: ['Meat', 'Breeding', 'Milk', 'No preference'] },
        ],
    },

    Seeds: {
        ...INPUT_BASE,
        modelLabel: 'Brand / variety',
        modelPlaceholder: 'e.g. Sona Masoori',
        quantityPlaceholder: 'e.g. 50 kg',
        extras: [
            { key: 'cropFor', label: 'Which crop', placeholder: 'e.g. paddy, cotton' },
            { key: 'seedType', label: 'Seed type', options: ['Hybrid', 'Open pollinated', 'Organic', 'No preference'] },
            { key: 'season', label: 'Season', options: ['Kharif', 'Rabi', 'Summer', 'Not sure'] },
        ],
    },
    Fertilizers: {
        ...INPUT_BASE,
        extras: [
            { key: 'fertilizerType', label: 'Type', options: ['Urea', 'DAP', 'NPK', 'Potash', 'Organic / compost', 'Micronutrient', 'Other'] },
            { key: 'cropFor', label: 'Which crop', placeholder: 'e.g. sugarcane' },
        ],
    },
    Pesticides: {
        ...INPUT_BASE,
        extras: [
            { key: 'targetProblem', label: 'Pest or disease', placeholder: 'e.g. stem borer, leaf blight' },
            { key: 'cropFor', label: 'Which crop', placeholder: 'e.g. paddy' },
            { key: 'chemistry', label: 'Preference', options: ['Chemical', 'Bio / organic', 'No preference'] },
        ],
    },

    'Farm produce': {
        showCondition: false,
        modelLabel: 'Crop / variety',
        modelPlaceholder: 'e.g. Sona Masoori paddy',
        quantityLabel: 'Quantity needed',
        quantityPlaceholder: 'e.g. 20 quintals',
        budgetPlaceholder: 'e.g. ₹2,400 per quintal',
        extras: [
            { key: 'grade', label: 'Grade / quality', placeholder: 'e.g. FAQ, export grade' },
            { key: 'grownAs', label: 'Grown as', options: ['Organic', 'Natural', 'Conventional', 'No preference'] },
            { key: 'delivery', label: 'Delivery', options: ['I will collect', 'Need it delivered', 'Either'] },
        ],
    },

    Other: {
        showCondition: true,
        modelLabel: 'What exactly',
        modelPlaceholder: 'Describe what you need',
        quantityLabel: 'Quantity',
        quantityPlaceholder: 'e.g. 1 unit',
        budgetPlaceholder: 'e.g. under ₹10,000',
        extras: [],
    },
};

/** Falls back to the generic set for anything not listed. */
export function questionsFor(category: string): CategoryQuestions {
    return CATEGORY_QUESTIONS[category] ?? CATEGORY_QUESTIONS.Other;
}
