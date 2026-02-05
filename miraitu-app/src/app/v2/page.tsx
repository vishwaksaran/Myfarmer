import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import QuickServices from '@/components/v2/QuickServices';
import LivestockMarketplace from '@/components/v2/LivestockMarketplace';
import MachinerySection from '@/components/v2/MachinerySection';
import ServicesSection from '@/components/v2/ServicesSection';
import WaterEnergySection from '@/components/v2/WaterEnergySection';
import ToolboxSection from '@/components/v2/ToolboxSection';
import Footer from '@/components/v2/Footer';
import './globals-v2.css';

export const metadata = {
    title: 'Master Miraitu Ecosystem Hub',
    description: 'Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers.',
};

export default function V2Page() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <Header />
            <HeroSection />
            <QuickServices />
            <LivestockMarketplace />
            <MachinerySection />
            <ServicesSection />
            <WaterEnergySection />
            <ToolboxSection />
            <Footer />
        </div>
    );
}
