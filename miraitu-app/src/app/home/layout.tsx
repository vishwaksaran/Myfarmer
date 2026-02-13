import FloatingActionButtons from '@/components/FloatingActionButtons';
import { CartProvider } from '@/context/CartContext';
import './globals-v2.css';

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            {children}
            <FloatingActionButtons />
        </CartProvider>
    );
}
