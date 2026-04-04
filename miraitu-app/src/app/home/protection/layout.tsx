import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Crop Protection – Pest Control & Plant Health Solutions',
    description: 'Protect your crops with professional pest control, plant disease management, and crop protection services on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/protection',
    },
    openGraph: {
        title: 'Crop Protection Services',
        description: 'Professional pest control and crop protection solutions for farmers.',
        url: 'https://www.miraitu.in/home/protection',
    },
};

export default function ProtectionLayout({
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
        </div>
    );
}
