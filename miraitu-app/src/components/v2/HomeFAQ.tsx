import HomeFAQContent from './HomeFAQContent';
import { HOME_FAQ_ORDER, homeFaqTranslations } from '@/i18n/homeFaqTranslations';
import { SITE_URL, jsonLdString } from '@/lib/seo';

// Home-page FAQ section.
//
// The questions and answers live in i18n/homeFaqTranslations (all ten UI
// languages). HomeFAQContent shows them in the visitor's language; this server
// wrapper publishes the English set as FAQPage JSON-LD. English is what the
// server renders — and so what search engines index — so the structured data
// and the indexed text match.
//
// Every answer describes something the site actually does. Keep it that way
// when editing: no claims the product can't back, in any language.

const en = homeFaqTranslations.en;

const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    inLanguage: 'en-IN',
    mainEntity: HOME_FAQ_ORDER.map((id) => ({
        '@type': 'Question',
        name: en.items[id].question,
        acceptedAnswer: { '@type': 'Answer', text: en.items[id].answer },
    })),
};

export default function HomeFAQ() {
    return (
        <section id="home-faq" aria-labelledby="home-faq-title" className="px-4 md:px-6 py-10 md:py-14">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }} />
            <HomeFAQContent />
        </section>
    );
}
