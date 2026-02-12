import FloatingActionButtons from '@/components/FloatingActionButtons';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import './globals-v2.css';

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <CartProvider>
                {children}
                <FloatingActionButtons />
            </CartProvider>
        </LanguageProvider>
    );
}
