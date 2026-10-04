import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Contact Miraitu – Partnerships, Business & Media Enquiries',
    description: 'Get in touch with Miraitu. Companies, partners, advertisers, media and investors can send us a message and our team will respond.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/contact',
    },
    openGraph: {
        title: 'Contact Miraitu',
        description: 'Partnerships, business, advertising, media and investor enquiries.',
        url: 'https://www.miraitu.in/home/contact',
    },
};

export default function ContactLayout({
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
