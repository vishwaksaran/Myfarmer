import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import '../globals-v2.css';

export default function ToolboxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            {/* Sticky header wrapper */}
            <div className="sticky top-0 z-50 [&>header]:static [&>header]:z-auto overflow-visible">
                <Header />
            </div>
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
