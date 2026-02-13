import Header from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import QuickServices from '@/components/home/QuickServices';
import LivestockMarketplace from '@/components/home/LivestockMarketplace';
import VeterinarySection from '@/components/home/VeterinarySection';
import FPOBanner from '@/components/home/FPOBanner';
import FinanceBanner from '@/components/home/FinanceBanner';
import MachinerySection from '@/components/home/MachinerySection';
import CropMarketplaceSection from '@/components/home/CropMarketplaceSection';
import StorageSection from '@/components/home/StorageSection';
import ShopSection from '@/components/home/ShopSection';
import FarmLandSection from '@/components/home/FarmLandSection';
import ServicesSection from '@/components/home/ServicesSection';
import WaterEnergySection from '@/components/home/WaterEnergySection';
import ToolboxSection from '@/components/home/ToolboxSection';
import Footer from '@/components/home/Footer';
import CTABanner from '@/components/home/CTABanner';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FeaturedVideosSection from '@/components/home/FeaturedVideosSection';
import './globals-v2.css';

export const metadata = {
    title: 'Miraitu — The Future of Smart Farming',
    description: 'Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers across India.',
};

export default function V2Page() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            {/* Sticky Header Wrapper */}
            <div className="sticky top-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
            </div>
            <main className="flex-1 w-full flex flex-col overflow-x-hidden">
                <HeroSection />
                <QuickServices />
                <FinanceBanner />
                <FPOBanner />
                <LivestockMarketplace />
                <VeterinarySection />
                <CTABanner />
                <MachinerySection />
                <CropMarketplaceSection />
                <StorageSection />
                <ShopSection />
                <FarmLandSection />
                <ServicesSection />
                <WaterEnergySection />
                <ToolboxSection />
                <TestimonialsSection />
                <FeaturedVideosSection />
                <Footer />
            </main>
        </div>
    );
}
