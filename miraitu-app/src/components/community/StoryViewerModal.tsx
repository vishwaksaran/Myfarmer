'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Story } from './types';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from './avatarUtils';
import { fetchStoryViewers, type StoryViewer } from '@/app/actions/community';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';

interface StoryViewerModalProps {
    stories: Story[];
    currentIndex: number;
    onClose: () => void;
    onStorySeen?: (storyId: string) => void;
    /** Replaces the image on one of your own stories. */
    onReplaceStory?: (storyId: string, image: string) => Promise<{ success: boolean; error?: string }>;
    /** Deletes one of your own stories. */
    onDeleteStory?: (storyId: string) => Promise<{ success: boolean; error?: string }>;
}

const STORY_DURATION_MS = 5000;

export default function StoryViewerModal({
    stories,
    currentIndex,
    onClose,
    onStorySeen,
    onReplaceStory,
    onDeleteStory,
}: StoryViewerModalProps) {
    const [activeIndex, setActiveIndex] = useState<number>(Math.max(0, Math.min(currentIndex, Math.max(0, stories.length - 1))));
    const [tick, setTick] = useState(0);
    /** Any open panel or in-flight action holds the auto-advance timer. */
    const [showViewers, setShowViewers] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [viewers, setViewers] = useState<StoryViewer[]>([]);
    const [viewersLoading, setViewersLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const safeStories = useMemo(() => stories.filter(story => !!story.image), [stories]);
    const isOpen = safeStories.length > 0;
    const story = safeStories[activeIndex];
    const isOwnStory = !!story?.isOwn;

    // Anything that needs the reader's attention stops the clock, so a story
    // does not slide out from under an open viewer list or a delete prompt.
    const paused = showViewers || showMenu || confirmDelete || busy;

    useEffect(() => {
        if (!isOpen) return;
        const clamped = Math.max(0, Math.min(currentIndex, safeStories.length - 1));
        setActiveIndex(clamped);
    }, [currentIndex, isOpen, safeStories.length]);

    useEffect(() => {
        if (!isOpen || paused) return;

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
    }, [activeIndex, isOpen, onClose, paused, safeStories.length]);

    useEffect(() => {
        if (!isOpen) return;
        const currentStory = safeStories[activeIndex];
        if (!currentStory) return;
        onStorySeen?.(currentStory.id);
    }, [activeIndex, isOpen, onStorySeen, safeStories]);

    // The spinner is switched on by whoever opens the sheet, not here: setting
    // it inside the effect would be a synchronous setState in an effect body.
    const loadViewers = useCallback(async (storyId: string) => {
        const res = await fetchStoryViewers(storyId);
        setViewers(res.data);
        if (res.error) setError(res.error);
        setViewersLoading(false);
    }, []);

    // Keep the open viewer list current as people watch — the count is live.
    // loadViewers only sets state after awaiting the fetch, so this is not a
    // synchronous cascade; the lint rule cannot see through the async call.
    useEffect(() => {
        if (!showViewers || !story) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadViewers(story.id);
    }, [showViewers, story, story?.viewCount, loadViewers]);

    if (!isOpen || !story) return null;

    const currentAuthorStoryIndices = safeStories
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => (item.username || item.author) === (story.username || story.author))
        .map(({ idx }) => idx);
    const currentAuthorStoryPosition = currentAuthorStoryIndices.findIndex(idx => idx === activeIndex);

    /** Panels belong to the story that opened them, so navigating closes them. */
    const resetPanels = () => {
        setShowViewers(false);
        setShowMenu(false);
        setConfirmDelete(false);
        setError(null);
    };

    const goPrevious = () => {
        setTick(0);
        resetPanels();
        setActiveIndex(prev => Math.max(0, prev - 1));
    };

    const goNext = () => {
        setTick(0);
        resetPanels();
        if (activeIndex >= safeStories.length - 1) {
            onClose();
            return;
        }
        setActiveIndex(prev => prev + 1);
    };

    const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !onReplaceStory) return;
        setError(null);
        setShowMenu(false);

        void (async () => {
            setBusy(true);
            const { media, error: uploadError } = await uploadCommunityMedia(file, 'image');
            if (!media) {
                setError(uploadError || 'Upload failed. Please try again.');
                setBusy(false);
                return;
            }
            const res = await onReplaceStory(story.id, media.url);
            if (!res.success) {
                // The swap never happened, so the new file has no story pointing
                // at it — remove it rather than leave it stranded.
                void discardCommunityMedia([media.path]);
                setError(res.error || 'Could not update the story');
            }
            setBusy(false);
        })();
    };

    const handleDelete = () => {
        if (!onDeleteStory) return;
        setError(null);
        void (async () => {
            setBusy(true);
            const res = await onDeleteStory(story.id);
            setBusy(false);
            if (!res.success) {
                setError(res.error || 'Could not delete the story');
                setConfirmDelete(false);
                return;
            }
            setConfirmDelete(false);
            // The story is gone; the parent reloads the ring behind us.
            if (safeStories.length <= 1) onClose();
        })();
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
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                    src={resolveAvatarSrc(story.avatar, story.author)}
                                    alt=""
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.onerror = null;
                                        img.src = DEFAULT_COMMUNITY_AVATAR;
                                    }}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{story.author}</p>
                                <p className="text-xs text-white/70">
                                    Story {currentAuthorStoryPosition + 1} / {currentAuthorStoryIndices.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {isOwnStory && (onReplaceStory || onDeleteStory) && (
                                <button
                                    onClick={() => setShowMenu(v => !v)}
                                    className="text-white/90 hover:text-white p-1"
                                    aria-label="Story options"
                                    aria-expanded={showMenu}
                                >
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            )}
                            <button onClick={onClose} className="text-white/90 hover:text-white p-1" aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Owner menu */}
                    {showMenu && (
                        <div className="absolute right-3 top-[4.5rem] z-30 w-44 rounded-xl bg-white dark:bg-[#222c22] shadow-2xl overflow-hidden">
                            {onReplaceStory && (
                                <button
                                    onClick={() => replaceInputRef.current?.click()}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <span className="material-symbols-outlined text-lg">swap_horiz</span>
                                    Replace photo
                                </button>
                            )}
                            {onDeleteStory && (
                                <button
                                    onClick={() => { setShowMenu(false); setConfirmDelete(true); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Delete story
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={goPrevious}
                    className="absolute left-0 top-16 bottom-16 w-1/2 z-10"
                    aria-label="Previous story"
                />
                <button
                    onClick={goNext}
                    className="absolute right-0 top-16 bottom-16 w-1/2 z-10"
                    aria-label="Next story"
                />

                {/* Seen-by footer — your own stories only, as on Instagram */}
                {isOwnStory && (
                    <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <button
                            onClick={() => { setViewersLoading(true); setShowViewers(true); }}
                            className="flex items-center gap-1.5 text-white text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                            {story.viewCount === 0
                                ? 'No views yet'
                                : `Seen by ${story.viewCount ?? 0}`}
                        </button>
                    </div>
                )}

                {/* Busy / error overlays */}
                {busy && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
                        <span className="material-symbols-outlined text-white text-4xl animate-spin">progress_activity</span>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-x-3 bottom-16 z-40 flex items-center gap-2 rounded-xl bg-red-500/95 px-3 py-2.5 text-white">
                        <span className="material-symbols-outlined text-lg">error</span>
                        <span className="text-xs font-medium flex-1">{error}</span>
                        <button onClick={() => setError(null)} aria-label="Dismiss">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                {/* Viewers sheet */}
                {showViewers && (
                    <div className="absolute inset-0 z-40 flex flex-col justify-end" onClick={() => setShowViewers(false)}>
                        <div className="absolute inset-0 bg-black/50" />
                        <div
                            className="relative max-h-[70%] rounded-t-3xl bg-white dark:bg-[#1a231a] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Viewers {viewers.length > 0 && `· ${viewers.length}`}
                                </h4>
                                <button onClick={() => setShowViewers(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="overflow-y-auto p-3">
                                {viewersLoading ? (
                                    <p className="text-sm text-gray-500 text-center py-6">Loading…</p>
                                ) : viewers.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">
                                        Nobody has watched this story yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {viewers.map(viewer => (
                                            <div key={viewer.id} className="flex items-center gap-3 px-2 py-2">
                                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary/10">
                                                    <img
                                                        src={resolveAvatarSrc(viewer.avatar, viewer.name)}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const img = e.currentTarget;
                                                            img.onerror = null;
                                                            img.src = DEFAULT_COMMUNITY_AVATAR;
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewer.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">@{viewer.username}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">{viewer.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete confirmation */}
                {confirmDelete && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(false)}>
                        <div className="absolute inset-0 bg-black/60" />
                        <div
                            className="relative w-full max-w-xs rounded-2xl bg-white dark:bg-[#1a231a] p-5 text-center shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-xl text-red-500">delete_forever</span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Delete story?</h4>
                            <p className="text-xs text-gray-500 mb-4">
                                It disappears for everyone straight away, along with who has seen it.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReplace}
                />
            </div>
        </div>
    );
}
