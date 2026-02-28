import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Smart Farm Toolbox – Soil Testing, Weather & Calculators',
    description: 'Smart farming tools including soil testing, weather forecasts, crop calculators, and agricultural planning utilities on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/toolbox',
    },
    openGraph: {
        title: 'Farm Toolbox – Smart Testing & Planning Tools',
        description: 'Access smart farming tools for soil testing, weather, and crop planning.',
        url: 'https://miraitu.in/home/toolbox',
    },
};

export default function ToolboxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
