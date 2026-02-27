'use client';

import { useState } from 'react';

const videos = [
    {
        id: 'v1',
        title: 'Shiva Kumar \u2013 Verified Seller',
        role: 'Seller',
        thumbnail: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&h=300&fit=crop',
        youtubeId: 'EZXkM7UXoDI',
        views: '1.2K views',
        duration: '3:45'
    },
    {
        id: 'v2',
        title: 'Ramesh \u2013 Tractor Dealer',
        role: 'Dealer',
        thumbnail: 'https://images.unsplash.com/photo-1530507629858-e4977d01e975?w=400&h=300&fit=crop',
        youtubeId: 'EZXkM7UXoDI',
        views: '3.4K views',
        duration: '4:12'
    },
    {
        id: 'v3',
        title: 'Lakshmi \u2013 Organic Farmer',
        role: 'Farmer',
        thumbnail: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&h=300&fit=crop',
        youtubeId: 'EZXkM7UXoDI',
        views: '5.1K views',
        duration: '5:30'
    },
    {
        id: 'v4',
        title: 'Venkat \u2013 Drone Service',
        role: 'Service Provider',
        thumbnail: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop',
        youtubeId: 'EZXkM7UXoDI',
        views: '890 views',
        duration: '2:58'
    }
];

export default function FeaturedVideosSection() {
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    return (
        <section className="py-12 md:py-16 bg-white dark:bg-[#121811] relative overflow-hidden">
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-red-600 uppercase bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-300">
                        Success Stories
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight mb-3">
                        Watch Farmer Stories
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Hear directly from sellers, dealers, and farmers about their success with Miraitu.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="aspect-video relative bg-black">
                                {playingVideo === video.id ? (
                                    <iframe
                                        src={`https://www.youtube.com/watch?v=EZXkM7UXoDI`}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full relative cursor-pointer"
                                        onClick={() => setPlayingVideo(video.id)}
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center pl-1 shadow-md">
                                                    <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                            {video.duration}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-md">
                                        {video.role}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                                        <span className="material-symbols-outlined text-xs">visibility</span>
                                        {video.views}
                                    </span>
                                </div>
                                <h3
                                    className="font-bold text-gray-900 dark:text-gray-100 leading-tight cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                                    onClick={() => setPlayingVideo(video.id)}
                                >
                                    {video.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
