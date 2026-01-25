'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import WeatherCard from '@/components/dashboard/WeatherCard';
import PriorityTasks from '@/components/dashboard/PriorityTasks';
import MandiPrices from '@/components/dashboard/MandiPrices';
import MiraituLogo from '@/components/MiraituLogo';
import AddTaskModal from '@/components/dashboard/AddTaskModal';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Auth check is handled by layout/context usually, or we can add a simple check here
    // but for now relying on the page structure
    if (loading) return null; // Or a spinner

    const userName = user?.displayName || 'Farmer';

    return (
        <div className="flex h-screen bg-[#fbfaf9] overflow-hidden font-display">
            {/* Sidebar */}
            <div className="hidden lg:block h-full">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full relative">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-[#fbfaf9] border-b border-[#e0e5df] sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={32} />
                        <h2 className="text-xl font-bold text-primary-dark">Miraitu</h2>
                    </div>
                    <div className="size-8 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: user?.photoURL ? `url(${user.photoURL})` : undefined }}></div>
                </header>

                <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto pb-32">
                    {/* Welcome Section */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight">
                                Good Morning, {userName.split(' ')[0]}
                            </h1>
                            <p className="text-lg text-soil-dark font-medium">It's a great day for sowing wheat.</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8eede] px-4 py-2 text-sm font-bold text-primary border border-primary/20 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">location_on</span> Punjab, IN
                            </span>
                            <button
                                onClick={() => setIsTaskModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#1a3617,0_8px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_#1a3617,0_4px_10px_rgba(0,0,0,0.2)] active:translate-y-1 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">add_task</span>
                                Add New Task
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <WeatherCard />
                        <PriorityTasks />
                        <MandiPrices />
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-50 flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer hover:scale-105 transition-transform">
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-lime-accent/50 animate-ping opacity-75"></div>
                        <button className="relative flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-full bg-gradient-to-b from-[#4d8f43] to-[#1e3d1a] text-white shadow-floating border-4 border-[#B0EA3C]/30 z-10">
                            <span className="material-symbols-outlined text-3xl lg:text-4xl drop-shadow-md">mic</span>
                        </button>
                    </div>
                    <span className="bg-primary-dark/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                        Tap to Speak
                    </span>
                </div>
            </main>

            {/* Add Task Modal */}
            <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
        </div>
    );
}
