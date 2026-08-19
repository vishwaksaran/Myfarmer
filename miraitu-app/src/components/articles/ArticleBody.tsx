import type { ArticleBlock } from '@/content/articles';

/**
 * Renders an article's typed block list.
 *
 * Blocks rather than an HTML string on purpose: article content never reaches
 * dangerouslySetInnerHTML, so there is no path from a content edit to an XSS
 * hole, and the styling stays consistent because each block type has exactly
 * one rendering.
 *
 * Server component — no interactivity here, so nothing ships to the browser.
 */

const headingId = (text: string): string =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ArticleBody({ blocks }: { readonly blocks: readonly ArticleBlock[] }) {
    return (
        <div className="space-y-5">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case 'heading':
                        return (
                            <h2
                                key={i}
                                id={headingId(block.text)}
                                className="scroll-mt-24 pt-4 text-xl font-bold text-[#1a3617] sm:text-2xl"
                            >
                                {block.text}
                            </h2>
                        );

                    case 'paragraph':
                        return (
                            <p key={i} className="text-[15px] leading-relaxed text-gray-700 sm:text-base">
                                {block.text}
                            </p>
                        );

                    case 'list': {
                        const cls = 'ml-5 space-y-2 text-[15px] leading-relaxed text-gray-700 sm:text-base';
                        return block.ordered ? (
                            <ol key={i} className={`list-decimal ${cls}`}>
                                {block.items.map((item, j) => <li key={j} className="pl-1">{item}</li>)}
                            </ol>
                        ) : (
                            <ul key={i} className={`list-disc ${cls}`}>
                                {block.items.map((item, j) => <li key={j} className="pl-1">{item}</li>)}
                            </ul>
                        );
                    }

                    case 'table':
                        return (
                            <figure key={i} className="my-6">
                                {block.caption ? (
                                    <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {block.caption}
                                    </figcaption>
                                ) : null}
                                {/* Wide tables scroll inside this box so the page body never
                                    scrolls sideways on a phone. */}
                                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                    <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                                        <thead className="bg-[#f1f5f0]">
                                            <tr>
                                                {block.table.headers.map((h, j) => (
                                                    <th key={j} className="px-4 py-3 font-bold text-[#2c5926]">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {block.table.rows.map((row, j) => (
                                                <tr key={j} className="border-t border-gray-200">
                                                    {row.map((cell, k) => (
                                                        <td
                                                            key={k}
                                                            className={`px-4 py-3 text-gray-700 ${k === 0 ? 'font-semibold text-gray-900' : ''}`}
                                                        >
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </figure>
                        );

                    case 'callout':
                        return (
                            <aside
                                key={i}
                                className="my-6 rounded-2xl border-l-4 border-[#2c5926] bg-[#f1f5f0] p-4 sm:p-5"
                            >
                                <p className="mb-1 text-sm font-bold text-[#2c5926]">{block.title}</p>
                                <p className="text-[15px] leading-relaxed text-gray-700">{block.text}</p>
                            </aside>
                        );
                }
            })}
        </div>
    );
}
