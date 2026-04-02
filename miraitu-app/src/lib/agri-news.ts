export type AgriNewsCategory = 'Trade' | 'Government' | 'World Event' | 'Research';

export type AgriNewsItem = {
  id: string;
  title: string;
  source: string;
  image: string;
  url: string;
  date: string;
  category: AgriNewsCategory;
  publishedAt: number;
};

export type AgriNewsResponseItem = Omit<AgriNewsItem, 'publishedAt'>;

const FEEDS = [
  {
    category: 'Trade' as const,
    url: 'https://news.google.com/rss/search?q=agriculture+market+prices+india+OR+mandi+prices&hl=en-IN&gl=IN&ceid=IN:en',
  },
  {
    category: 'Government' as const,
    url: 'https://news.google.com/rss/search?q=PM-KISAN+OR+MSP+OR+agriculture+scheme+india&hl=en-IN&gl=IN&ceid=IN:en',
  },
  {
    category: 'World Event' as const,
    url: 'https://news.google.com/rss/search?q=global+agriculture+summit+OR+FAO+OR+climate+resilient+crops&hl=en-IN&gl=IN&ceid=IN:en',
  },
  {
    category: 'Research' as const,
    url: 'https://news.google.com/rss/search?q=ICAR+OR+agriculture+research+OR+crop+science&hl=en-IN&gl=IN&ceid=IN:en',
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

const parseRssItems = (xml: string, category: AgriNewsCategory): AgriNewsItem[] => {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

  return itemBlocks
    .map((block, idx) => {
      const title = decodeHtml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
      const link = decodeHtml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '');
      const pubDateRaw = decodeHtml(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '');
      const source = decodeHtml(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Google News');

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
        image: pickImageFromTitle(title),
        url: link,
        date,
        category,
        publishedAt,
      } as AgriNewsItem;
    })
    .filter((item): item is AgriNewsItem => item !== null);
};

export async function fetchLatestAgriNews() {
  const feedResults = await Promise.all(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'MiraituNewsBot/1.0' },
        next: { revalidate: 1800 },
      });

      if (!res.ok) return [] as AgriNewsItem[];

      const xml = await res.text();
      return parseRssItems(xml, feed.category);
    })
  );

  const allItems = feedResults.flat();
  const uniqueByUrl = Array.from(new Map(allItems.map((item) => [item.url, item])).values())
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 18);

  const liveEventSource = uniqueByUrl.find((item) => item.category === 'World Event') || uniqueByUrl[0] || null;

  const items: AgriNewsResponseItem[] = uniqueByUrl.map(({ publishedAt, ...rest }) => rest);
  const liveEvent: AgriNewsResponseItem | null = liveEventSource
    ? (({ publishedAt, ...rest }) => rest)(liveEventSource)
    : null;

  return { items, liveEvent, fetchedAt: new Date().toISOString() };
}
