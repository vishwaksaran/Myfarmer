'use client';

import { useEffect, useMemo, useState } from 'react';
import { NewsEvent } from './types';

interface NewsEventsProps {
  events: NewsEvent[];
}

const categoryColors: Record<string, string> = {
  'Trade': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Government': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'World Event': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Research': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function NewsEvents({ events }: NewsEventsProps) {
  const [liveEvents, setLiveEvents] = useState<NewsEvent[] | null>(null);
  const [liveWorldEvent, setLiveWorldEvent] = useState<NewsEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {
        setIsLoading(true);
        const endpoint = process.env.NODE_ENV === 'development' ? '/api/agri-news?refresh=1' : '/api/agri-news';
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!mounted) return;
        if (response.ok && Array.isArray(data.items) && data.items.length > 0) {
          setLiveEvents(data.items as NewsEvent[]);
          if (data.liveEvent) {
            setLiveWorldEvent(data.liveEvent as NewsEvent);
          }
        } else {
          setLiveEvents(null);
          setLiveWorldEvent(null);
        }
      } catch {
        if (mounted) {
          setLiveEvents(null);
          setLiveWorldEvent(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadNews();
    return () => {
      mounted = false;
    };
  }, []);

  const sourceEvents = useMemo(() => {
    if (liveEvents && liveEvents.length > 0) return liveEvents;
    return events;
  }, [events, liveEvents]);

  const fallbackLiveEvent = useMemo(() => {
    const fromSource = sourceEvents.find((event) => event.category === 'World Event');
    return fromSource || sourceEvents[0] || null;
  }, [sourceEvents]);

  const liveEventCard = liveWorldEvent || fallbackLiveEvent;

  const categories = ['All', ...new Set(sourceEvents.map(e => e.category))];
  const filtered = selectedCategory ? sourceEvents.filter(e => e.category === selectedCategory) : sourceEvents;
  const displayed = expanded ? filtered : filtered.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-4 pb-3">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#FF9F1C]">newspaper</span>
          Agri News & Events
        </h4>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${(cat === 'All' && !selectedCategory) || cat === selectedCategory
                ? 'bg-[#22c33d] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex gap-3 p-2 rounded-xl animate-pulse">
                <div className="w-20 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
                  <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800 mb-1.5" />
                  <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && displayed.map((event) => (
          <a
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
          >
            <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
              <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${categoryColors[event.category] || 'bg-gray-100 text-gray-600'}`}>
                  {event.category}
                </span>
                <span className="text-[10px] text-gray-400">{event.date}</span>
              </div>
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#22c33d] transition-colors">
                {event.title}
              </h5>
              <p className="text-[11px] text-gray-500 mt-0.5">{event.source}</p>
            </div>
          </a>
        ))}

        {!isLoading && filtered.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 text-center text-xs font-bold text-[#22c33d] hover:bg-[#22c33d]/5 rounded-xl transition-colors"
          >
            {expanded ? 'Show less' : `View all ${filtered.length} articles`}
          </button>
        )}
      </div>

      {/* Live World Events Banner */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-[#22c33d]/10 via-[#8CDA4F]/10 to-[#FF9F1C]/10 border border-[#22c33d]/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">Live Events</span>
        </div>
        {liveEventCard ? (
          <>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {liveEventCard.title}
            </p>
            <a
              href={liveEventCard.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[11px] font-bold text-[#22c33d] hover:underline flex items-center gap-1"
            >
              Watch live
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Live global agriculture events will appear here when available.
          </p>
        )}
      </div>
    </div>
  );
}
