import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import QuickServices from '@/components/v2/QuickServices';
import LivestockMarketplace from '@/components/v2/LivestockMarketplace';
import FPOBanner from '@/components/v2/FPOBanner';
import MachinerySection from '@/components/v2/MachinerySection';
import ServicesSection from '@/components/v2/ServicesSection';
import WaterEnergySection from '@/components/v2/WaterEnergySection';
import ToolboxSection from '@/components/v2/ToolboxSection';
import Footer from '@/components/v2/Footer';
import CTABanner from '@/components/v2/CTABanner';
import TestimonialsSection from '@/components/v2/TestimonialsSection';
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
                <FPOBanner />
                <LivestockMarketplace />
                <CTABanner />
                <MachinerySection />
                <ServicesSection />
                <WaterEnergySection />
                <TestimonialsSection />
                <ToolboxSection />
                <Footer />
            </main>
        </div>
    );
}
