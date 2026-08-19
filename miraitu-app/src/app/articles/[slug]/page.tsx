import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleBody from '@/components/articles/ArticleBody';
import { articles, getArticle } from '@/content/articles';

type Props = { params: Promise<{ slug: string }> };

const BASE_URL = 'https://www.miraitu.in';

export function generateStaticParams() {
    return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticle(slug);

    if (!article) return { title: 'Guide not found' };

    const url = `${BASE_URL}/articles/${article.slug}`;

    return {
        title: article.title,
        description: article.description,
        alternates: { canonical: url },
        openGraph: {
            title: article.title,
            description: article.description,
            url,
            type: 'article',
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt,
        },
    };
}

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = getArticle(slug);

    if (!article) notFound();

    const url = `${BASE_URL}/articles/${article.slug}`;

    // Article schema so search engines can attribute authorship and dates.
    // Organization is referenced by @id from the root layout's schema rather
    // than redeclared, keeping one canonical publisher node across the site.
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { '@id': `${BASE_URL}/#organization` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        articleSection: article.category,
        inLanguage: 'en-IN',
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/articles` },
            { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
    };

    return (
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
                <Link href="/articles" className="font-semibold text-[#2c5926] hover:underline">
                    Guides
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span>{article.category}</span>
            </nav>

            <header className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                    <span className="text-4xl" aria-hidden="true">{article.icon}</span>
                    <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#2c5926]">
                        {article.category}
                    </span>
                </div>

                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[#1a3617] sm:text-4xl">
                    {article.title}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-gray-600">{article.description}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 text-xs text-gray-500">
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingMinutes} min read</span>
                    {article.updatedAt !== article.publishedAt ? (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>Updated {formatDate(article.updatedAt)}</span>
                        </>
                    ) : null}
                </div>
            </header>

            <ArticleBody blocks={article.blocks} />

            {article.related && article.related.length > 0 ? (
                <section className="mt-12 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <h2 className="mb-4 text-lg font-bold text-[#1a3617]">On Miraitu</h2>
                    <ul className="space-y-2">
                        {article.related.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-[15px] font-semibold text-[#2c5926] hover:underline"
                                >
                                    {link.label} →
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <div className="mt-10 border-t border-gray-200 pt-6">
                <Link href="/articles" className="text-sm font-semibold text-[#2c5926] hover:underline">
                    ← All guides
                </Link>
            </div>
        </article>
    );
}
