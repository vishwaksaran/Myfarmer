export type AgriNewsCategory = 'Trade' | 'Government' | 'World Event' | 'Research';

export type AgriNewsItem = {
    id: string;
    title: string;
    source: string;
    sourceUrl?: string;
    image: string;
    url: string;
    date: string;
    category: AgriNewsCategory;
    publishedAt: number;
    imageFromFeed?: boolean;
};

export type AgriNewsResponseItem = Omit<AgriNewsItem, 'publishedAt'>;

const FEEDS = [
    {
        category: 'Trade' as const,
        url: 'https://news.google.com/rss/search?q=agriculture+market+prices+india+OR+mandi+prices+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
    },
    {
        category: 'Government' as const,
        url: 'https://news.google.com/rss/search?q=PM-KISAN+OR+MSP+OR+agriculture+scheme+india+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
    },
    {
        category: 'World Event' as const,
        url: 'https://news.google.com/rss/search?q=global+agriculture+summit+OR+FAO+OR+climate+resilient+crops+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
    },
    {
        category: 'Research' as const,
        url: 'https://news.google.com/rss/search?q=ICAR+OR+agriculture+research+OR+crop+science+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
    },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=240&fit=crop';

const decodeHtml = (text: string) =>
    text
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .trim();

const pickImageFromTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('wheat') || t.includes('rice') || t.includes('crop')) return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=240&fit=crop';
    if (t.includes('policy') || t.includes('scheme') || t.includes('government') || t.includes('msp')) return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=240&fit=crop';
    if (t.includes('climate') || t.includes('summit') || t.includes('global')) return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=240&fit=crop';
    if (t.includes('research') || t.includes('icar') || t.includes('science')) return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=240&fit=crop';
    return FALLBACK_IMAGE;
};

const getDomainIcon = (inputUrl: string) => {
    try {
        const host = new URL(inputUrl).hostname;
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
    } catch {
        return FALLBACK_IMAGE;
    }
};

const normalizeImageUrl = (raw: string) => {
    const decoded = decodeHtml(raw).trim();
    if (!decoded) return null;
    if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) return null;
    return decoded;
};

const extractImageFromItemBlock = (block: string): string | null => {
    const mediaContent = block.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
    const mediaThumbnail = block.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
    const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
    const description = block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '';
    const imageFromDescription = description.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1];

    return (
        normalizeImageUrl(mediaContent || '') ||
        normalizeImageUrl(mediaThumbnail || '') ||
        normalizeImageUrl(enclosure || '') ||
        normalizeImageUrl(imageFromDescription || '')
    );
};

const extractImageFromHtml = (html: string, baseUrl: string): string | null => {
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1];
    const tw = html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1];
    const img = normalizeImageUrl(og || '') || normalizeImageUrl(tw || '');
    if (!img) return null;

    try {
        return new URL(img, baseUrl).href;
    } catch {
        return img;
    }
};

const fetchImageFromMicrolink = async (url: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': 'MiraituNewsBot/1.0' },
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!res.ok) return null;
        const data = await res.json();
        const imageUrl = data?.data?.image?.url;
        return typeof imageUrl === 'string' ? normalizeImageUrl(imageUrl) : null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
};

const fetchArticleImageFromSource = async (url: string): Promise<string | null> => {
    const microlinkImage = await fetchImageFromMicrolink(url);
    if (microlinkImage) return microlinkImage;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'MiraituNewsBot/1.0',
                Accept: 'text/html,application/xhtml+xml',
            },
            redirect: 'follow',
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!res.ok) return null;

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('text/html')) return null;

        const html = await res.text();
        return extractImageFromHtml(html, res.url || url);
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
};

const parseRssItems = (xml: string, category: AgriNewsCategory): AgriNewsItem[] => {
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    return itemBlocks
        .map((block, idx) => {
            const title = decodeHtml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
            const link = decodeHtml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '');
            const pubDateRaw = decodeHtml(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '');
            const sourceTag = block.match(/<source([^>]*)>([\s\S]*?)<\/source>/i);
            const source = decodeHtml(sourceTag?.[2] || 'Google News');
            const sourceUrlRaw = sourceTag?.[1]?.match(/url=["']([^"']+)["']/i)?.[1] || '';
            const sourceUrl = normalizeImageUrl(sourceUrlRaw) || undefined;
            const feedImage = extractImageFromItemBlock(block);

            if (!title || !link) return null;

            const publishedAt = Number.isNaN(Date.parse(pubDateRaw)) ? Date.now() : Date.parse(pubDateRaw);
            const date = new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });

            return {
                id: `${category}-${idx}-${publishedAt}`,
                title,
                source,
                sourceUrl,
                image: feedImage || pickImageFromTitle(title),
                url: link,
                date,
                category,
                publishedAt,
                imageFromFeed: !!feedImage,
            } as AgriNewsItem;
        })
        .filter((item): item is AgriNewsItem => item !== null);
};

export async function fetchLatestAgriNews() {
    const feedResults = await Promise.all(
        FEEDS.map(async (feed) => {
            const res = await fetch(feed.url, {
                headers: { 'User-Agent': 'MiraituNewsBot/1.0' },
                cache: 'no-store',
            });

            if (!res.ok) return [] as AgriNewsItem[];

            const xml = await res.text();
            return parseRssItems(xml, feed.category);
        })
    );

    const allItems = feedResults.flat();
    let uniqueByUrl = Array.from(new Map(allItems.map((item) => [item.url, item])).values())
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .slice(0, 18);

    // Try to enrich missing feed images with article OG/Twitter images from source pages.
    const candidates = uniqueByUrl
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => !item.imageFromFeed)
        .slice(0, 10);

    if (candidates.length > 0) {
        const resolvedImages = await Promise.all(
            candidates.map(({ item }) => {
                const articleUrl = item.url.includes('news.google.com') && item.sourceUrl ? item.sourceUrl : item.url;
                return fetchArticleImageFromSource(articleUrl);
            })
        );

        uniqueByUrl = uniqueByUrl.map((item, idx) => {
            const candidateIndex = candidates.findIndex((c) => c.idx === idx);
            if (candidateIndex === -1) return item;

            const resolved = resolvedImages[candidateIndex];
            if (!resolved) {
                const articleUrl = item.url.includes('news.google.com') && item.sourceUrl ? item.sourceUrl : item.url;
                return {
                    ...item,
                    image: getDomainIcon(articleUrl),
                };
            }

            return {
                ...item,
                image: resolved,
            };
        });
    }

    const liveEventSource = uniqueByUrl.find((item) => item.category === 'World Event') || uniqueByUrl[0] || null;

    const items: AgriNewsResponseItem[] = uniqueByUrl.map(({ publishedAt, imageFromFeed, sourceUrl, ...rest }) => rest);
    const liveEvent: AgriNewsResponseItem | null = liveEventSource
        ? (({ publishedAt, ...rest }) => rest)(liveEventSource)
        : null;

    return { items, liveEvent, fetchedAt: new Date().toISOString() };
}
