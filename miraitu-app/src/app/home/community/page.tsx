'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import LoginModal from '@/components/auth/LoginModal';

interface Post {
    id: number;
    author: string;
    avatar: string;
    location: string;
    time: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    shares: number;
    tags: string[];
    liked?: boolean;
    showComments?: boolean;
    commentList?: { author: string; text: string; time: string }[];
}

// Sample community posts
const initialPosts: Post[] = [
    {
        id: 1,
        author: 'Rajesh Kumar',
        avatar: '\uD83D\uDC68\u200D\uD83C\uDF3E',
        location: 'Punjab, India',
        time: '2 hours ago',
        content: 'Just harvested my first organic wheat crop this season! The yield was 20% higher than last year thanks to the new irrigation techniques I learned from this community. \uD83C\uDF3E\u2728',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
        likes: 245,
        comments: 32,
        shares: 15,
        tags: ['#OrganicFarming', '#WheatHarvest', '#Punjab'],
        liked: false,
        commentList: [
            { author: 'Priya S.', text: 'Congratulations! What irrigation method did you use?', time: '1h ago' },
            { author: 'Amit P.', text: 'Amazing yield! Keep it up \uD83D\uDC4F', time: '45m ago' },
        ],
    },
    {
        id: 2,
        author: 'Priya Sharma',
        avatar: '\uD83D\uDC69\u200D\uD83C\uDF3E',
        location: 'Maharashtra, India',
        time: '5 hours ago',
        content: 'Has anyone tried using neem-based pesticides for cotton crops? Looking for natural alternatives to chemical pesticides. Would appreciate any recommendations! \uD83C\uDF31',
        likes: 89,
        comments: 56,
        shares: 8,
        tags: ['#NaturalPesticides', '#CottonFarming', '#Sustainable'],
        liked: false,
        commentList: [
            { author: 'Karthik R.', text: 'Yes! Neem oil works great. Mix 2ml per litre of water.', time: '4h ago' },
        ],
    },
    {
        id: 3,
        author: 'Amit Patel',
        avatar: '\uD83E\uDDD1\u200D\uD83C\uDF3E',
        location: 'Gujarat, India',
        time: '8 hours ago',
        content: 'Sharing my experience with drip irrigation! Saved 40% water this season and my tomato yield increased significantly. Here\'s my setup:',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
        likes: 412,
        comments: 78,
        shares: 45,
        tags: ['#DripIrrigation', '#WaterSaving', '#SmartFarming'],
        liked: false,
        commentList: [
            { author: 'Sunita D.', text: 'How much did the setup cost?', time: '6h ago' },
            { author: 'Rajesh K.', text: 'Drip irrigation is the way to go!', time: '5h ago' },
        ],
    },
    {
        id: 4,
        author: 'Sunita Devi',
        avatar: '\uD83D\uDC69\u200D\uD83C\uDF3E',
        location: 'Uttar Pradesh, India',
        time: '1 day ago',
        content: 'Our women\'s farming cooperative just got approved for government subsidy! We\'re planning to buy a new tractor together. Community power! \uD83D\uDCAA\uD83D\uDE9C',
        likes: 623,
        comments: 94,
        shares: 112,
        tags: ['#WomenInAgriculture', '#Cooperative', '#Success'],
        liked: false,
        commentList: [],
    },
    {
        id: 5,
        author: 'Karthik Reddy',
        avatar: '\uD83D\uDC68\u200D\uD83C\uDF3E',
        location: 'Andhra Pradesh, India',
        time: '2 days ago',
        content: 'Weather prediction apps saved my rice crop from unexpected rainfall last week. Which weather apps do you all use for farming?',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
        likes: 178,
        comments: 65,
        shares: 23,
        tags: ['#AgriTech', '#WeatherForecast', '#RiceFarming'],
        liked: false,
        commentList: [
            { author: 'Amit P.', text: 'I use Miraitu weather card - very accurate!', time: '1d ago' },
        ],
    },
];

const trendingTopics = [
    { tag: '#OrganicFarming', posts: '12.5K' },
    { tag: '#MonsoonTips', posts: '8.3K' },
    { tag: '#DroneAgriculture', posts: '6.1K' },
    { tag: '#SoilHealth', posts: '5.8K' },
    { tag: '#FarmersMarket', posts: '4.2K' },
];

const suggestedGroups = [
    { name: 'Organic Farmers India', members: '45K', emoji: '\uD83C\uDF31', joined: false },
    { name: 'Drone Agriculture', members: '12K', emoji: '\uD83D\uDE81', joined: false },
    { name: 'Women in Farming', members: '28K', emoji: '\uD83D\uDC69\u200D\uD83C\uDF3E', joined: false },
];

export default function CommunityPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [newPostText, setNewPostText] = useState('');
    const [groups, setGroups] = useState(suggestedGroups);
    const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
    const [activeNav, setActiveNav] = useState('Feed');

    // Check if user is logged in, show login modal if not
    const requireAuth = useCallback((action: () => void) => {
        if (!user) {
            setShowLoginModal(true);
        } else {
            action();
        }
    }, [user]);

    // Like/unlike a post
    const handleLike = (postId: number) => {
        requireAuth(() => {
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
                    : p
            ));
        });
    };

    // Toggle comment section
    const handleToggleComments = (postId: number) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, showComments: !p.showComments } : p
        ));
    };

    // Add a comment
    const handleAddComment = (postId: number) => {
        const text = commentInputs[postId]?.trim();
        if (!text) return;
        requireAuth(() => {
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        comments: p.comments + 1,
                        commentList: [...(p.commentList || []), {
                            author: user?.displayName || 'You',
                            text,
                            time: 'Just now',
                        }],
                    }
                    : p
            ));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        });
    };

    // Share post
    const handleShare = (postId: number) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, shares: p.shares + 1 } : p
        ));
        // Attempt native share
        if (navigator.share) {
            const post = posts.find(p => p.id === postId);
            navigator.share({
                title: `Post by ${post?.author}`,
                text: post?.content?.slice(0, 100),
                url: window.location.href,
            }).catch(() => { /* user cancelled */ });
        }
    };

    // Create new post
    const handleCreatePost = () => {
        if (!newPostText.trim()) return;
        requireAuth(() => {
            const newPost: Post = {
                id: Date.now(),
                author: user?.displayName || 'You',
                avatar: '\uD83E\uDDD1\u200D\uD83C\uDF3E',
                location: 'India',
                time: 'Just now',
                content: newPostText.trim(),
                likes: 0,
                comments: 0,
                shares: 0,
                tags: [],
                liked: false,
                commentList: [],
            };
            setPosts(prev => [newPost, ...prev]);
            setNewPostText('');
        });
    };

    // Join/leave group
    const handleJoinGroup = (groupName: string) => {
        requireAuth(() => {
            setGroups(prev => prev.map(g =>
                g.name === groupName ? { ...g, joined: !g.joined } : g
            ));
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-8">
                <div className="mx-auto max-w-[1280px] px-6">
                    <div className="flex gap-8">
                        {/* Left Sidebar */}
                        <div className="hidden lg:block w-64 shrink-0">
                            <div className="sticky top-24 space-y-6">
                                {/* User Card */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        {user ? (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-3xl text-primary">person</span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{user.displayName || 'Farmer'}</h3>
                                                <p className="text-sm text-gray-500 mb-4">{user.email || 'Community Member'}</p>
                                                <button
                                                    onClick={() => router.push('/home/settings')}
                                                    className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                                >
                                                    Edit Profile
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Join Our Community</h3>
                                                <p className="text-sm text-gray-500 mb-4">Connect with farmers across India</p>
                                                <button
                                                    onClick={() => router.push('/user-register')}
                                                    className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition-all"
                                                >
                                                    Sign Up
                                                </button>
                                                <button
                                                    onClick={() => setShowLoginModal(true)}
                                                    className="w-full py-2.5 mt-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                                >
                                                    Log In
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 px-2">Quick Links</h4>
                                    <nav className="space-y-1">
                                        {[
                                            { icon: 'home', label: 'Feed' },
                                            { icon: 'people', label: 'My Network' },
                                            { icon: 'bookmark', label: 'Saved Posts' },
                                            { icon: 'groups', label: 'Groups' },
                                            { icon: 'event', label: 'Events' },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => {
                                                    if (item.label === 'Feed') {
                                                        setActiveNav(item.label);
                                                    } else {
                                                        requireAuth(() => setActiveNav(item.label));
                                                    }
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeNav === item.label
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                {item.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="flex-1 max-w-2xl">
                            {/* Create Post */}
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary/60">person</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newPostText}
                                            onChange={(e) => setNewPostText(e.target.value)}
                                            onFocus={() => { if (!user) setShowLoginModal(true); }}
                                            placeholder="Share your farming experience, tips, or questions..."
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm resize-none border-0 focus:ring-2 focus:ring-primary/30 outline-none"
                                            rows={3}
                                        />
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="material-symbols-outlined">image</span>
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="material-symbols-outlined">videocam</span>
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="material-symbols-outlined">poll</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!newPostText.trim()}
                                                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                                    >
                                        {/* Post Header */}
                                        <div className="p-4 flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{post.author}</h4>
                                                    <span className="text-xs text-gray-400">&bull;</span>
                                                    <span className="text-xs text-gray-500">{post.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {post.location}
                                                </p>
                                            </div>
                                            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-3">
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                {post.content}
                                            </p>
                                            {post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {post.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="text-xs text-primary font-medium hover:underline cursor-pointer"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Post Stats */}
                                        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 dark:border-gray-800">
                                            <span>{post.likes} likes</span>
                                            <div className="flex gap-4">
                                                <span>{post.comments} comments</span>
                                                <span>{post.shares} shares</span>
                                            </div>
                                        </div>

                                        {/* Post Actions */}
                                        <div className="px-4 py-2 flex items-center border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${post.liked
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined">{post.liked ? 'thumb_up' : 'thumb_up'}</span>
                                                <span className="text-sm font-medium">{post.liked ? 'Liked' : 'Like'}</span>
                                            </button>
                                            <button
                                                onClick={() => handleToggleComments(post.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${post.showComments
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined">chat_bubble</span>
                                                <span className="text-sm font-medium">Comment</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare(post.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">share</span>
                                                <span className="text-sm font-medium">Share</span>
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {post.showComments && (
                                            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
                                                {/* Existing comments */}
                                                {(post.commentList || []).length > 0 && (
                                                    <div className="pt-3 space-y-3 mb-3">
                                                        {(post.commentList || []).map((comment, i) => (
                                                            <div key={i} className="flex gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                    <span className="material-symbols-outlined text-xs text-primary">person</span>
                                                                </div>
                                                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author}</span>
                                                                        <span className="text-[10px] text-gray-400">{comment.time}</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{comment.text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Add comment input */}
                                                <div className="flex gap-2 pt-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {user?.photoURL ? (
                                                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-sm text-primary/60">person</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={commentInputs[post.id] || ''}
                                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                            onFocus={() => { if (!user) setShowLoginModal(true); }}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                                            placeholder="Write a comment..."
                                                            className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 focus:ring-2 focus:ring-primary/30 outline-none"
                                                        />
                                                        <button
                                                            onClick={() => handleAddComment(post.id)}
                                                            disabled={!commentInputs[post.id]?.trim()}
                                                            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">send</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="text-center mt-8">
                                <p className="text-sm text-gray-400 font-medium py-4">
                                    You&apos;re all caught up! Check back later for new posts.
                                </p>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="hidden xl:block w-80 shrink-0">
                            <div className="sticky top-24 space-y-6">
                                {/* Trending Topics */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">trending_up</span>
                                        Trending Topics
                                    </h4>
                                    <div className="space-y-3">
                                        {trendingTopics.map((topic, index) => (
                                            <button
                                                key={topic.tag}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                                            >
                                                <div>
                                                    <p className="font-semibold text-primary">{topic.tag}</p>
                                                    <p className="text-xs text-gray-500">{topic.posts} posts</p>
                                                </div>
                                                <span className="text-lg font-bold text-gray-300">#{index + 1}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggested Groups */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">groups</span>
                                        Suggested Groups
                                    </h4>
                                    <div className="space-y-3">
                                        {groups.map((group) => (
                                            <div
                                                key={group.name}
                                                className="flex items-center gap-3 p-2"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                                                    {group.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{group.name}</p>
                                                    <p className="text-xs text-gray-500">{group.members} members</p>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinGroup(group.name)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${group.joined
                                                        ? 'bg-primary text-white'
                                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                        }`}
                                                >
                                                    {group.joined ? 'Joined' : 'Join'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* App Download */}
                                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
                                    <h4 className="font-bold mb-2">Get the Miraitu App</h4>
                                    <p className="text-sm text-white/80 mb-4">Connect with farmers on the go!</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 rounded-lg bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors">
                                            App Store
                                        </button>
                                        <button className="flex-1 py-2 rounded-lg bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors">
                                            Play Store
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Login Modal - uses real auth */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}

