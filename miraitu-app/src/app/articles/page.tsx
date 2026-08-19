import type { Metadata } from 'next';
import Link from 'next/link';
import { articlesByDate } from '@/content/articles';

export const metadata: Metadata = {
    title: 'Farming Guides — Practical Advice for Indian Farmers',
    description:
        'Original, practical guides on farm machinery economics, mandi prices, soil testing, dairy cattle, farm credit and irrigation — written for Indian farming conditions.',
    alternates: { canonical: 'https://www.miraitu.in/articles' },
    openGraph: {
        title: 'Farming Guides | Miraitu',
        description: 'Practical, original guides on machinery, crops, livestock, finance, soil and water.',
        url: 'https://www.miraitu.in/articles',
        type: 'website',
    },
};

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ArticlesIndexPage() {
    const posts = articlesByDate();

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a3617] sm:text-4xl">
                    Farming Guides
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                    Practical guides written for Indian farming conditions — with the arithmetic
                    shown, the figures sourced, and the trade-offs stated plainly.
                </p>
            </header>

            <div className="grid gap-5 sm:grid-cols-2">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/articles/${post.slug}`}
                        className="group flex flex-col rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition hover:shadow-[0_12px_40px_rgb(0,0,0,0.10)]"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <span className="text-3xl" aria-hidden="true">{post.icon}</span>
                            <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#2c5926]">
                                {post.category}
                            </span>
                        </div>

                        <h2 className="mb-2 text-lg font-bold leading-snug text-[#1a3617] group-hover:text-[#2c5926]">
                            {post.title}
                        </h2>

                        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                            {post.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                            <span aria-hidden="true">·</span>
                            <span>{post.readingMinutes} min read</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
