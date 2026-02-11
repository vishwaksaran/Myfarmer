import FloatingActionButtons from '@/components/FloatingActionButtons';
import { LanguageProvider } from '@/i18n/LanguageContext';
import './globals-v2.css';

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            {children}
            <FloatingActionButtons />
        </LanguageProvider>
    );
}
