'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import LoginModal from '@/components/auth/LoginModal';

import { Post, ReactionType, Story } from '@/components/community/types';
import { samplePosts, sampleStories, sampleNewsEvents, trendingTopics, suggestedUsers } from '@/components/community/sampleData';
import StoriesBar from '@/components/community/StoriesBar';
import CreatePostModal from '@/components/community/CreatePostModal';
import CreateStoryModal from '@/components/community/CreateStoryModal';
import StoryViewerModal from '../../../components/community/StoryViewerModal';
import EditPostModal from '@/components/community/EditPostModal';
import PostCard from '@/components/community/PostCard';
import HashtagSearch from '@/components/community/HashtagSearch';
import NewsEvents from '@/components/community/NewsEvents';
import SuggestedUsers from '@/components/community/SuggestedUsers';
import { getFollowedUsernames, normalizeUsername, saveFollowedUsernames } from '@/components/community/followStore';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from '@/components/community/avatarUtils';

const BASE_FOLLOWING_COUNT = 128;

const getTrendingScore = (post: Post) => {
    return post.totalReactions + (post.commentCount * 2) + (post.shares * 3);
};

export default function CommunityPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>(samplePosts);
    const [stories, setStories] = useState<Story[]>(sampleStories);
    const [users, setUsers] = useState(suggestedUsers);
    const [followedUsernames, setFollowedUsernames] = useState<Set<string>>(
        () => new Set<string>()
    );
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
    const [socialListView, setSocialListView] = useState<'followers' | 'following' | null>(null);
    const [activeNav, setActiveNav] = useState('Feed');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'trending'>('forYou');
    const [inlineText, setInlineText] = useState('');
    const [inlineImages, setInlineImages] = useState<string[]>([]);
    const [inlineVideo, setInlineVideo] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const inlinePhotoRef = useRef<HTMLInputElement>(null);
    const inlineVideoRef = useRef<HTMLInputElement>(null);

    // User is guaranteed logged in at this point (auth gate above)
    const requireAuth = useCallback((action: () => void) => {
        action();
    }, []);

    // React to a post (toggle or switch reaction)
    const handleReact = (postId: string, reaction: ReactionType) => {
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

    // Add comment
    const handleComment = (postId: string, text: string, parentId?: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const newComment = {
                id: 'c' + Date.now(),
                author: user?.displayName || 'You',
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
    const handleLikeComment = (postId: string, commentId: string) => {
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

    // Share post
    const handleShare = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
        if (typeof navigator !== 'undefined' && navigator.share) {
            const post = posts.find(p => p.id === postId);
            navigator.share({
                title: `Post by ${post?.author}`,
                text: post?.content?.slice(0, 100),
                url: window.location.href,
            }).catch(() => { });
        }
    };

    // Save/bookmark post
    const handleSave = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    };

    // Create new post
    const handleCreatePost = (data: { content: string; images: string[]; video: string | null; tags: string[] }) => {
        const newPost: Post = {
            id: 'p' + Date.now(),
            author: user?.displayName || 'You',
            username: 'you',
            avatar: '🧑‍🌾',
            verified: false,
            location: 'India',
            time: 'Just now',
            content: data.content,
            images: data.images.length > 0 ? data.images : undefined,
            video: data.video || undefined,
            reactions: { like: 0, love: 0, celebrate: 0, insightful: 0, funny: 0, growth: 0 },
            myReaction: null,
            totalReactions: 0,
            comments: [],
            commentCount: 0,
            shares: 0,
            saved: false,
            tags: data.tags,
            type: data.video ? 'video' : data.images.length > 0 ? 'image' : 'post',
            isOwn: true,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    // Create/update own stories
    const handleCreateStory = (images: string[]) => {
        if (images.length === 0) return;

        const stamp = Date.now();
        const newOwnStories: Story[] = images.map((image, index) => ({
            id: `own-${stamp}-${index}`,
            author: 'Your Story',
            avatar: user?.photoURL || '',
            image,
            seen: false,
            isOwn: true,
        }));

        const placeholder: Story = {
            id: 'own',
            author: 'Your Story',
            avatar: user?.photoURL || '',
            image: '',
            seen: false,
            isOwn: true,
        };

        setStories(prev => {
            const withoutPlaceholder = prev.filter(story => story.id !== 'own');
            const ownStories = withoutPlaceholder.filter(story => story.isOwn);
            const otherStories = withoutPlaceholder.filter(story => !story.isOwn);
            return [placeholder, ...newOwnStories, ...ownStories, ...otherStories];
        });

        setShowCreateStory(false);
        setViewingStoryIndex(1);
    };

    // Open story viewer
    const handleViewStory = (story: Story) => {
        const idx = stories.findIndex(s => s.id === story.id);
        if (idx === -1 || !stories[idx].image) return;

        setViewingStoryIndex(idx);
        setStories(prev => prev.map((s, i) => (i === idx ? { ...s, seen: true } : s)));
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

    useEffect(() => {
        const stored = getFollowedUsernames();
        setFollowedUsernames(stored);
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

    useEffect(() => {
        saveFollowedUsernames(followedUsernames);
        setUsers(prev => prev.map(userItem => ({
            ...userItem,
            following: followedUsernames.has(normalizeUsername(userItem.username)),
        })));
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

    // Follow/unfollow user
    const handleFollow = (username: string) => {
        const normalized = normalizeUsername(username);

        setFollowedUsernames(prev => {
            const next = new Set(prev);
            if (next.has(normalized)) {
                next.delete(normalized);
            } else {
                next.add(normalized);
            }
            return next;
        });
    };

    // Edit post — open edit modal
    const handleEdit = (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (post) setEditingPost(post);
    };

    // Save edited post
    const handleEditSave = (postId: string, data: { content: string; images: string[]; video: string | null; tags: string[] }) => {
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
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{f.text}</span>
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
                            Free to join &bull; No spam &bull; Built for Indian farmers
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
                                            <h3 className="font-bold text-gray-900 dark:text-white">{user.displayName || 'Farmer'}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5 mb-3">{user.email || 'Community Member'}</p>
                                            <div className="flex items-center justify-center gap-6 py-3 border-t border-gray-100 dark:border-gray-800">
                                                <div className="text-center">
                                                    <p className="font-bold text-gray-900 dark:text-white">{posts.filter(p => p.author === (user.displayName || 'You')).length}</p>
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
                                hasOwnStory={hasOwnStory}
                                onAddStory={() => setShowCreateStory(true)}
                                onViewStory={handleViewStory}
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
                                        {user?.photoURL ? (
                                            <button
                                                onClick={() => router.push(`/home/community/user/${encodeURIComponent(normalizeUsername(user?.displayName || 'you'))}`)}
                                                className="w-full h-full cursor-pointer"
                                                aria-label="Open profile"
                                            >
                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/home/community/user/${encodeURIComponent(normalizeUsername(user?.displayName || 'you'))}`)}
                                                className="w-full h-full flex items-center justify-center cursor-pointer"
                                                aria-label="Open profile"
                                            >
                                                <span className="material-symbols-outlined text-xl text-[#22c33d]/50">person</span>
                                            </button>
                                        )}
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
                                                    onClick={() => setInlineImages(prev => prev.filter((_, idx) => idx !== i))}
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
                                                    onClick={() => setInlineVideo(null)}
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
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (!files) return;
                                        setUploadError(null);
                                        Array.from(files).forEach(file => {
                                            if (file.size > 10 * 1024 * 1024) {
                                                setUploadError('Image must be under 10MB');
                                                return;
                                            }
                                            if (!file.type.startsWith('image/')) {
                                                setUploadError('Only image files are allowed');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                if (ev.target?.result) setInlineImages(prev => [...prev, ev.target!.result as string]);
                                            };
                                            reader.onerror = () => setUploadError('Failed to read image. Please try again.');
                                            reader.readAsDataURL(file);
                                        });
                                        e.target.value = '';
                                    }}
                                />
                                <input
                                    ref={inlineVideoRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setUploadError(null);
                                        if (!file) return;
                                        if (!file.type.startsWith('video/')) {
                                            setUploadError('Only video files are allowed');
                                            e.target.value = '';
                                            return;
                                        }
                                        if (file.size > 50 * 1024 * 1024) {
                                            setUploadError(`Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 50MB.`);
                                            e.target.value = '';
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            if (ev.target?.result) setInlineVideo(ev.target.result as string);
                                        };
                                        reader.onerror = () => setUploadError('Failed to process video. Please try a different file.');
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
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
                                            onClick={() => {
                                                if (!inlineText.trim() && inlineImages.length === 0 && !inlineVideo) return;
                                                const tags = inlineText.match(/#\w+/g)?.map(t => t.slice(1)) || [];
                                                const newPost: Post = {
                                                    id: `p${Date.now()}`,
                                                    author: user?.displayName || 'You',
                                                    username: `@${(user?.displayName || 'user').toLowerCase().replace(/\s+/g, '')}`,
                                                    avatar: user?.photoURL || '',
                                                    verified: false,
                                                    location: '',
                                                    time: 'Just now',
                                                    content: inlineText,
                                                    images: inlineImages.length > 0 ? inlineImages : undefined,
                                                    video: inlineVideo || undefined,
                                                    reactions: { like: 0, love: 0, celebrate: 0, insightful: 0, funny: 0, growth: 0 },
                                                    totalReactions: 0,
                                                    comments: [],
                                                    commentCount: 0,
                                                    shares: 0,
                                                    saved: false,
                                                    tags,
                                                    type: inlineVideo ? 'video' : inlineImages.length > 0 ? 'image' : 'post',
                                                    isOwn: true,
                                                };
                                                setPosts(prev => [newPost, ...prev]);
                                                setInlineText('');
                                                setInlineImages([]);
                                                setInlineVideo(null);
                                            }}
                                            className="px-5 py-2 rounded-xl bg-[#22c33d] text-white text-sm font-semibold hover:bg-[#1ba332] transition-colors"
                                        >
                                            Post
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

                            {/* Posts Feed */}
                            <div className="space-y-5">
                                {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onReact={handleReact}
                                        onComment={handleComment}
                                        onShare={handleShare}
                                        onSave={handleSave}
                                        onTagClick={handleTagClick}
                                        onLikeComment={handleLikeComment}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isFollowingAuthor={followedUsernames.has(normalizeUsername(post.username))}
                                        onToggleFollowAuthor={handleFollow}
                                        onAuthorClick={handleOpenUserProfile}
                                        userAvatar={user?.photoURL}
                                        requireAuth={requireAuth}
                                    />
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

                            {/* Load More */}
                            {filteredPosts.length > 0 && (
                                <div className="text-center mt-8 mb-4">
                                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 text-sm text-gray-400 font-medium">
                                        <span className="material-symbols-outlined text-[#22c33d]">check_circle</span>
                                        You&apos;re all caught up! Check back later for new posts.
                                    </div>
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
                                <SuggestedUsers users={users} onFollow={handleFollow} />

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

            {/* Mobile FAB - Create Post */}
            <button
                onClick={() => setShowCreatePost(true)}
                className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#22c33d] text-white shadow-lg shadow-[#22c33d]/30 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all z-40 md:hidden"
            >
                <span className="material-symbols-outlined text-2xl">add</span>
            </button>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                onSubmit={handleCreatePost}
                userAvatar={user?.photoURL}
                userName={user?.displayName}
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
                    }}
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
                userName={user?.displayName}
            />

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}

