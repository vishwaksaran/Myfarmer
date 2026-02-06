'use client';

import { useState } from 'react';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLogo from '@/components/MiraituLogo';

// Sample community posts
const samplePosts = [
    {
        id: 1,
        author: 'Rajesh Kumar',
        avatar: '👨‍🌾',
        location: 'Punjab, India',
        time: '2 hours ago',
        content: 'Just harvested my first organic wheat crop this season! The yield was 20% higher than last year thanks to the new irrigation techniques I learned from this community. 🌾✨',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
        likes: 245,
        comments: 32,
        shares: 15,
        tags: ['#OrganicFarming', '#WheatHarvest', '#Punjab'],
    },
    {
        id: 2,
        author: 'Priya Sharma',
        avatar: '👩‍🌾',
        location: 'Maharashtra, India',
        time: '5 hours ago',
        content: 'Has anyone tried using neem-based pesticides for cotton crops? Looking for natural alternatives to chemical pesticides. Would appreciate any recommendations! 🌱',
        likes: 89,
        comments: 56,
        shares: 8,
        tags: ['#NaturalPesticides', '#CottonFarming', '#Sustainable'],
    },
    {
        id: 3,
        author: 'Amit Patel',
        avatar: '🧑‍🌾',
        location: 'Gujarat, India',
        time: '8 hours ago',
        content: 'Sharing my experience with drip irrigation! Saved 40% water this season and my tomato yield increased significantly. Here\'s my setup:',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
        likes: 412,
        comments: 78,
        shares: 45,
        tags: ['#DripIrrigation', '#WaterSaving', '#SmartFarming'],
    },
    {
        id: 4,
        author: 'Sunita Devi',
        avatar: '👩‍🌾',
        location: 'Uttar Pradesh, India',
        time: '1 day ago',
        content: 'Our women\'s farming cooperative just got approved for government subsidy! We\'re planning to buy a new tractor together. Community power! 💪🚜',
        likes: 623,
        comments: 94,
        shares: 112,
        tags: ['#WomenInAgriculture', '#Cooperative', '#Success'],
    },
    {
        id: 5,
        author: 'Karthik Reddy',
        avatar: '👨‍🌾',
        location: 'Andhra Pradesh, India',
        time: '2 days ago',
        content: 'Weather prediction apps saved my rice crop from unexpected rainfall last week. Which weather apps do you all use for farming?',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
        likes: 178,
        comments: 65,
        shares: 23,
        tags: ['#AgriTech', '#WeatherForecast', '#RiceFarming'],
    },
];

const trendingTopics = [
    { tag: '#OrganicFarming', posts: '12.5K' },
    { tag: '#MonsooonTips', posts: '8.3K' },
    { tag: '#DroneAgriculture', posts: '6.1K' },
    { tag: '#SoilHealth', posts: '5.8K' },
    { tag: '#FarmersMarket', posts: '4.2K' },
];

export default function CommunityPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [newPostText, setNewPostText] = useState('');

    const handleInteraction = () => {
        setShowAuthModal(true);
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
                                {/* User Card (Not Logged In) */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Join Our Community</h3>
                                        <p className="text-sm text-gray-500 mb-4">Connect with farmers across India</p>
                                        <button
                                            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                                            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition-all"
                                        >
                                            Sign Up
                                        </button>
                                        <button
                                            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                                            className="w-full py-2.5 mt-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                        >
                                            Log In
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 px-2">Quick Links</h4>
                                    <nav className="space-y-1">
                                        {[
                                            { icon: 'home', label: 'Feed', active: true },
                                            { icon: 'people', label: 'My Network', active: false },
                                            { icon: 'bookmark', label: 'Saved Posts', active: false },
                                            { icon: 'groups', label: 'Groups', active: false },
                                            { icon: 'event', label: 'Events', active: false },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={item.active ? undefined : handleInteraction}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active
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
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newPostText}
                                            onChange={(e) => setNewPostText(e.target.value)}
                                            onFocus={handleInteraction}
                                            placeholder="Share your farming experience, tips, or questions..."
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm resize-none border-0 focus:ring-2 focus:ring-primary/30"
                                            rows={3}
                                        />
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleInteraction}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined">image</span>
                                                </button>
                                                <button
                                                    onClick={handleInteraction}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined">videocam</span>
                                                </button>
                                                <button
                                                    onClick={handleInteraction}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined">poll</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleInteraction}
                                                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {samplePosts.map((post) => (
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
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{post.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {post.location}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleInteraction}
                                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-3">
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                {post.content}
                                            </p>
                                            {post.tags && (
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
                                                onClick={handleInteraction}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">thumb_up</span>
                                                <span className="text-sm font-medium">Like</span>
                                            </button>
                                            <button
                                                onClick={handleInteraction}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">chat_bubble</span>
                                                <span className="text-sm font-medium">Comment</span>
                                            </button>
                                            <button
                                                onClick={handleInteraction}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">share</span>
                                                <span className="text-sm font-medium">Share</span>
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleInteraction}
                                    className="px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Load More Posts
                                </button>
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
                                                onClick={handleInteraction}
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
                                        {[
                                            { name: 'Organic Farmers India', members: '45K', emoji: '🌱' },
                                            { name: 'Drone Agriculture', members: '12K', emoji: '🚁' },
                                            { name: 'Women in Farming', members: '28K', emoji: '👩‍🌾' },
                                        ].map((group) => (
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
                                                    onClick={handleInteraction}
                                                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                                                >
                                                    Join
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

            {/* Auth Modal Overlay */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAuthModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>

                        {/* Header with Logo */}
                        <div className="pt-8 pb-6 px-8 text-center border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-primary/5 to-transparent">
                            <div className="flex justify-center mb-4">
                                <MiraituLogo size={60} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {authMode === 'login' ? 'Welcome Back!' : 'Join Miraitu Community'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-2">
                                {authMode === 'login'
                                    ? 'Log in to connect with fellow farmers'
                                    : 'Create an account to share and collaborate'}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                {authMode === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Phone Number or Email
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone or email"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                {authMode === 'login' && (
                                    <div className="text-right">
                                        <button type="button" className="text-sm text-primary hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                                >
                                    {authMode === 'login' ? 'Log In' : 'Create Account'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-sm text-gray-400">or continue with</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Social Login */}
                            <div className="flex gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span className="material-symbols-outlined text-gray-600">phone_android</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OTP</span>
                                </button>
                            </div>

                            {/* Switch Mode */}
                            <p className="text-center text-sm text-gray-500 mt-6">
                                {authMode === 'login' ? (
                                    <>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            onClick={() => setAuthMode('signup')}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setAuthMode('login')}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Log In
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
