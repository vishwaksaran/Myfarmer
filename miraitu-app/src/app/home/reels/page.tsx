'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import {
    addComment as addCommentAction,
    fetchReels,
    recordShare as recordShareAction,
    toggleReaction as toggleReactionAction,
} from '@/app/actions/community';
import type { Post } from '@/components/community/types';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from '@/components/community/avatarUtils';

const PAGE_SIZE = 10;

/**
 * Full-screen vertical video feed over the community's video posts.
 *
 * A reel *is* a community post — the same row the feed renders — so a like or
 * comment left here shows on the post and vice versa. Scrolling uses CSS
 * snap points, and an IntersectionObserver plays whichever reel is on screen
 * and pauses the rest, so only one video ever decodes at a time.
 */
export default function ReelsPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [reels, setReels] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [muted, setMuted] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [commentingOn, setCommentingOn] = useState<Post | null>(null);
    const [commentText, setCommentText] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const loadedCountRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    const load = useCallback(async () => {
        const res = await fetchReels({ limit: PAGE_SIZE });
        setReels(res.data);
        setHasMore(res.hasMore);
        loadedCountRef.current = res.data.length;
        setActiveId(res.data[0]?.id ?? null);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const res = await fetchReels({ limit: PAGE_SIZE, offset: loadedCountRef.current });
        setReels(prev => {
            const seen = new Set(prev.map(r => r.id));
            const merged = [...prev, ...res.data.filter(r => !seen.has(r.id))];
            loadedCountRef.current = merged.length;
            return merged;
        });
        setHasMore(res.hasMore);
        setLoadingMore(false);
    }, [hasMore, loadingMore]);

    // Play whichever reel is centred; pause everything else.
    useEffect(() => {
        if (reels.length === 0) return;
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    const id = (entry.target as HTMLElement).dataset.reelId;
                    if (!id) continue;
                    const video = videoRefs.current.get(id);
                    if (!video) continue;

                    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                        setActiveId(id);
                        video.play().catch(() => { /* autoplay may be refused until a tap */ });
                        // Reaching the last reel pulls the next page in.
                        if (id === reels[reels.length - 1]?.id) void loadMore();
                    } else if (!video.paused) {
                        video.pause();
                    }
                }
            },
            { threshold: [0, 0.6, 1] }
        );

        const nodes = containerRef.current?.querySelectorAll('[data-reel-id]');
        nodes?.forEach(node => observer.observe(node));
        return () => observer.disconnect();
    }, [reels, loadMore]);

    // Pause everything when the tab goes to the background.
    useEffect(() => {
        const onHidden = () => {
            if (!document.hidden) return;
            videoRefs.current.forEach(video => { if (!video.paused) video.pause(); });
        };
        document.addEventListener('visibilitychange', onHidden);
        return () => document.removeEventListener('visibilitychange', onHidden);
    }, []);

    const requireAuth = (action: () => void) => {
        if (!user) { setShowLogin(true); return; }
        action();
    };

    /** Like — optimistic, then reconciled with the server's answer. */
    const handleLike = (reel: Post) => requireAuth(() => {
        const wasLiked = !!reel.myReaction;
        setReels(prev => prev.map(r => r.id !== reel.id ? r : {
            ...r,
            myReaction: wasLiked ? null : 'like',
            totalReactions: Math.max(0, r.totalReactions + (wasLiked ? -1 : 1)),
        }));
        void toggleReactionAction(reel.id, reel.myReaction ?? 'like').then(res => {
            if (!res.success) void load(); // roll back to server truth
        });
    });

    const handleShare = (reel: Post) => {
        const url = typeof window !== 'undefined'
            ? `${window.location.origin}/home/community?post=${reel.id}`
            : '';
        const record = () => {
            void recordShareAction(reel.id, 'reels');
            setReels(prev => prev.map(r => r.id === reel.id ? { ...r, shares: r.shares + 1 } : r));
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: `Reel by ${reel.author}`, url })
                // Only count a share the user went through with.
                .then(record)
                .catch(() => { });
            return;
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(url).then(record).catch(() => { });
        }
    };

    const submitComment = async () => {
        const text = commentText.trim();
        if (!text || !commentingOn || sendingComment) return;
        setSendingComment(true);
        const res = await addCommentAction(commentingOn.id, text);
        setSendingComment(false);
        if (!res.success) return; // keep the draft so it can be retried
        setCommentText('');
        setCommentingOn(null);
        await load();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl animate-spin">progress_activity</span>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 text-center">
                <span className="material-symbols-outlined text-white/40 text-6xl mb-4">movie</span>
                <h1 className="text-xl font-bold text-white mb-2">No reels yet</h1>
                <p className="text-sm text-white/60 mb-6">
                    Reels are the videos farmers post to the community. Upload one and it shows up here.
                </p>
                <button
                    onClick={() => router.push('/home/community')}
                    className="px-6 py-3 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110"
                >
                    Go to Community
                </button>
                <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={() => router.push('/home/community')}
                    aria-label="Back to community"
                    className="text-white/90 hover:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-white font-bold">Reels</h1>
                <button
                    onClick={() => setMuted(m => !m)}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="text-white/90 hover:text-white"
                >
                    <span className="material-symbols-outlined">{muted ? 'volume_off' : 'volume_up'}</span>
                </button>
            </div>

            {/* Reel stack */}
            <div
                ref={containerRef}
                className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none' }}
            >
                {reels.map(reel => (
                    <section
                        key={reel.id}
                        data-reel-id={reel.id}
                        className="relative h-full w-full snap-start snap-always flex items-center justify-center"
                    >
                        <video
                            ref={el => {
                                if (el) videoRefs.current.set(reel.id, el);
                                else videoRefs.current.delete(reel.id);
                            }}
                            src={reel.video}
                            className="max-h-full max-w-full w-full object-contain"
                            playsInline
                            loop
                            muted={muted}
                            preload="metadata"
                            onClick={(e) => {
                                const video = e.currentTarget;
                                if (video.paused) video.play().catch(() => { });
                                else video.pause();
                            }}
                        />

                        {/* Author + caption */}
                        <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pr-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <button
                                onClick={() => router.push(`/home/community/user/${encodeURIComponent(reel.username)}`)}
                                className="flex items-center gap-2 mb-2"
                            >
                                <span className="w-9 h-9 rounded-full overflow-hidden border border-white/40 shrink-0">
                                    <img
                                        src={resolveAvatarSrc(reel.avatar, reel.author)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            img.onerror = null;
                                            img.src = DEFAULT_COMMUNITY_AVATAR;
                                        }}
                                    />
                                </span>
                                <span className="text-left">
                                    <span className="block text-sm font-bold text-white">{reel.author}</span>
                                    <span className="block text-[11px] text-white/70">@{reel.username}</span>
                                </span>
                            </button>
                            {reel.content && (
                                <p className="text-sm text-white/90 line-clamp-3 break-words">{reel.content}</p>
                            )}
                            {reel.tags.length > 0 && (
                                <p className="mt-1 text-xs text-[#8CDA4F] font-semibold">
                                    {reel.tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
                                </p>
                            )}
                        </div>

                        {/* Action rail */}
                        <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
                            <button onClick={() => handleLike(reel)} className="flex flex-col items-center gap-0.5">
                                <span
                                    className={`material-symbols-outlined text-3xl ${reel.myReaction ? 'text-[#22c33d]' : 'text-white'}`}
                                    style={reel.myReaction ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    favorite
                                </span>
                                <span className="text-[11px] font-bold text-white">{reel.totalReactions}</span>
                            </button>
                            <button
                                onClick={() => requireAuth(() => setCommentingOn(reel))}
                                className="flex flex-col items-center gap-0.5"
                            >
                                <span className="material-symbols-outlined text-3xl text-white">chat_bubble</span>
                                <span className="text-[11px] font-bold text-white">{reel.commentCount}</span>
                            </button>
                            <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-0.5">
                                <span className="material-symbols-outlined text-3xl text-white">share</span>
                                <span className="text-[11px] font-bold text-white">{reel.shares}</span>
                            </button>
                        </div>

                        {/* Paused indicator */}
                        {activeId === reel.id && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" />
                        )}
                    </section>
                ))}

                {loadingMore && (
                    <div className="h-20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl animate-spin">progress_activity</span>
                    </div>
                )}
            </div>

            {/* Comment sheet */}
            {commentingOn && (
                <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setCommentingOn(null)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div
                        className="relative max-h-[70%] rounded-t-3xl bg-white dark:bg-[#1a231a] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                Comments · {commentingOn.commentCount}
                            </h4>
                            <button onClick={() => setCommentingOn(null)} aria-label="Close" className="text-gray-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {commentingOn.comments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6">
                                    No comments yet — say something.
                                </p>
                            ) : (
                                commentingOn.comments.map(comment => (
                                    <div key={comment.id} className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-primary/10">
                                            <img
                                                src={resolveAvatarSrc(comment.avatar, comment.author)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    img.onerror = null;
                                                    img.src = DEFAULT_COMMUNITY_AVATAR;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-3.5 py-2.5">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author}</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">{comment.text}</p>
                                            </div>
                                            <span className="text-[11px] text-gray-400 px-2">{comment.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void submitComment(); }}
                                placeholder="Write a comment…"
                                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            />
                            <button
                                onClick={() => { void submitComment(); }}
                                disabled={!commentText.trim() || sendingComment}
                                className="p-2.5 rounded-xl bg-[#22c33d] text-white disabled:opacity-40"
                                aria-label="Send comment"
                            >
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
}
