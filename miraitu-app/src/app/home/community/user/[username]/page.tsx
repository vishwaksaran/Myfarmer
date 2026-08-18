'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { normalizeUsername } from '@/components/community/followStore';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from '@/components/community/avatarUtils';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfileByHandle, fetchFollowStats, fetchFollowList, toggleFollow as toggleFollowAction, type CommunityUser } from '@/app/actions/community';
import { Z } from '@/lib/z-layers';
import { compressImage } from '@/lib/image-compress';
import type { Post } from '@/components/community/types';

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export default function CommunityUserProfilePage() {
    const params = useParams<{ username: string }>();
    const router = useRouter();
    const { user, uploadAvatar } = useAuth();
    const routeUsername = decodeURIComponent(params.username || '');
    const normalizedRouteUsername = normalizeUsername(routeUsername);

    // Real profile + that person's real posts, looked up by handle.
    const [profile, setProfile] = useState<CommunityUser | null>(null);
    const [authorPosts, setAuthorPosts] = useState<Post[]>([]);
    const [loadedHandle, setLoadedHandle] = useState<string | null>(null);

    // Am I looking at my own profile?
    //
    // The id comparison is the answer now that every "my profile" link carries
    // a real `profiles.username`, so the lookup resolves and `profile.id` is
    // there to compare. The handle fallback below only covers links saved
    // before that — they point at normalizeUsername(displayName || 'you'),
    // which matches no profile row, leaving `profile` null.
    const legacySelfLink = !profile && normalizeUsername(user?.displayName || 'you') === normalizedRouteUsername;
    const isLoggedInUsersProfile = !!user
        && !user.isGuest
        && ((!!profile?.id && profile.id === user.id) || legacySelfLink);
    // Derived rather than a separate flag, so navigating between profiles shows
    // the loading state without a synchronous setState inside the effect.
    const profileLoading = loadedHandle !== routeUsername;

    useEffect(() => {
        let cancelled = false;
        fetchUserProfileByHandle(routeUsername).then(res => {
            if (cancelled) return;
            setProfile(res.user);
            setAuthorPosts(res.posts);
            setLoadedHandle(routeUsername);
        });
        return () => { cancelled = true; };
    }, [routeUsername]);

    const displayName = isLoggedInUsersProfile
        ? (user?.displayName || profile?.name || routeUsername || 'Community User')
        : (profile?.name || authorPosts[0]?.author || routeUsername || 'Community User');
    // ── Avatar upload (own profile only) ──────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarNotice, setAvatarNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    /** Set on success so the new photo shows immediately, before context propagates. */
    const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
    const canEditAvatar = isLoggedInUsersProfile;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset immediately so re-picking the same file still fires onChange.
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAvatarNotice({ type: 'error', text: 'Please choose an image file.' });
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setAvatarNotice({ type: 'error', text: 'Image must be under 10MB.' });
            return;
        }

        setUploadingAvatar(true);
        setAvatarNotice(null);
        try {
            const compressed = await compressImage(file, 512, 0.9);
            const result = await uploadAvatar(compressed);
            if (result.error) {
                setAvatarNotice({ type: 'error', text: `Upload failed: ${result.error}` });
            } else if (result.url) {
                setUploadedAvatar(result.url);
                setAvatarNotice({ type: 'success', text: 'Profile photo updated!' });
                setTimeout(() => setAvatarNotice(null), 3000);
            }
        } catch {
            setAvatarNotice({ type: 'error', text: 'Could not process that image. Try another one.' });
        }
        setUploadingAvatar(false);
    };

    const avatar = isLoggedInUsersProfile
        ? (uploadedAvatar || user?.photoURL || profile?.avatar || '')
        : (profile?.avatar || authorPosts[0]?.avatar || '');
    const resolvedProfileAvatar = resolveAvatarSrc(avatar, displayName);
    const location = profile?.location || authorPosts[0]?.location || 'India';
    const bio = profile?.bio || 'Active member of the Miraitu farming community.';

    // Real, server-side follow state and tallies — identical on every device.
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Follower / following lists, opened from the tallies.
    const [listView, setListView] = useState<'followers' | 'following' | null>(null);
    const [listPeople, setListPeople] = useState<CommunityUser[]>([]);
    const [listLoading, setListLoading] = useState(false);

    const openList = (kind: 'followers' | 'following') => {
        setListView(kind);
        setListLoading(true);
        setListPeople([]);
        void fetchFollowList(routeUsername, kind).then(res => {
            setListPeople(res.data);
            setListLoading(false);
        });
    };

    useEffect(() => {
        let cancelled = false;
        fetchFollowStats(routeUsername).then(stats => {
            if (cancelled) return;
            setIsFollowing(stats.isFollowing);
            setFollowerCount(stats.followers);
            setFollowingCount(stats.following);
        });
        return () => { cancelled = true; };
    }, [routeUsername]);

    const handleToggleFollow = () => {
        // Optimistic, then reconciled with what the server actually stored.
        const next = !isFollowing;
        setIsFollowing(next);
        setFollowerCount(c => Math.max(0, c + (next ? 1 : -1)));

        void toggleFollowAction(routeUsername).then(res => {
            if (!res.success) {
                setIsFollowing(!next);
                setFollowerCount(c => Math.max(0, c + (next ? -1 : 1)));
                return;
            }
            void fetchFollowStats(routeUsername).then(stats => {
                setIsFollowing(stats.isFollowing);
                setFollowerCount(stats.followers);
                setFollowingCount(stats.following);
            });
        });
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
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                                        <div className="w-full h-full rounded-3xl bg-white/95 p-1.5 shadow-xl border border-white/80">
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

                                        {/* Change photo — only on your own profile */}
                                        {canEditAvatar && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingAvatar}
                                                    aria-label="Change profile photo"
                                                    title="Change profile photo"
                                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#22c33d] text-white border-2 border-white shadow-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
                                                >
                                                    <span className={`material-symbols-outlined text-base ${uploadingAvatar ? 'animate-spin' : ''}`}>
                                                        {uploadingAvatar ? 'progress_activity' : 'photo_camera'}
                                                    </span>
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarChange}
                                                />
                                            </>
                                        )}

                                        {uploadingAvatar && (
                                            <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 pt-1">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{displayName}</h1>
                                        <p className="text-sm text-white/85 truncate">@{normalizedRouteUsername}</p>
                                        <p className="text-sm text-white/90 mt-1 truncate">{location}</p>
                                    </div>
                                </div>

                                {/* You cannot follow yourself — your own profile gets the
                                    photo action instead. */}
                                {isLoggedInUsersProfile ? (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="self-start lg:self-center min-w-[120px] px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-[#1f8c30] hover:bg-[#f3fff4] transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
                                    >
                                        <span className={`material-symbols-outlined text-base ${uploadingAvatar ? 'animate-spin' : ''}`}>
                                            {uploadingAvatar ? 'progress_activity' : 'photo_camera'}
                                        </span>
                                        {uploadingAvatar ? 'Uploading…' : avatar ? 'Change Photo' : 'Add Photo'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleToggleFollow}
                                        className={`self-start lg:self-center min-w-[120px] px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isFollowing
                                            ? 'bg-white/20 text-white border border-white/40 hover:bg-white/25'
                                            : 'bg-white text-[#1f8c30] hover:bg-[#f3fff4]'
                                            }`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-5 sm:py-6">
                            {avatarNotice && (
                                <div className={`mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${avatarNotice.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900'
                                    }`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {avatarNotice.type === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                    {avatarNotice.text}
                                </div>
                            )}

                            <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">{bio}</p>

                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">{authorPosts.length}</p>
                                    <p className="text-gray-500 mt-1">Posts</p>
                                </div>
                                {/* Tallies open the actual lists — they were plain
                                    divs, so tapping a follower count did nothing. */}
                                <button
                                    onClick={() => openList('followers')}
                                    className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none group-hover:text-[#22c33d] transition-colors">{followerCount}</p>
                                    <p className="text-gray-500 mt-1 flex items-center gap-0.5">
                                        Followers
                                        <span className="material-symbols-outlined text-[14px] opacity-60">chevron_right</span>
                                    </p>
                                </button>
                                <button
                                    onClick={() => openList('following')}
                                    className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-none group-hover:text-[#22c33d] transition-colors">{followingCount}</p>
                                    <p className="text-gray-500 mt-1 flex items-center gap-0.5">
                                        Following
                                        <span className="material-symbols-outlined text-[14px] opacity-60">chevron_right</span>
                                    </p>
                                </button>
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

                        {profileLoading ? (
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center text-gray-400 shadow-sm">
                                <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                                Loading posts…
                            </div>
                        ) : authorPosts.length === 0 ? (
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

            {/* Followers / following list */}
            {listView && (
                <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: Z.MODAL }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setListView(null)} />

                    <div className="relative w-full sm:max-w-md max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#1a231a] shadow-2xl overflow-hidden">
                        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                                {listView}
                                {!listLoading && listPeople.length > 0 && (
                                    <span className="ml-1.5 text-sm font-semibold text-gray-400">{listPeople.length}</span>
                                )}
                            </h3>
                            <button
                                onClick={() => setListView(null)}
                                aria-label="Close"
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto p-3">
                            {listLoading ? (
                                <p className="py-10 text-center text-sm text-gray-400">
                                    <span className="material-symbols-outlined animate-spin align-middle mr-1.5">progress_activity</span>
                                    Loading…
                                </p>
                            ) : listPeople.length === 0 ? (
                                <p className="py-10 text-center text-sm text-gray-500">
                                    {listView === 'followers'
                                        ? 'Nobody follows this profile yet.'
                                        : 'This profile is not following anyone yet.'}
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {listPeople.map(person => (
                                        <button
                                            key={person.id}
                                            onClick={() => {
                                                setListView(null);
                                                router.push(`/home/community/user/${encodeURIComponent(person.username)}`);
                                            }}
                                            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <span className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10">
                                                <img
                                                    src={resolveAvatarSrc(person.avatar, person.name)}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(event) => {
                                                        const img = event.currentTarget;
                                                        if (img.src.endsWith(DEFAULT_COMMUNITY_AVATAR)) return;
                                                        img.src = DEFAULT_COMMUNITY_AVATAR;
                                                    }}
                                                />
                                            </span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {person.name}
                                                </span>
                                                <span className="block text-xs text-gray-500 truncate">
                                                    @{person.username}
                                                    {person.location && ` · ${person.location}`}
                                                </span>
                                            </span>
                                            <span className="material-symbols-outlined text-gray-300 shrink-0">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
