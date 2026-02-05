'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import MiraituLogo from '@/components/MiraituLogo';
import LivestockMarketplace from '@/components/marketplace/LivestockMarketplace';
import MachineryMarketplace from '@/components/marketplace/MachineryMarketplace';
import ServicesCalculations from '@/components/marketplace/ServicesCalculations';
import UploadPortal from '@/components/marketplace/UploadPortal';

type MarketplaceTab = 'livestock' | 'machinery' | 'services' | 'upload';

export default function MarketplacePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<MarketplaceTab>('livestock');

    const tabs = [
        { id: 'livestock' as MarketplaceTab, label: 'Livestock', icon: '🐄' },
        { id: 'machinery' as MarketplaceTab, label: 'Machinery & Equipment', icon: '🚜' },
        { id: 'services' as MarketplaceTab, label: 'Services & Tools', icon: '🛠️' },
        { id: 'upload' as MarketplaceTab, label: 'Upload Portal', icon: '📤' },
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
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight">
                            Marketplace
                        </h1>
                        <p className="text-lg text-soil-dark font-medium">Buy, sell, and discover farming essentials</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-[#dce8d5] shadow-[inset_4px_4px_8px_#c8d4c0,inset_-4px_-4px_8px_#f0f8e8] text-primary-dark'
                                        : 'bg-[#fbfaf9] shadow-[6px_6px_12px_#d4d9ce,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] text-soil-dark hover:text-primary'
                                    }
                                `}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-screen">
                        {activeTab === 'livestock' && <LivestockMarketplace categoryFilter="Livestock" />}
                        {activeTab === 'machinery' && <MachineryMarketplace />}
                        {activeTab === 'services' && <ServicesCalculations />}
                        {activeTab === 'upload' && <UploadPortal />}
                    </div>
                </div>
            </main>
        </div>
    );
}
