import CropsNav from '@/components/v2/crops/CropsNav';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export default function CropsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            {/* Sticky header wrapper containing both Header and CropsNav */}
            <div className="sticky top-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
                <CropsNav />
            </div>
            <main className="py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
