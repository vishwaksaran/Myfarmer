'use client';

import { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import LoginModal from '@/components/auth/LoginModal';

import { Post, ReactionType, Story, COMMUNITY_FALLBACK_NAME } from '@/components/community/types';
import { sampleNewsEvents, trendingTopics } from '@/components/community/sampleData';
import {
    fetchFeed,
    createPost as createPostAction,
    updatePost as updatePostAction,
    deletePost as deletePostAction,
    toggleReaction as toggleReactionAction,
    addComment as addCommentAction,
    fetchCommunityUsers,
    toggleCommentLike as toggleCommentLikeAction,
    recordShare as recordShareAction,
    toggleFollow as toggleFollowAction,
    fetchFollowing,
    votePoll as votePollAction,
    createStories as createStoriesAction,
    fetchStories,
    markStorySeen as markStorySeenAction,
    updateStory as updateStoryAction,
    deleteStory as deleteStoryAction,
    type CommunityUser,
} from '@/app/actions/community';
import supabase from '@/lib/supabase';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';
import StoriesBar from '@/components/community/StoriesBar';
import CreatePostModal, { type CreatePostIntent, type CreatePostPayload } from '@/components/community/CreatePostModal';
import CreateStoryModal from '@/components/community/CreateStoryModal';
import StoryViewerModal from '../../../components/community/StoryViewerModal';
import EditPostModal from '@/components/community/EditPostModal';
import PostCard from '@/components/community/PostCard';
import HashtagSearch from '@/components/community/HashtagSearch';
import NewsEvents from '@/components/community/NewsEvents';
import SuggestedUsers from '@/components/community/SuggestedUsers';
import PeopleSearch from '@/components/community/PeopleSearch';
import { normalizeUsername, saveFollowedUsernames } from '@/components/community/followStore';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from '@/components/community/avatarUtils';

const BASE_FOLLOWING_COUNT = 128;
const POSTS_PER_PAGE = 20;

const getTrendingScore = (post: Post) => {
    return post.totalReactions + (post.commentCount * 2) + (post.shares * 3);
};

// useSearchParams (for the shared ?post= link) must sit inside a Suspense
// boundary, otherwise the production build fails to prerender this route.
export default function CommunityPage() {
    return (
        <Suspense fallback={null}>
            <CommunityFeedPage />
        </Suspense>
    );
}

function CommunityFeedPage() {
    const { t, lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const { user } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [hasMorePosts, setHasMorePosts] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    /** How many posts are currently loaded — the offset for the next page. */
    const loadedCountRef = useRef(0);
    const [stories, setStories] = useState<Story[]>([]);
    const [users, setUsers] = useState<(CommunityUser & { following: boolean; followers: string })[]>([]);
    const [peopleQuery, setPeopleQuery] = useState('');
    const [peopleLoading, setPeopleLoading] = useState(false);
    /** Bumped by realtime follow events to re-pull follower tallies. */
    const [peopleRefreshKey, setPeopleRefreshKey] = useState(0);
    const [followedUsernames, setFollowedUsernames] = useState<Set<string>>(
        () => new Set<string>()
    );
    const [showCreateStory, setShowCreateStory] = useState(false);
    /** Which composer the FAB menu asked for — decides what CreatePostModal opens with. */
    const [createIntent, setCreateIntent] = useState<CreatePostIntent>('post');
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
    const [socialListView, setSocialListView] = useState<'followers' | 'following' | null>(null);
    const [activeNav, setActiveNav] = useState('Feed');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'trending'>('forYou');
    const [inlineText, setInlineText] = useState('');
    const [inlineImages, setInlineImages] = useState<string[]>([]);
    const [inlineVideo, setInlineVideo] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [inlineUploading, setInlineUploading] = useState(false);
    const [inlinePosting, setInlinePosting] = useState(false);
    // Shared-link handling: /home/community?post=<id>
    const searchParams = useSearchParams();
    const sharedPostId = searchParams.get('post');
    const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
    const [sharedPostMissing, setSharedPostMissing] = useState(false);
    const resolvedShareRef = useRef<string | null>(null);
    const inlinePhotoRef = useRef<HTMLInputElement>(null);
    const inlineVideoRef = useRef<HTMLInputElement>(null);
    /**
     * Public URL → storage path for media the inline composer uploaded but has
     * not published yet. A draft that is cleared or fails takes its blobs with
     * it instead of leaving them stranded in the bucket.
     */
    const inlineMediaPathsRef = useRef<Map<string, string>>(new Map());

    /** The name the rest of the feed already uses for this account. */
    const myDisplayName = user?.displayName?.trim() || COMMUNITY_FALLBACK_NAME;

    /**
     * Typing shows the spinner immediately, before the debounce even fires —
     * the effect only ever turns it off, so it never sets state synchronously.
     */
    const handlePeopleQueryChange = useCallback((value: string) => {
        setPeopleQuery(value);
        if (value.trim()) setPeopleLoading(true);
    }, []);

    const forgetInlineMedia = useCallback((urls: string[]) => {
        const paths: string[] = [];
        for (const url of urls) {
            const path = inlineMediaPathsRef.current.get(url);
            if (path) {
                paths.push(path);
                inlineMediaPathsRef.current.delete(url);
            }
        }
        void discardCommunityMedia(paths);
    }, []);

    // User is guaranteed logged in at this point (auth gate above)
    const requireAuth = useCallback((action: () => void) => {
        action();
    }, []);

    // ── Shared feed ──────────────────────────────────────────────────
    // Reloads from the top. `loadedCountRef` keeps however many pages the user
    // has already pulled, so a realtime refresh does not collapse the feed back
    // to page one under them.
    const loadFeed = useCallback(async () => {
        const res = await fetchFeed({ limit: Math.max(POSTS_PER_PAGE, loadedCountRef.current) });
        setPosts(res.data);
        setHasMorePosts(res.hasMore);
        loadedCountRef.current = res.data.length;
        setFeedLoading(false);
    }, []);

    // Append the next page.
    const loadMorePosts = useCallback(async () => {
        setLoadingMore(true);
        const res = await fetchFeed({ limit: POSTS_PER_PAGE, offset: loadedCountRef.current });
        setPosts(prev => {
            // Dedupe: a new post arriving mid-scroll shifts the window, so the
            // same row can come back in two pages.
            const seen = new Set(prev.map(p => p.id));
            const merged = [...prev, ...res.data.filter(p => !seen.has(p.id))];
            loadedCountRef.current = merged.length;
            return merged;
        });
        setHasMorePosts(res.hasMore);
        setLoadingMore(false);
    }, []);

    useEffect(() => {
        // loadFeed only sets state after awaiting the fetch, so this is not a
        // synchronous cascade — the lint rule cannot see through the async call.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadFeed();
    }, [loadFeed]);

    // ── Stories ──────────────────────────────────────────────────────
    // Server-backed and shared: what you post is what every other farmer sees,
    // and it ages out after 24 hours. `placeholder` is the "Your Story" tile
    // that opens the composer when you have nothing live.
    const loadStories = useCallback(async () => {
        const res = await fetchStories();
        const placeholder: Story = {
            id: 'own',
            author: 'Your Story',
            avatar: user?.photoURL || '',
            image: '',
            seen: false,
            isOwn: true,
        };
        setStories([placeholder, ...res.data]);
    }, [user?.photoURL]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadStories();

        // Stories appear, vanish and change as they are posted, deleted or
        // replaced; view rows land as people watch, which keeps the author's
        // "seen by" tally live without a refresh.
        const channel = supabase
            .channel('community-stories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_stories' }, () => {
                void loadStories();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_story_views' }, () => {
                void loadStories();
            })
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    }, [loadStories]);

    // Realtime: any insert/update/delete on posts, reactions or comments
    // re-pulls the feed, so likes and comments from other users land live.
    useEffect(() => {
        let pending: ReturnType<typeof setTimeout> | null = null;
        // Bursts of events (e.g. a post plus its first reaction) collapse into
        // a single refetch.
        const refresh = () => {
            if (pending) clearTimeout(pending);
            pending = setTimeout(() => { void loadFeed(); }, 400);
        };

        const channel = supabase
            .channel('community-feed')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, refresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reactions' }, refresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, refresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comment_likes' }, refresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_shares' }, refresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_poll_votes' }, refresh)
            .subscribe();

        return () => {
            if (pending) clearTimeout(pending);
            void supabase.removeChannel(channel);
        };
    }, [loadFeed]);

    // ── Shared-link deep dive (/home/community?post=<id>) ────────────
    // Scrolls to the shared post and highlights it. If it is not in the loaded
    // feed (older than the 50 we pull), it is fetched and pinned to the top so
    // the link always lands somewhere useful.
    useEffect(() => {
        if (!sharedPostId || feedLoading || resolvedShareRef.current === sharedPostId) return;

        const focusPost = () => {
            const el = document.getElementById(`post-${sharedPostId}`);
            if (!el) return false;
            resolvedShareRef.current = sharedPostId;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedPostId(sharedPostId);
            // Fade the highlight out; the post stays put.
            setTimeout(() => setHighlightedPostId(null), 3200);
            return true;
        };

        // The node exists once React has painted the current feed.
        if (requestAnimationFrame(focusPost)) { /* scheduled */ }

        if (!posts.some(p => p.id === sharedPostId)) {
            resolvedShareRef.current = sharedPostId;
            void fetchFeed({ postId: sharedPostId }).then(res => {
                if (res.data.length === 0) {
                    setSharedPostMissing(true);
                    return;
                }
                setPosts(prev => {
                    const merged = [...res.data, ...prev.filter(p => p.id !== sharedPostId)];
                    // Keep the paging cursor honest after pinning an extra post.
                    loadedCountRef.current = merged.length;
                    return merged;
                });
                requestAnimationFrame(() => { requestAnimationFrame(focusPost); });
            });
        }
    }, [sharedPostId, feedLoading, posts]);

    // ── People who have created a profile ────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            const res = await fetchCommunityUsers(peopleQuery);
            if (cancelled) return;
            setUsers(res.data.map(u => ({
                ...u,
                following: !!u.isFollowing,
                followers: `${u.followerCount ?? 0} follower${(u.followerCount ?? 0) === 1 ? '' : 's'} · ${u.postCount} post${u.postCount === 1 ? '' : 's'}`,
            })));
            setPeopleLoading(false);
        }, peopleQuery ? 350 : 0); // debounce typing, load immediately on mount
        return () => { cancelled = true; clearTimeout(timer); };
    }, [peopleQuery, peopleRefreshKey]);

    // React to a post (toggle or switch reaction).
    // Updates locally for instant feedback, then persists; realtime brings
    // everyone else's tallies in.
    const handleReact = (postId: string, reaction: ReactionType) => {
        void toggleReactionAction(postId, reaction).then(res => {
            if (!res.success) void loadFeed(); // roll back to server truth
        });
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const prev_reaction = p.myReaction;
            const newReactions = { ...p.reactions };
            let totalDelta = 0;

            if (prev_reaction === reaction) {
                // Remove reaction
                newReactions[reaction] = Math.max(0, newReactions[reaction] - 1);
                totalDelta = -1;
                return { ...p, reactions: newReactions, myReaction: null, totalReactions: p.totalReactions + totalDelta };
            } else {
                // Switch or add reaction
                if (prev_reaction) {
                    newReactions[prev_reaction] = Math.max(0, newReactions[prev_reaction] - 1);
                } else {
                    totalDelta = 1;
                }
                newReactions[reaction] = newReactions[reaction] + 1;
                return { ...p, reactions: newReactions, myReaction: reaction, totalReactions: p.totalReactions + totalDelta };
            }
        }));
    };

    // Add comment — persisted, then broadcast to every open feed.
    const handleComment = (postId: string, text: string, parentId?: string) => {
        void addCommentAction(postId, text, parentId).then(res => {
            if (res.success) void loadFeed();
        });
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const newComment = {
                id: 'c' + Date.now(),
                author: myDisplayName,
                avatar: user?.photoURL || '',
                text,
                time: 'Just now',
                likes: 0,
                liked: false,
                replies: [],
            };

            if (parentId) {
                // Nested reply
                const addReply = (comments: typeof p.comments): typeof p.comments =>
                    comments.map(c =>
                        c.id === parentId
                            ? { ...c, replies: [...(c.replies || []), newComment] }
                            : { ...c, replies: c.replies ? addReply(c.replies) : [] }
                    );
                return { ...p, comments: addReply(p.comments), commentCount: p.commentCount + 1 };
            }
            return { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 };
        }));
    };

    // Like a comment
    // Like a comment — persisted, so it shows on every device the user signs in on.
    const handleLikeComment = (postId: string, commentId: string) => {
        void toggleCommentLikeAction(commentId).then(res => {
            if (!res.success) void loadFeed(); // roll back to server truth
        });
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const toggleLike = (comments: typeof p.comments): typeof p.comments =>
                comments.map(c =>
                    c.id === commentId
                        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                        : { ...c, replies: c.replies ? toggleLike(c.replies) : [] }
                );
            return { ...p, comments: toggleLike(p.comments) };
        }));
    };

    // Share post — every share is recorded, so the count is real and shared.
    const handleShare = (postId: string) => {
        const post = posts.find(p => p.id === postId);
        const shareUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/home/community?post=${postId}`
            : '';

        const record = (channel: string) => {
            void recordShareAction(postId, channel).then(res => {
                if (!res.success) void loadFeed();
            });
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: `Post by ${post?.author}`,
                text: post?.content?.slice(0, 100),
                url: shareUrl,
            })
                // Only count a share the user actually went through with —
                // cancelling the sheet rejects and must not inflate the tally.
                .then(() => record('native'))
                .catch(() => { });
            return;
        }

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(shareUrl).then(() => record('copy')).catch(() => { });
            return;
        }

        record('native');
    };

    // Save/bookmark post
    const handleSave = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    };

    /**
     * Publishes a post. Text, media, tags, location and poll options go in one
     * insert, so the post either exists complete or not at all — the feed only
     * reloads once the server has confirmed the write.
     */
    const handleCreatePost = async (data: CreatePostPayload): Promise<{ success: boolean; error?: string }> => {
        const res = await createPostAction({
            content: data.content,
            images: data.images,
            video: data.video,
            tags: data.tags,
            location: data.location,
            pollOptions: data.pollOptions,
        });
        if (res.success) {
            await loadFeed();
            return { success: true };
        }
        const error = res.error || 'Could not publish your post';
        setUploadError(error);
        return { success: false, error };
    };

    // Vote on a poll — optimistic, then reconciled with the server's answer.
    const handleVotePoll = (postId: string, optionIndex: number) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId || !p.poll) return p;
            const previous = p.poll.myVote;
            const nextVote = previous === optionIndex ? null : optionIndex;
            const options = p.poll.options.map(o => {
                let votes = o.votes;
                if (previous === o.index) votes -= 1;
                if (nextVote === o.index) votes += 1;
                return { ...o, votes: Math.max(0, votes) };
            });
            return {
                ...p,
                poll: {
                    options,
                    totalVotes: options.reduce((sum, o) => sum + o.votes, 0),
                    myVote: nextVote,
                },
            };
        }));

        void votePollAction(postId, optionIndex).then(res => {
            if (!res.success) void loadFeed(); // roll back to server truth
        });
    };

    /**
     * Posts one or more stories. A multi-photo story is a single batch insert,
     * so it cannot land half-published.
     */
    const handleCreateStory = async (images: string[]): Promise<{ success: boolean; error?: string }> => {
        const res = await createStoriesAction(images);
        if (!res.success) {
            return { success: false, error: res.error || 'Could not post your story' };
        }

        await loadStories();
        setShowCreateStory(false);
        // Open on the first of the newly posted stories (index 0 is the
        // "Your Story" placeholder tile).
        setViewingStoryIndex(1);
        return { success: true };
    };

    /** Swaps the photo on one of your own stories, keeping its place in the ring. */
    const handleReplaceStory = async (storyId: string, image: string) => {
        const res = await updateStoryAction(storyId, image);
        if (res.success) await loadStories();
        return res;
    };

    /** Deletes one of your own stories; it disappears for everyone at once. */
    const handleDeleteStory = async (storyId: string) => {
        const res = await deleteStoryAction(storyId);
        if (!res.success) return res;

        await loadStories();
        // Keep the viewer pointed at something that still exists.
        setViewingStoryIndex(prev => {
            if (prev === null) return prev;
            const remaining = stories.filter(s => s.id !== storyId && !!s.image).length;
            return remaining === 0 ? null : Math.min(prev, remaining);
        });
        return res;
    };

    // Open story viewer
    const handleViewStory = (story: Story) => {
        const idx = stories.findIndex(s => s.id === story.id);
        if (idx === -1 || !stories[idx].image) return;

        setViewingStoryIndex(idx);
        setStories(prev => prev.map((s, i) => (i === idx ? { ...s, seen: true } : s)));
        void markStorySeenAction(story.id);
    };

    const hasOwnStory = stories.some(story => story.isOwn && !!story.image);
    const visibleStories = stories.filter(story => !!story.image);
    const currentStoryId = viewingStoryIndex !== null ? stories[viewingStoryIndex]?.id : null;
    const currentVisibleStoryIndex = currentStoryId
        ? visibleStories.findIndex(story => story.id === currentStoryId)
        : -1;

    const communityProfiles = useMemo(() => {
        const map = new Map<string, { username: string; name: string; avatar: string }>();

        posts.forEach(post => {
            const username = normalizeUsername(post.username);
            if (!username || username === 'you') return;
            if (!map.has(username)) {
                map.set(username, {
                    username,
                    name: post.author,
                    avatar: post.avatar || '🧑‍🌾',
                });
            }
        });

        users.forEach(u => {
            const username = normalizeUsername(u.username);
            if (!username || username === 'you') return;
            if (!map.has(username)) {
                map.set(username, {
                    username,
                    name: u.name,
                    avatar: u.avatar || '🧑‍🌾',
                });
            }
        });

        return Array.from(map.values());
    }, [posts, users]);

    const followingProfiles = useMemo(
        () => Array.from(followedUsernames).map(username => {
            const found = communityProfiles.find(profile => profile.username === username);
            return found || { username, name: `@${username}`, avatar: '🧑‍🌾' };
        }),
        [communityProfiles, followedUsernames]
    );

    const followersProfiles = useMemo(
        () => communityProfiles
            .filter(profile => !followedUsernames.has(profile.username))
            .slice(0, 56),
        [communityProfiles, followedUsernames]
    );

    // Follows live on the server, so they are the same on every device the
    // user signs in on. localStorage is only a first-paint hint.
    // The realtime channel keeps a second device in step: follow someone on
    // your phone and the button flips on your laptop too.
    useEffect(() => {
        let cancelled = false;
        const pull = () => {
            fetchFollowing().then(res => {
                if (!cancelled) setFollowedUsernames(new Set(res.data.map(normalizeUsername)));
            });
        };
        pull();

        const channel = supabase
            .channel('community-follows')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_follows' }, () => {
                pull();
                // Refresh follower tallies in the people directory as well.
                setPeopleRefreshKey(k => k + 1);
            })
            .subscribe();

        return () => { cancelled = true; void supabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.innerWidth >= 768) return;
        if (window.location.pathname !== '/home/community') return;

        const marker = { communityLock: true };
        window.history.replaceState(marker, '', window.location.href);
        window.history.pushState(marker, '', window.location.href);

        const handlePopState = () => {
            if (window.location.pathname === '/home/community') {
                window.history.pushState(marker, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Mirror the server's follow set into localStorage purely as a first-paint
    // cache, and keep the directory's Follow buttons in step.
    useEffect(() => {
        saveFollowedUsernames(followedUsernames);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUsers(prev => {
            const next = prev.map(userItem => ({
                ...userItem,
                following: followedUsernames.has(normalizeUsername(userItem.username)),
            }));
            // Skip the update entirely when nothing actually changed.
            return next.some((u, i) => u.following !== prev[i].following) ? next : prev;
        });
    }, [followedUsernames]);

    const handleOpenUserProfile = (username: string) => {
        const normalized = normalizeUsername(username);
        const myNormalizedDisplayName = normalizeUsername(user?.displayName || '');
        if (!normalized || normalized === 'you' || (myNormalizedDisplayName && normalized === myNormalizedDisplayName)) {
            router.push('/home/profile');
            return;
        }
        router.push(`/home/community/user/${encodeURIComponent(normalized)}`);
    };

    // Follow/unfollow — written to the server, then reconciled with its answer.
    const handleFollow = (username: string) => {
        const normalized = normalizeUsername(username);

        setFollowedUsernames(prev => {
            const next = new Set(prev);
            if (next.has(normalized)) next.delete(normalized);
            else next.add(normalized);
            return next;
        });

        void toggleFollowAction(username).then(res => {
            if (!res.success) {
                // Undo the optimistic flip — the write did not land.
                setFollowedUsernames(prev => {
                    const next = new Set(prev);
                    if (next.has(normalized)) next.delete(normalized);
                    else next.add(normalized);
                    return next;
                });
                return;
            }
            setFollowedUsernames(prev => {
                const next = new Set(prev);
                if (res.following) next.add(normalized);
                else next.delete(normalized);
                return next;
            });
        });
    };

    // Edit post — open edit modal
    const handleEdit = (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (post) setEditingPost(post);
    };

    // Save edited post. Text, media and tags are all persisted; the server
    // rejects edits to posts the caller does not own.
    const handleEditSave = (postId: string, data: { content: string; images: string[]; video: string | null; tags: string[] }) => {
        void updatePostAction(postId, {
            content: data.content,
            images: data.images,
            video: data.video,
            tags: data.tags,
        }).then(() => {
            // Either way, reconcile with what the server actually stored — a
            // rejected edit must not linger on screen as if it saved.
            void loadFeed();
        });
        setPosts(prev => prev.map(p =>
            p.id === postId
                ? {
                    ...p,
                    content: data.content,
                    images: data.images.length > 0 ? data.images : undefined,
                    video: data.video || undefined,
                    tags: data.tags,
                    type: data.video ? 'video' as const : data.images.length > 0 ? 'image' as const : 'post' as const,
                }
                : p
        ));
    };

    // Delete post
    const handleDelete = (postId: string) => {
        void deletePostAction(postId).then(res => {
            if (!res.success) void loadFeed(); // it was not ours to delete
        });
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    // Hashtag search/filter
    const handleTagClick = (tag: string) => {
        setActiveTag(activeTag === tag ? null : tag);
    };

    const handleSearch = (query: string) => {
        setActiveTag(query);
    };

    const tabPosts = (() => {
        if (feedTab === 'following') {
            return posts.filter(post => {
                const username = normalizeUsername(post.username);
                return post.isOwn || followedUsernames.has(username);
            });
        }

        if (feedTab === 'trending') {
            return [...posts].sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
        }

        return posts;
    })();

    // Apply hashtag filter on top of selected feed tab
    const filteredPosts = activeTag
        ? tabPosts.filter(p => p.tags.some(t => t.toLowerCase().includes(activeTag.toLowerCase())))
        : tabPosts;

    const emptyStateMessage = activeTag
        ? `No ${feedTab === 'trending' ? 'trending ' : ''}posts found for "${activeTag}"`
        : feedTab === 'following'
            ? 'No posts from followed users yet. Follow more farmers to build your feed.'
            : feedTab === 'trending'
                ? 'No trending posts right now. Check back shortly.'
                : 'No posts available right now.';

    // Auth gate — non-logged-in users see a login wall
    if (!user) {
        return (
            <div className="min-h-screen bg-[#f4f6f0] dark:bg-[#0d110d]">
                <Header />
                <main className="py-12 px-4">
                    <div className="mx-auto max-w-lg text-center">
                        {/* Hero illustration */}
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#22c33d]/20 to-[#8CDA4F]/10 animate-pulse" />
                            <div className="absolute inset-2 rounded-full bg-white dark:bg-[#1a231a] flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-[#22c33d]">diversity_3</span>
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                            {t('communityPage.title')}<br />
                            <span className="text-[#22c33d]">{t('communityPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                            {t('communityPage.subtitle')}
                        </p>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto text-left">
                            {[
                                { icon: 'dynamic_feed', text: 'Farming Tips & Posts' },
                                { icon: 'chat_bubble', text: 'Ask & Get Answers' },
                                { icon: 'trending_up', text: 'Trending Agri Topics' },
                                { icon: 'newspaper', text: 'World Agri News' },
                                { icon: 'groups', text: 'Farmer Groups' },
                                { icon: 'bookmark', text: 'Save & Share Posts' },
                            ].map((f) => (
                                <div key={f.text} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-[#22c33d] text-lg">{f.icon}</span>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{tp(f.text)}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                            <button
                                onClick={() => router.push('/user-register')}
                                className="flex-1 py-3.5 rounded-xl bg-[#22c33d] text-white font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-[#22c33d]/20"
                            >
                                {t('communityPage.signUp')}
                            </button>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="flex-1 py-3.5 rounded-xl border-2 border-[#22c33d] text-[#22c33d] font-bold text-base hover:bg-[#22c33d]/5 transition-all"
                            >
                                {t('communityPage.logIn')}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-6">
                            {tp('Free to join • No spam • Built for Indian farmers')}
                        </p>
                    </div>
                </main>
                <Footer />
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6f0] dark:bg-[#0d110d]">
            <Header />

            <main className="py-4 sm:py-6">
                <div className="mx-auto max-w-[1360px] px-3 sm:px-6">
                    <div className="flex gap-4 lg:gap-6">
                        {/* Left Sidebar */}
                        <div className="hidden lg:block w-[280px] shrink-0">
                            <div className="sticky top-24 space-y-5">
                                {/* User Profile Card */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    {/* Cover */}
                                    <div className="h-20 bg-gradient-to-br from-[#22c33d] via-[#2c5926] to-[#8CDA4F] relative rounded-t-2xl overflow-hidden z-0">
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                                    </div>
                                    <div className="px-5 pb-5 pt-1 relative">
                                        <div className="-mt-11 text-center relative z-10">
                                            <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1a231a] p-1 mx-auto mb-3 shadow-sm">
                                                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-[#22c33d]/30">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover object-center" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-3xl text-[#22c33d]">person</span>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{myDisplayName}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5 mb-3">{user.email || 'Community Member'}</p>
                                            <div className="flex items-center justify-center gap-6 py-3 border-t border-gray-100 dark:border-gray-800">
                                                <div className="text-center">
                                                    {/* `isOwn` comes from the server comparing user ids —
                                                        matching on display name counted nothing for an
                                                        account with no name, and over-counted everyone
                                                        sharing the "Miraitu Farmer" fallback. */}
                                                    <p className="font-bold text-gray-900 dark:text-white">{posts.filter(p => p.isOwn).length}</p>
                                                    <p className="text-[11px] text-gray-500">Posts</p>
                                                </div>
                                                <div className="text-center">
                                                    <button onClick={() => setSocialListView('following')} className="group">
                                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#22c33d] transition-colors">{BASE_FOLLOWING_COUNT + followedUsernames.size}</p>
                                                        <p className="text-[11px] text-gray-500 group-hover:text-[#22c33d] transition-colors">Following</p>
                                                    </button>
                                                </div>
                                                <div className="text-center">
                                                    <button onClick={() => setSocialListView('followers')} className="group">
                                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#22c33d] transition-colors">56</p>
                                                        <p className="text-[11px] text-gray-500 group-hover:text-[#22c33d] transition-colors">Followers</p>
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push('/home/settings')}
                                                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Navigation */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
                                    <nav className="space-y-0.5">
                                        {[
                                            { icon: 'dynamic_feed', label: 'Feed', count: null },
                                            { icon: 'people', label: 'My Network', count: '3' },
                                            { icon: 'bookmark', label: 'Saved Posts', count: posts.filter(p => p.saved).length.toString() },
                                            { icon: 'groups', label: 'Groups', count: null },
                                            { icon: 'event', label: 'Events', count: '2' },
                                            { icon: 'newspaper', label: 'News', count: null },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => setActiveNav(item.label)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === item.label
                                                    ? 'bg-[#22c33d]/10 text-[#22c33d] shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                <span className="flex-1 text-left">{item.label}</span>
                                                {item.count && item.count !== '0' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-[#22c33d]/10 text-[#22c33d] text-xs font-bold">
                                                        {item.count}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Community Stats */}
                                <div className="bg-gradient-to-br from-[#22c33d] to-[#2c5926] rounded-2xl p-5 text-white">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined">diversity_3</span>
                                        Community Stats
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/80">Active Farmers</span>
                                            <span className="font-bold">10,24,500</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/80">Posts Today</span>
                                            <span className="font-bold">2,847</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/80">Solutions Shared</span>
                                            <span className="font-bold">45,120</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="flex-1 min-w-0 max-w-full lg:max-w-[640px]">
                            {/* Stories */}
                            <StoriesBar
                                stories={stories}
                                userAvatar={user?.photoURL}
                                userName={myDisplayName}
                                hasOwnStory={hasOwnStory}
                                onAddStory={() => setShowCreateStory(true)}
                                onViewStory={handleViewStory}
                            />

                            {/* Find people — the sidebar search is xl-only, so this
                                is the only way to look someone up on a phone. */}
                            <PeopleSearch
                                query={peopleQuery}
                                onQueryChange={handlePeopleQueryChange}
                                results={users}
                                loading={peopleLoading}
                                onFollow={handleFollow}
                                onOpenProfile={handleOpenUserProfile}
                            />

                            {/* Feed Tabs */}
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 sm:mb-5 p-1 flex">
                                {[
                                    { key: 'forYou', label: 'For You', icon: 'auto_awesome' },
                                    { key: 'following', label: 'Following', icon: 'people' },
                                    { key: 'trending', label: 'Trending', icon: 'trending_up' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFeedTab(tab.key as typeof feedTab)}
                                        className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${feedTab === tab.key
                                            ? 'bg-[#22c33d] text-white shadow-md'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Inline Create Post */}
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-800 mb-4 sm:mb-5">
                                <div className="flex gap-3">
                                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-[#22c33d]/10">
                                        <button
                                            // Straight to the account's own page. The old route built a
                                            // handle out of the display name — for an account with no name
                                            // that was literally "you", a profile that does not exist.
                                            onClick={() => router.push('/home/profile')}
                                            className="w-full h-full cursor-pointer"
                                            aria-label="Open profile"
                                        >
                                            {/* Real photo when the account has one, else the same
                                                generated initials avatar used across the feed. Seeded
                                                from the same fallback name the feed signs posts with,
                                                so this reads "MF" like your posts do — not a stray "Y"
                                                from the placeholder word "you". */}
                                            <img
                                                src={resolveAvatarSrc(user?.photoURL, myDisplayName)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    img.onerror = null;
                                                    img.src = DEFAULT_COMMUNITY_AVATAR;
                                                }}
                                            />
                                        </button>
                                    </div>
                                    <textarea
                                        value={inlineText}
                                        onChange={(e) => setInlineText(e.target.value)}
                                        placeholder="Share your farming experience, tips, or questions..."
                                        rows={2}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30 transition-colors"
                                    />
                                </div>

                                {/* Inline previews */}
                                {(inlineImages.length > 0 || inlineVideo) && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {inlineImages.map((src, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => {
                                                        setInlineImages(prev => prev.filter((_, idx) => idx !== i));
                                                        forgetInlineMedia([src]);
                                                    }}
                                                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-white text-xs">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        {inlineVideo && (
                                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black flex items-center justify-center">
                                                <video src={inlineVideo} className="w-full h-full object-cover" />
                                                <span className="absolute material-symbols-outlined text-white text-2xl">play_circle</span>
                                                <button
                                                    onClick={() => {
                                                        forgetInlineMedia([inlineVideo]);
                                                        setInlineVideo(null);
                                                    }}
                                                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-white text-xs">close</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hidden file inputs */}
                                <input
                                    ref={inlinePhotoRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files || files.length === 0) return;
                                        const picked = Array.from(files);
                                        e.target.value = ''; // allow re-picking the same file after a failure
                                        setUploadError(null);
                                        // Upload straight away so the composer holds real public URLs.
                                        // Data URLs could never be shared with other users.
                                        setInlineUploading(true);
                                        for (const file of picked) {
                                            const { media, error } = await uploadCommunityMedia(file, 'image');
                                            if (media) {
                                                inlineMediaPathsRef.current.set(media.url, media.path);
                                                setInlineImages(prev => [...prev, media.url]);
                                            } else {
                                                setUploadError(error || 'Upload failed. Please try again.');
                                            }
                                        }
                                        setInlineUploading(false);
                                    }}
                                />
                                <input
                                    ref={inlineVideoRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        e.target.value = '';
                                        setUploadError(null);
                                        if (!file) return;
                                        // Uploaded to storage, not read into a data URL: a base64 video
                                        // exceeds the 1MB Server Action body cap, so the post that
                                        // carried it could never be saved.
                                        void (async () => {
                                            setInlineUploading(true);
                                            const { media, error } = await uploadCommunityMedia(file, 'video');
                                            if (media) {
                                                setInlineVideo(prev => {
                                                    if (prev) forgetInlineMedia([prev]);
                                                    return media.url;
                                                });
                                                inlineMediaPathsRef.current.set(media.url, media.path);
                                            } else {
                                                setUploadError(error || 'Upload failed. Please try again.');
                                            }
                                            setInlineUploading(false);
                                        })();
                                    }}
                                />

                                {/* Upload Error Message */}
                                {uploadError && (
                                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium flex-1">{uploadError}</span>
                                        <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-0.5 sm:gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => inlinePhotoRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-base sm:text-xl text-[#22c33d]">image</span>
                                        <span className="hidden xs:inline">Photo</span>
                                    </button>
                                    <button
                                        onClick={() => inlineVideoRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-base sm:text-xl text-[#FF9F1C]">videocam</span>
                                        <span className="hidden xs:inline">Video</span>
                                    </button>
                                    <button
                                        onClick={() => setShowCreatePost(true)}
                                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-base sm:text-xl text-[#E0C040]">tag</span>
                                        <span className="hidden xs:inline">Hashtag</span>
                                    </button>
                                    {(inlineText.trim() || inlineImages.length > 0 || inlineVideo) && (
                                        <button
                                            disabled={inlineUploading || inlinePosting}
                                            onClick={async () => {
                                                if (!inlineText.trim() && inlineImages.length === 0 && !inlineVideo) return;
                                                if (inlineUploading || inlinePosting) return;
                                                const tags = inlineText.match(/#\w+/g)?.map(t => t.slice(1)) || [];
                                                setInlinePosting(true);
                                                const result = await handleCreatePost({
                                                    content: inlineText,
                                                    images: inlineImages,
                                                    video: inlineVideo,
                                                    tags,
                                                    location: '',
                                                    pollOptions: [],
                                                });
                                                setInlinePosting(false);
                                                // Only clear once the post is actually saved. Wiping the
                                                // box unconditionally threw the draft away whenever the
                                                // write failed, with the error shown above an empty form.
                                                if (!result.success) return;
                                                // The post row owns this media now, so it must survive.
                                                inlineMediaPathsRef.current.clear();
                                                setInlineText('');
                                                setInlineImages([]);
                                                setInlineVideo(null);
                                                setUploadError(null);
                                            }}
                                            className="px-5 py-2 rounded-xl bg-[#22c33d] text-white text-sm font-semibold hover:bg-[#1ba332] transition-colors disabled:opacity-50"
                                        >
                                            {inlineUploading ? 'Uploading…' : inlinePosting ? 'Posting…' : 'Post'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Active filter indicator */}
                            {activeTag && (
                                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-[#22c33d]/10 border border-[#22c33d]/20">
                                    <span className="material-symbols-outlined text-[#22c33d]">filter_alt</span>
                                    <span className="text-sm font-semibold text-[#22c33d]">Showing posts for {activeTag}</span>
                                    <button
                                        onClick={() => setActiveTag(null)}
                                        className="ml-auto text-sm font-bold text-[#22c33d] hover:underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}

                            {/* A shared link pointed at a post that is gone */}
                            {sharedPostMissing && (
                                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <span className="material-symbols-outlined text-amber-600">link_off</span>
                                    <p className="flex-1 text-sm text-amber-700 dark:text-amber-300">
                                        That shared post is no longer available — it may have been deleted.
                                    </p>
                                    <button
                                        onClick={() => { setSharedPostMissing(false); router.replace('/home/community'); }}
                                        className="text-xs font-bold text-amber-700 hover:underline"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {/* Posts Feed */}
                            <div className="space-y-5">
                                {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        id={`post-${post.id}`}
                                        className={`scroll-mt-24 rounded-2xl transition-all duration-500 ${highlightedPostId === post.id
                                            ? 'ring-2 ring-[#22c33d] ring-offset-2 ring-offset-[#f4f6f0] dark:ring-offset-[#0d110d]'
                                            : ''}`}
                                    >
                                    <PostCard
                                        post={post}
                                        onReact={handleReact}
                                        onComment={handleComment}
                                        onShare={handleShare}
                                        onSave={handleSave}
                                        onTagClick={handleTagClick}
                                        onLikeComment={handleLikeComment}
                                        onVotePoll={handleVotePoll}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isFollowingAuthor={followedUsernames.has(normalizeUsername(post.username))}
                                        onToggleFollowAuthor={handleFollow}
                                        onAuthorClick={handleOpenUserProfile}
                                        userAvatar={user?.photoURL}
                                        requireAuth={requireAuth}
                                    />
                                    </div>
                                )) : (
                                    <div className="text-center py-16 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                                        <p className="text-gray-500 font-medium">{emptyStateMessage}</p>
                                        <div className="mt-3 flex items-center justify-center gap-3">
                                            {activeTag && (
                                                <button onClick={() => setActiveTag(null)} className="text-sm font-bold text-[#22c33d] hover:underline">
                                                    Clear filter
                                                </button>
                                            )}
                                            {feedTab !== 'forYou' && (
                                                <button onClick={() => setFeedTab('forYou')} className="text-sm font-bold text-[#22c33d] hover:underline">
                                                    Go to For You
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Load More / end of feed.
                                Hidden while a tag or tab filter is narrowing the list, since
                                filtering happens client-side over what is loaded — paging in
                                that state would be misleading. */}
                            {posts.length > 0 && !activeTag && feedTab === 'forYou' && (
                                <div className="text-center mt-8 mb-4">
                                    {hasMorePosts ? (
                                        <button
                                            onClick={() => { void loadMorePosts(); }}
                                            disabled={loadingMore}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 text-sm font-bold text-[#22c33d] hover:bg-[#22c33d]/5 hover:border-[#22c33d] disabled:opacity-50 transition-colors"
                                        >
                                            <span className={`material-symbols-outlined ${loadingMore ? 'animate-spin' : ''}`}>
                                                {loadingMore ? 'progress_activity' : 'expand_more'}
                                            </span>
                                            {loadingMore ? 'Loading…' : 'Load more posts'}
                                        </button>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 text-sm text-gray-400 font-medium">
                                            <span className="material-symbols-outlined text-[#22c33d]">check_circle</span>
                                            You&apos;re all caught up! Check back later for new posts.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* News & Events - Mobile/Tablet */}
                            <div className="xl:hidden mt-4 sm:mt-5">
                                <NewsEvents events={sampleNewsEvents} />
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="hidden xl:block w-[320px] shrink-0">
                            <div className="sticky top-24 space-y-5">
                                {/* Hashtag Search & Trending */}
                                <HashtagSearch
                                    trendingTopics={trendingTopics}
                                    onSearch={handleSearch}
                                    onTagClick={handleTagClick}
                                    activeTag={activeTag}
                                    onClearFilter={() => setActiveTag(null)}
                                />

                                {/* Suggested Users */}
                                {/* No search box here any more — PeopleSearch in the
                                    main column owns it at every breakpoint, and two
                                    inputs bound to the same query mirrored each
                                    other on wide screens. */}
                                <SuggestedUsers
                                    users={users}
                                    onFollow={handleFollow}
                                    onOpenProfile={handleOpenUserProfile}
                                />

                                {/* News & Events */}
                                <NewsEvents events={sampleNewsEvents} />

                                {/* App Download */}
                                <div className="bg-gradient-to-br from-[#22c33d] to-[#2c5926] rounded-2xl p-5 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                                    <h4 className="font-bold mb-2 relative z-10">Get the Miraitu App</h4>
                                    <p className="text-sm text-white/80 mb-4 relative z-10">Connect with farmers on the go!</p>
                                    <div className="flex gap-2 relative z-10">
                                        <button className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">phone_iphone</span>
                                            iOS
                                        </button>
                                        <button className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">android</span>
                                            Android
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Mobile FAB — opens a menu of everything you can create */}
            {showCreateMenu && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setShowCreateMenu(false)}
                />
            )}
            <div className="fixed bottom-24 right-5 z-40 md:hidden flex flex-col items-end gap-3">
                {showCreateMenu && [
                    { icon: 'videocam', label: 'Upload Short', color: '#f97316', onClick: () => { setCreateIntent('video'); setShowCreatePost(true); } },
                    { icon: 'image', label: 'Photo Post', color: '#2563eb', onClick: () => { setCreateIntent('photo'); setShowCreatePost(true); } },
                    { icon: 'poll', label: 'Poll', color: '#7e22ce', onClick: () => { setCreateIntent('poll'); setShowCreatePost(true); } },
                    { icon: 'auto_stories', label: 'Add Story', color: '#0f766e', onClick: () => setShowCreateStory(true) },
                    { icon: 'edit', label: 'Write Post', color: '#15803d', onClick: () => { setCreateIntent('post'); setShowCreatePost(true); } },
                ].map(item => (
                    <button
                        key={item.label}
                        onClick={() => { setShowCreateMenu(false); item.onClick(); }}
                        className="flex items-center gap-3 animate-[fadeIn_150ms_ease-out]"
                    >
                        <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a231a] text-gray-800 dark:text-gray-100 text-xs font-bold shadow-md whitespace-nowrap">
                            {item.label}
                        </span>
                        <span
                            className="w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </span>
                    </button>
                ))}
                <button
                    onClick={() => setShowCreateMenu(v => !v)}
                    aria-label={showCreateMenu ? 'Close create menu' : 'Open create menu'}
                    aria-expanded={showCreateMenu}
                    className="w-14 h-14 rounded-full bg-[#22c33d] text-white shadow-lg shadow-[#22c33d]/30 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                >
                    <span className={`material-symbols-outlined text-2xl transition-transform duration-200 ${showCreateMenu ? 'rotate-45' : ''}`}>add</span>
                </button>
            </div>

            {/* Create Post Modal — keyed by intent so it remounts with the right panel open */}
            <CreatePostModal
                key={`composer-${createIntent}`}
                isOpen={showCreatePost}
                intent={createIntent}
                onClose={() => setShowCreatePost(false)}
                onSubmit={handleCreatePost}
                userAvatar={user?.photoURL}
                userName={myDisplayName}
            />

            <CreateStoryModal
                isOpen={showCreateStory}
                onClose={() => setShowCreateStory(false)}
                onSubmit={handleCreateStory}
            />

            {currentVisibleStoryIndex >= 0 && (
                <StoryViewerModal
                    key={`story-viewer-${visibleStories[currentVisibleStoryIndex]?.id || 'unknown'}-${visibleStories.length}`}
                    stories={visibleStories}
                    currentIndex={currentVisibleStoryIndex}
                    onClose={() => setViewingStoryIndex(null)}
                    onStorySeen={(storyId: string) => {
                        setStories(prev => {
                            const alreadySeen = prev.some(story => story.id === storyId && story.seen);
                            if (alreadySeen) return prev;
                            return prev.map(story => story.id === storyId ? { ...story, seen: true } : story);
                        });
                        // Persisted too, so the grey ring follows the user to
                        // their other devices instead of resetting on refresh.
                        void markStorySeenAction(storyId);
                    }}
                    onReplaceStory={handleReplaceStory}
                    onDeleteStory={handleDeleteStory}
                />
            )}

            {socialListView && (
                <div className="fixed inset-0 z-[72] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setSocialListView(null)} />
                    <div className="relative w-full max-w-md max-h-[80vh] rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">{socialListView}</h3>
                            <button onClick={() => setSocialListView(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="max-h-[64vh] overflow-y-auto p-3">
                            {(socialListView === 'following' ? followingProfiles : followersProfiles).length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    No {socialListView} to show yet.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {(socialListView === 'following' ? followingProfiles : followersProfiles).map(profile => (
                                        <div
                                            key={`${socialListView}-${profile.username}`}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <button
                                                onClick={() => {
                                                    setSocialListView(null);
                                                    handleOpenUserProfile(profile.username);
                                                }}
                                                className="flex-1 min-w-0 flex items-center gap-3 text-left"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-xl shrink-0">
                                                    <img
                                                        src={resolveAvatarSrc(profile.avatar, profile.name)}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(event) => {
                                                            const img = event.currentTarget;
                                                            if (img.src.endsWith(DEFAULT_COMMUNITY_AVATAR)) return;
                                                            img.src = DEFAULT_COMMUNITY_AVATAR;
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0 text-left">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => handleFollow(profile.username)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${followedUsernames.has(normalizeUsername(profile.username))
                                                    ? 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    : 'bg-[#22c33d] text-white hover:brightness-110'
                                                    }`}
                                            >
                                                {followedUsernames.has(normalizeUsername(profile.username)) ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Post Modal */}
            <EditPostModal
                isOpen={!!editingPost}
                post={editingPost}
                onClose={() => setEditingPost(null)}
                onSave={handleEditSave}
                userAvatar={user?.photoURL}
                userName={myDisplayName}
            />

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}

