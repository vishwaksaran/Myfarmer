'use client';

import { useState } from 'react';
import { Story } from './types';
import { resolveAvatarSrc } from './avatarUtils';

interface StoriesBarProps {
  stories: Story[];
  userAvatar?: string | null;
  hasOwnStory?: boolean;
  onAddStory: () => void;
  onViewStory: (story: Story) => void;
}

export default function StoriesBar({ stories, userAvatar, hasOwnStory = false, onAddStory, onViewStory }: StoriesBarProps) {
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const groupedStories = (() => {
    const order: string[] = [];
    const groups = new Map<string, Story[]>();

    stories.forEach((story) => {
      const key = story.isOwn ? 'own' : story.author;
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(story);
    });

    return order.map((key) => {
      const items = groups.get(key) || [];
      const isOwn = key === 'own';
      const imageStories = items.filter((s) => !!s.image);
      const firstStory = imageStories[0] || items[0];
      const firstUnseenStory = imageStories.find((s) => !s.seen && !viewedStories.has(s.id));
      const targetStory = firstUnseenStory || firstStory;
      const allSeen = imageStories.length > 0 && imageStories.every((s) => s.seen || viewedStories.has(s.id));

      return {
        key,
        isOwn,
        stories: items,
        imageStories,
        firstStory,
        targetStory,
        hasImage: imageStories.length > 0,
        allSeen,
      };
    });
  })();

  const ownGroup = groupedStories.find(group => group.isOwn);

  const handleView = (story: Story) => {
    setViewedStories(prev => new Set(prev).add(story.id));
    onViewStory(story);
  };

  return (
    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {groupedStories.map((group) => {
          const story = group.firstStory;
          const ringClass = !group.hasImage
            ? 'bg-gray-200 dark:bg-gray-700'
            : group.allSeen
              ? 'bg-gray-300 dark:bg-gray-600'
              : 'bg-gradient-to-br from-[#22c33d] via-[#8CDA4F] to-[#FF9F1C]';

          return (
            <button
              key={group.key}
              onClick={() => {
                if (group.isOwn) {
                  if (group.hasImage && hasOwnStory && group.targetStory) {
                    handleView(group.targetStory);
                    return;
                  }
                  onAddStory();
                  return;
                }
                if (group.targetStory) {
                  handleView(group.targetStory);
                }
              }}
              className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0 group"
            >
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[3px] ${ringClass}`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1a231a] p-[2px]">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveAvatarSrc(group.isOwn ? userAvatar || story?.avatar : story?.avatar, story?.author || group.key)}
                      alt={story?.author || group.key}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
                {group.isOwn && ownGroup?.key === group.key && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#22c33d] border-2 border-white dark:border-[#1a231a] flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddStory();
                    }}
                  >
                    <span className="material-symbols-outlined text-white text-sm font-bold">add</span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-medium w-14 sm:w-16 text-center truncate ${group.isOwn ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                {story?.author || (group.isOwn ? 'Your Story' : group.key)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
