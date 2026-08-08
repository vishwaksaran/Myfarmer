import dynamic from 'next/dynamic';
import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import TopCategories from '@/components/v2/TopCategories';
import BuySell from '@/components/v2/BuySell';
import AgriCalculators from '@/components/v2/AgriCalculators';
import ProviderDashboardBanner from '@/components/v2/ProviderDashboardBanner';
import { CartProvider } from '@/context/CartContext';

// Below-the-fold sections loaded lazily — reduces initial compile & JS bundle
const FarmerServicesGrid = dynamic(() => import('@/components/v2/FarmerServicesGrid'));
const FPOBanner = dynamic(() => import('@/components/v2/FPOBanner'));
const CTABanner = dynamic(() => import('@/components/v2/CTABanner'));
// Temporarily hidden from the home page — the components and their routes are
// untouched. Restore by uncommenting the import and the tag in the layout below.
// const FinanceBanner = dynamic(() => import('@/components/v2/FinanceBanner'));
// const ShopSection = dynamic(() => import('@/components/v2/ShopSection'));
const TestimonialsSection = dynamic(() => import('@/components/v2/TestimonialsSection'));
// const FeaturedVideosSection = dynamic(() => import('@/components/v2/FeaturedVideosSection'));
const Footer = dynamic(() => import('@/components/v2/Footer'));
const FloatingActionButtons = dynamic(() => import('@/components/FloatingActionButtons'));
const BottomNav = dynamic(() => import('@/components/v2/BottomNav'));
import './home/globals-v2.css';

export const metadata = {
  title: 'Miraitu — The Future of Smart Farming',
  description: 'Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers across India.',
  alternates: {
    canonical: 'https://www.miraitu.in',
  },
};

export default function HomePage() {
  return (
    <CartProvider>
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
        <Header />
        <main className="flex-1 w-full flex flex-col overflow-x-hidden">
          <ProviderDashboardBanner />
          <HeroSection />
          <TopCategories />
          <BuySell />
          <AgriCalculators />
          <FarmerServicesGrid />
          <CTABanner />
          {/* <FinanceBanner /> — temporarily hidden */}
          <FPOBanner />
          {/* <ShopSection /> — temporarily hidden */}
          <TestimonialsSection />
          {/* <FeaturedVideosSection /> — "Watch Farmer Stories" temporarily hidden */}
          <Footer />
        </main>
      </div>
      <FloatingActionButtons />
      <BottomNav />
    </CartProvider>
  );
}
