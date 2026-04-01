'use client';

import { useState } from 'react';
import { TrendingTopic } from './types';

interface HashtagSearchProps {
  trendingTopics: TrendingTopic[];
  onSearch: (query: string) => void;
  onTagClick: (tag: string) => void;
  activeTag: string | null;
  onClearFilter: () => void;
}

export default function HashtagSearch({ trendingTopics, onSearch, onTagClick, activeTag, onClearFilter }: HashtagSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    let q = query.trim();
    if (!q) return;
    if (!q.startsWith('#')) q = '#' + q;
    onSearch(q);
  };

  const filteredTopics = query.trim()
    ? trendingTopics.filter(t => t.tag.toLowerCase().includes(query.toLowerCase()))
    : trendingTopics;

  return (
    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-colors ${
          isFocused ? 'border-[#22c33d]/40 bg-[#22c33d]/5' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
        }`}>
          <span className="material-symbols-outlined text-lg text-gray-400">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search #hashtags"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none border-0"
          />
          {query && (
            <button onClick={() => { setQuery(''); onClearFilter(); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter */}
      {activeTag && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#22c33d]/10">
            <span className="material-symbols-outlined text-sm text-[#22c33d]">filter_alt</span>
            <span className="text-sm font-semibold text-[#22c33d]">{activeTag}</span>
            <button onClick={onClearFilter} className="ml-auto text-[#22c33d] hover:text-[#1a9e30] transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Trending Topics */}
      <div className="px-4 pb-4">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF9F1C] text-lg">local_fire_department</span>
          Trending in Farming
        </h4>
        <div className="space-y-1">
          {filteredTopics.slice(0, 6).map((topic, index) => (
            <button
              key={topic.tag}
              onClick={() => onTagClick(topic.tag)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${
                activeTag === topic.tag
                  ? 'bg-[#22c33d]/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-4">#{index + 1}</span>
                <div>
                  <p className={`font-semibold text-sm ${activeTag === topic.tag ? 'text-[#22c33d]' : 'text-gray-900 dark:text-white group-hover:text-[#22c33d]'} transition-colors`}>
                    {topic.tag}
                  </p>
                  <p className="text-[11px] text-gray-500">{topic.posts} posts</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#22c33d] bg-[#22c33d]/10 px-2 py-0.5 rounded-full">
                {topic.growth}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
