import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { absoluteUrl, jsonLdString, SITE_URL } from '@/lib/seo';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'About Miraitu – Our Mission to Empower Indian Farmers',
    description: 'Learn about Miraitu, India\'s agriculture super app. Our vision, mission, leadership team, and how we\'re transforming farming through technology and innovation.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/about',
    },
    openGraph: {
        title: 'About Miraitu – Empowering Indian Farmers',
        description: 'Discover the team and mission behind India\'s leading agriculture super app.',
        url: 'https://www.miraitu.in/home/about',
    },
};

// Ties this page to the Organization entity (address, phone, email) declared in the root layout.
const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Miraitu',
    url: absoluteUrl('/home/about'),
    about: { '@id': `${SITE_URL}/#organization` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(pageJsonLd) }} />
            <Header />
            <main className="py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
