import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import QuickServices from '@/components/v2/QuickServices';
import LivestockMarketplace from '@/components/v2/LivestockMarketplace';
import VeterinarySection from '@/components/v2/VeterinarySection';
import FPOBanner from '@/components/v2/FPOBanner';
import FinanceBanner from '@/components/v2/FinanceBanner';
import FarmerServicesGrid from '@/components/v2/FarmerServicesGrid';
import MachinerySection from '@/components/v2/MachinerySection';
import CropMarketplaceSection from '@/components/v2/CropMarketplaceSection';
import StorageSection from '@/components/v2/StorageSection';
import ShopSection from '@/components/v2/ShopSection';
import FarmLandSection from '@/components/v2/FarmLandSection';
import ServicesSection from '@/components/v2/ServicesSection';
import WaterEnergySection from '@/components/v2/WaterEnergySection';
import ToolboxSection from '@/components/v2/ToolboxSection';
import Footer from '@/components/v2/Footer';
import CTABanner from '@/components/v2/CTABanner';
import TestimonialsSection from '@/components/v2/TestimonialsSection';
import FeaturedVideosSection from '@/components/v2/FeaturedVideosSection';
import './globals-v2.css';

export const metadata = {
    title: 'Miraitu — The Future of Smart Farming',
    description: 'Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers across India.',
};

export default function V2Page() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <Header />
            <main className="flex-1 w-full flex flex-col overflow-x-hidden">
                <HeroSection />
                <QuickServices />
                <FinanceBanner />
                <FPOBanner />
                <FarmerServicesGrid />
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
