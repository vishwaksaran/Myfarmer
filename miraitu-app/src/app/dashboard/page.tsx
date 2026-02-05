'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import WeatherCard from '@/components/dashboard/WeatherCard';
import MandiPrices from '@/components/dashboard/MandiPrices';
import MiraituLogo from '@/components/MiraituLogo';
import SearchBar from '@/components/dashboard/SearchBar';
import HeroBanner from '@/components/dashboard/HeroBanner';
import ServiceCard from '@/components/dashboard/ServiceCard';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    // Auth check is handled by layout/context usually, or we can add a simple check here
    // but for now relying on the page structure
    if (loading) return null; // Or a spinner

    const userName = user?.displayName || 'Farmer';

    const services = [
        { icon: '🚜', title: 'Farm Services' },
        { icon: '👷', title: 'Book Labor' },
        { icon: '🛒', title: 'Buy & Sell' },
        { icon: '🥬', title: 'Grocery & Medicines' },
        { icon: '💰', title: 'Bill Payments' },
        { icon: '🏨', title: 'Hotel & Events' },
    ];

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
                    <div className="mb-6">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight">
                            Welcome, {userName.split(' ')[0]}!
                        </h1>
                        <p className="text-lg text-soil-dark font-medium">All Your Farming & Village Needs in One App</p>
                    </div>

                    {/* Search Bar */}
                    <SearchBar />

                    {/* Hero Banner */}
                    <HeroBanner />

                    {/* Services Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-primary-dark mb-4">Quick Services</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={index}
                                    icon={service.icon}
                                    title={service.title}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Grid - Weather and Mandi Prices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <WeatherCard />
                        <MandiPrices />
                    </div>
                </div>

                {/* Floating WhatsApp Button */}
                <div className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-50">
                    <WhatsAppButton size="lg" showLabel={true} />
                </div>
            </main>
        </div>
    );
}
