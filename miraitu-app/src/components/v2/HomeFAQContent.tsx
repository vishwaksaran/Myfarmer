'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { HOME_FAQ_ORDER, homeFaqTranslations, type HomeFaqId } from '@/i18n/homeFaqTranslations';
import { PLAY_STORE_URL } from '@/lib/seo';

// The visible FAQ, in the visitor's chosen language. The server renders it in
// English (the language context starts as 'en'), which is the version search
// engines index; HomeFAQ publishes the matching English FAQPage schema.

const FAQ_LINKS: Partial<Record<HomeFaqId, string>> = {
    about: '/home/about',
    rent: '/home/machinery',
    sellCrops: '/home/crops/sell',
    livestock: '/home/livestock',
    app: PLAY_STORE_URL,
    tools: '/home/toolbox',
    contact: '/home/contact',
};

const linkClass = 'mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline';

export default function HomeFAQContent() {
    const { lang } = useLanguage();
    const copy = homeFaqTranslations[lang] ?? homeFaqTranslations.en;

    return (
        // lang tells screen readers and translators which language the copy is in.
        <div className="mx-auto max-w-[1000px]" lang={lang}>
            <h2
                id="home-faq-title"
                className="mb-2 text-2xl md:text-3xl font-black tracking-tight text-[#121811] dark:text-white"
            >
                {copy.title}
            </h2>
            <p className="faq-intro mb-6 text-sm md:text-base text-gray-600 dark:text-gray-300">
                {copy.intro}
            </p>
            <div className="flex flex-col gap-3">
                {HOME_FAQ_ORDER.map((id) => {
                    const item = copy.items[id];
                    const href = FAQ_LINKS[id];
                    return (
                        <details
                            key={id}
                            className="group rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1a2419] shadow-sm open:shadow-md transition-shadow"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                                    {item.question}
                                </h3>
                                <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined shrink-0 text-primary transition-transform group-open:rotate-180"
                                >
                                    expand_more
                                </span>
                            </summary>
                            <div className="px-5 pb-5 -mt-1">
                                <p className="faq-answer text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300">
                                    {item.answer}
                                </p>
                                {href && item.linkLabel && (
                                    href.startsWith('http') ? (
                                        <a href={href} target="_blank" rel="noopener noreferrer" data-no-auth className={linkClass}>
                                            {item.linkLabel}
                                        </a>
                                    ) : (
                                        <Link href={href} className={linkClass}>
                                            {item.linkLabel}
                                        </Link>
                                    )
                                )}
                            </div>
                        </details>
                    );
                })}
            </div>
        </div>
    );
}
