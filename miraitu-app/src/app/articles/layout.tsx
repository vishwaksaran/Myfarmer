import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import BottomNav from '@/components/v2/BottomNav';
import FloatingActionButtons from '@/components/FloatingActionButtons';
import { CartProvider } from '@/context/CartContext';
import '../home/globals-v2.css';

/**
 * Site chrome for the guides section.
 *
 * CartProvider is required because Header calls useCart. Pages under /home get
 * it from src/app/home/layout.tsx, but /articles is a sibling of /home and
 * inherits nothing from it — so the provider, the bottom nav and the floating
 * actions are all repeated here to match the rest of the app.
 *
 * Metadata is set per page rather than here: each article needs its own title,
 * description and canonical URL.
 */
export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <div className="min-h-screen bg-[#f8f9f7] pb-20 md:pb-0">
                <Header />
                <main className="relative z-10 py-8">{children}</main>
                <Footer />
            </div>
            <FloatingActionButtons />
            <BottomNav />
        </CartProvider>
    );
}
