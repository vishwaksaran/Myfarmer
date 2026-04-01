'use client';

import { useState } from 'react';
import { Story } from './types';

interface StoriesBarProps {
  stories: Story[];
  userAvatar?: string | null;
  onAddStory: () => void;
  onViewStory: (story: Story) => void;
}

export default function StoriesBar({ stories, userAvatar, onAddStory, onViewStory }: StoriesBarProps) {
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const handleView = (story: Story) => {
    setViewedStories(prev => new Set(prev).add(story.id));
    onViewStory(story);
  };

  return (
    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {stories.map((story) => {
          const isSeen = story.seen || viewedStories.has(story.id);
          return (
            <button
              key={story.id}
              onClick={() => story.isOwn ? onAddStory() : handleView(story)}
              className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0 group"
            >
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[3px] ${
                story.isOwn
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : isSeen
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-gradient-to-br from-[#22c33d] via-[#8CDA4F] to-[#FF9F1C]'
              }`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1a231a] p-[2px]">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {story.isOwn ? (
                      userAvatar ? (
                        <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-primary/50">person</span>
                      )
                    ) : (
                      <span className="text-2xl">{story.avatar}</span>
                    )}
                  </div>
                </div>
                {story.isOwn && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#22c33d] border-2 border-white dark:border-[#1a231a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm font-bold">add</span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-medium w-14 sm:w-16 text-center truncate ${
                story.isOwn ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {story.author}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
