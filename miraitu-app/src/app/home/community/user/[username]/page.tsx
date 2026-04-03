'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { samplePosts, suggestedUsers } from '@/components/community/sampleData';
import { getFollowedUsernames, normalizeUsername, toggleFollowedUsername } from '@/components/community/followStore';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from '@/components/community/avatarUtils';
import { useAuth } from '@/context/AuthContext';

const baseFollowersCount = 560;

export default function CommunityUserProfilePage() {
    const params = useParams<{ username: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const routeUsername = decodeURIComponent(params.username || '');
    const normalizedRouteUsername = normalizeUsername(routeUsername);
    const normalizedLoggedInName = normalizeUsername(user?.displayName || '');
    const isLoggedInUsersProfile = !!user && !!normalizedLoggedInName && normalizedLoggedInName === normalizedRouteUsername;

    const authorPosts = useMemo(
        () => samplePosts.filter(post => normalizeUsername(post.username) === normalizedRouteUsername),
        [normalizedRouteUsername]
    );

    const suggestedProfile = useMemo(
        () => suggestedUsers.find(user => normalizeUsername(user.username) === normalizedRouteUsername),
        [normalizedRouteUsername]
    );

    const displayName = isLoggedInUsersProfile
        ? (user?.displayName || routeUsername || 'Community User')
        : (authorPosts[0]?.author || suggestedProfile?.name || routeUsername || 'Community User');
    const avatar = isLoggedInUsersProfile
        ? (user?.photoURL || '')
        : (authorPosts[0]?.avatar || suggestedProfile?.avatar || '');
    const resolvedProfileAvatar = resolveAvatarSrc(avatar, displayName);
    const location = authorPosts[0]?.location || 'India';
    const bio = suggestedProfile?.bio || 'Active member of the Miraitu farming community.';

    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(baseFollowersCount);

    useEffect(() => {
        const followed = getFollowedUsernames();
        const following = followed.has(normalizedRouteUsername);
        setIsFollowing(following);
        setFollowerCount(baseFollowersCount + (following ? 1 : 0));

        const onStorage = () => {
            const latest = getFollowedUsernames().has(normalizedRouteUsername);
            setIsFollowing(latest);
            setFollowerCount(baseFollowersCount + (latest ? 1 : 0));
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [normalizedRouteUsername]);

    const handleToggleFollow = () => {
        const latest = toggleFollowedUsername(normalizedRouteUsername);
        const following = latest.has(normalizedRouteUsername);
        setIsFollowing(following);
        setFollowerCount(baseFollowersCount + (following ? 1 : 0));
    };

    return (
        <div className="min-h-screen bg-[#f4f6f0] dark:bg-[#0d110d]">
            <Header />

            <main className="py-6 sm:py-10">
                <div className="mx-auto max-w-[980px] px-4 sm:px-6 space-y-5 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/70 dark:bg-[#1a231a]/70 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 sm:px-4">
                        <Link href="/home/community" className="hover:text-[#22c33d] transition-colors">Community</Link>
                        <span>/</span>
                        <span className="font-semibold text-[#22c33d]">{displayName}</span>
                    </div>

                    <section className="bg-white dark:bg-[#1a231a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="relative px-5 sm:px-7 pt-6 sm:pt-7 pb-6 sm:pb-7 bg-gradient-to-br from-[#1f8c30] via-[#2d6a2b] to-[#8CDA4F]">
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-black/10 blur-xl" />

                            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/95 p-1.5 shadow-xl border border-white/80 shrink-0">
                                        <div className="w-full h-full rounded-2xl bg-[#eaf6ec] flex items-center justify-center text-3xl overflow-hidden">
                                            <img
                                                src={resolvedProfileAvatar}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                onError={(event) => {
                                                    const img = event.currentTarget;
                                                    if (img.src.endsWith(DEFAULT_COMMUNITY_AVATAR)) return;
                                                    img.src = DEFAULT_COMMUNITY_AVATAR;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0 pt-1">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{displayName}</h1>
                                        <p className="text-sm text-white/85 truncate">@{normalizedRouteUsername}</p>
                                        <p className="text-sm text-white/90 mt-1 truncate">{location}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleToggleFollow}
                                    className={`self-start lg:self-center min-w-[120px] px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isFollowing
                                        ? 'bg-white/20 text-white border border-white/40 hover:bg-white/25'
                                        : 'bg-white text-[#1f8c30] hover:bg-[#f3fff4]'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-5 sm:py-6">
                            <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">{bio}</p>

                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">{authorPosts.length}</p>
                                    <p className="text-gray-500 mt-1">Posts</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">{followerCount}</p>
                                    <p className="text-gray-500 mt-1">Followers</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">{isFollowing ? 'Yes' : 'No'}</p>
                                    <p className="text-gray-500 mt-1">Following</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">Community</p>
                                    <p className="text-gray-500 mt-1">Member</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 mb-8">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
                            <button
                                onClick={() => router.push('/home/community')}
                                className="text-sm font-semibold text-[#22c33d] hover:underline"
                            >
                                Back to feed
                            </button>
                        </div>

                        {authorPosts.length === 0 ? (
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center text-gray-500 shadow-sm">
                                No public posts available for this user yet.
                            </div>
                        ) : (
                            authorPosts.map(post => (
                                <article key={post.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                    <div className="p-4 sm:p-5">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <p className="text-xs text-gray-500">{post.time}</p>
                                            <span className="text-[11px] font-semibold text-gray-400">{post.commentCount} comments</span>
                                        </div>

                                        <p className="text-sm sm:text-[15px] text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{post.content}</p>

                                        {post.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="text-xs font-semibold text-[#22c33d] bg-[#22c33d]/10 rounded-full px-2.5 py-1">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {post.images?.[0] && (
                                        <img src={post.images[0]} alt={post.author} className="w-full h-56 object-cover" />
                                    )}
                                </article>
                            ))
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
