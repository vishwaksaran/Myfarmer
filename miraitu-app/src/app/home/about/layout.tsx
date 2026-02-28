import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'About Miraitu – Our Mission to Empower Indian Farmers',
    description: 'Learn about Miraitu, India\'s agriculture super app. Our vision, mission, leadership team, and how we\'re transforming farming through technology and innovation.',
    alternates: {
        canonical: 'https://miraitu.in/home/about',
    },
    openGraph: {
        title: 'About Miraitu – Empowering Indian Farmers',
        description: 'Discover the team and mission behind India\'s leading agriculture super app.',
        url: 'https://miraitu.in/home/about',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <main className="py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
