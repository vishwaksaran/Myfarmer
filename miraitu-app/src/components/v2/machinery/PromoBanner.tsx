'use client';

import Link from 'next/link';
import type { PromoBanner as PromoBannerType } from '@/lib/machinery-db';

interface PromoBannerProps {
    banner: PromoBannerType;
}

export default function PromoBanner({ banner }: PromoBannerProps) {
    return (
        <section className="py-4">
            <Link
                href={banner.cta_link || '#'}
                className="block rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                style={{ backgroundColor: banner.bg_color }}
            >
                <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
                    <div className="flex-1">
                        <h3
                            className="text-base sm:text-lg font-bold"
                            style={{ color: banner.text_color }}
                        >
                            {banner.title}
                        </h3>
                        {banner.subtitle && (
                            <p
                                className="text-sm mt-1 opacity-90"
                                style={{ color: banner.text_color }}
                            >
                                {banner.subtitle}
                            </p>
                        )}
                    </div>
                    {banner.cta_text && (
                        <span
                            className="ml-4 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                            style={{
                                backgroundColor: banner.text_color,
                                color: banner.bg_color,
                            }}
                        >
                            {banner.cta_text}
                        </span>
                    )}
                </div>
            </Link>
        </section>
    );
}
