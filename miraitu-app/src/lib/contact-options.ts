// Topics on the web Contact Us form. Shared by the form, the API route that
// validates it, and the admin inbox that filters by it.

export const CONTACT_TOPICS = [
    { value: 'partnership', label: 'Partnership / Collaboration', icon: 'handshake' },
    { value: 'business', label: 'Business / Bulk Enquiry', icon: 'business_center' },
    { value: 'advertising', label: 'Advertising & Promotions', icon: 'campaign' },
    { value: 'media', label: 'Media & Press', icon: 'newspaper' },
    { value: 'investor', label: 'Investor Relations', icon: 'trending_up' },
    { value: 'support', label: 'Customer Support', icon: 'support_agent' },
    { value: 'other', label: 'Other', icon: 'chat' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

export const CONTACT_TOPIC_VALUES: readonly string[] = CONTACT_TOPICS.map(t => t.value);

export function contactTopicLabel(value: string): string {
    return CONTACT_TOPICS.find(t => t.value === value)?.label ?? 'Other';
}

export const CONTACT_STATUSES = ['new', 'in_progress', 'replied', 'closed'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_LIMITS = {
    name: 120,
    email: 200,
    company: 160,
    subject: 200,
    message: 5000,
    minMessage: 10,
} as const;
