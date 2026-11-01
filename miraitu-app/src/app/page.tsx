import dynamic from 'next/dynamic';
import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import TopCategories from '@/components/v2/TopCategories';
import BuySell from '@/components/v2/BuySell';
import AgriCalculators from '@/components/v2/AgriCalculators';
import ProviderDashboardBanner from '@/components/v2/ProviderDashboardBanner';
import MobileHomeDashboard from '@/components/v2/MobileHomeDashboard';
import { CartProvider } from '@/context/CartContext';
import HomeFAQ from '@/components/v2/HomeFAQ';
import { SITE_URL, jsonLdString } from '@/lib/seo';

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

const TITLE = 'Miraitu – Farming App to Rent Machinery, Sell Crops & Livestock';
const DESCRIPTION =
  'Miraitu helps Indian farmers rent tractors and farm machinery, buy and sell crops, livestock and land, check mandi prices and book farm services.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
};

// Describes the home page itself and marks the FAQ as the part voice
// assistants should read aloud (speakable).
const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: 'en-IN',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['#home-faq .faq-intro', '#home-faq h3', '#home-faq .faq-answer'],
  },
};

export default function HomePage() {
  return (
    <CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPageJsonLd) }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-primary focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full flex flex-col overflow-x-hidden">
          <ProviderDashboardBanner />
          {/* Phones get a working dashboard — greeting, live weather, quick
              actions — instead of the full-viewport marketing hero, which
              pushed everything useful below the fold on a small screen. */}
          <MobileHomeDashboard />
          <div className="hidden md:block">
            <HeroSection />
          </div>
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
          <HomeFAQ />
          <Footer />
        </main>
      </div>
      <FloatingActionButtons />
      <BottomNav />
    </CartProvider>
  );
}
