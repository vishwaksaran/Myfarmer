import FloatingActionButtons from '@/components/FloatingActionButtons';
import BottomNav from '@/components/v2/BottomNav';
import { CartProvider } from '@/context/CartContext';
import './globals-v2.css';

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <div className="pb-20 md:pb-0">
                {children}
            </div>
            <FloatingActionButtons />
            <BottomNav />
        </CartProvider>
    );
}
