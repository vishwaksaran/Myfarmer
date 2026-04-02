'use client';

import { useEffect, useMemo, useState } from 'react';
import { Story } from './types';

interface StoryViewerModalProps {
    stories: Story[];
    currentIndex: number;
    onClose: () => void;
    onStorySeen?: (storyId: string) => void;
}

const STORY_DURATION_MS = 5000;

export default function StoryViewerModal({ stories, currentIndex, onClose, onStorySeen }: StoryViewerModalProps) {
    const [activeIndex, setActiveIndex] = useState<number>(Math.max(0, Math.min(currentIndex, Math.max(0, stories.length - 1))));
    const [tick, setTick] = useState(0);

    const safeStories = useMemo(() => stories.filter(story => !!story.image), [stories]);
    const isOpen = safeStories.length > 0;

    useEffect(() => {
        if (!isOpen) return;
        const clamped = Math.max(0, Math.min(currentIndex, safeStories.length - 1));
        setActiveIndex(clamped);
    }, [currentIndex, isOpen, safeStories.length]);

    useEffect(() => {
        if (!isOpen) return;

        setTick(0);

        const startAt = Date.now();
        const timer = window.setInterval(() => {
            const elapsed = Date.now() - startAt;
            const progress = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
            setTick(progress);

            if (elapsed >= STORY_DURATION_MS) {
                setTick(0);
                if (activeIndex >= safeStories.length - 1) {
                    onClose();
                    return;
                }
                setActiveIndex(prev => prev + 1);
            }
        }, 60);

        return () => window.clearInterval(timer);
    }, [activeIndex, isOpen, onClose, safeStories.length]);

    useEffect(() => {
        if (!isOpen) return;
        const currentStory = safeStories[activeIndex];
        if (!currentStory) return;
        onStorySeen?.(currentStory.id);
    }, [activeIndex, isOpen, onStorySeen, safeStories]);

    if (!isOpen) return null;

    const story = safeStories[activeIndex];
    const currentAuthorStoryIndices = safeStories
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.author === story.author)
        .map(({ idx }) => idx);
    const currentAuthorStoryPosition = currentAuthorStoryIndices.findIndex(idx => idx === activeIndex);

    const goPrevious = () => {
        setTick(0);
        setActiveIndex(prev => Math.max(0, prev - 1));
    };

    const goNext = () => {
        setTick(0);
        if (activeIndex >= safeStories.length - 1) {
            onClose();
            return;
        }
        setActiveIndex(prev => prev + 1);
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-3 sm:p-6"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm h-[75vh] sm:h-[85vh] rounded-3xl overflow-hidden bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={story.image} alt={story.author} className="w-full h-full object-cover" />

                <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex gap-1 mb-3">
                        {currentAuthorStoryIndices.map((storyIndex) => {
                            const item = safeStories[storyIndex];
                            const progress = storyIndex < activeIndex ? 100 : storyIndex === activeIndex ? tick : 0;
                            return (
                                <div key={item.id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                                    <div className="h-full bg-white transition-[width] duration-75" style={{ width: `${progress}%` }} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative z-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-lg">
                                {story.avatar?.startsWith('http') || story.avatar?.startsWith('data:') ? (
                                    <img src={story.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{story.avatar || '🧑‍🌾'}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{story.author}</p>
                                <p className="text-xs text-white/70">
                                    Story {currentAuthorStoryPosition + 1} / {currentAuthorStoryIndices.length}
                                </p>
                            </div>
                        </div>

                        <button onClick={onClose} className="text-white/90 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={goPrevious}
                    className="absolute left-0 top-16 bottom-0 w-1/2 z-10"
                    aria-label="Previous story"
                />
                <button
                    onClick={goNext}
                    className="absolute right-0 top-16 bottom-0 w-1/2 z-10"
                    aria-label="Next story"
                />
            </div>
        </div>
    );
}
