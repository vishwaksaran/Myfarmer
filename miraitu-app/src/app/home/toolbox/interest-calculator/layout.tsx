import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Interest Calculator – Farm Loan EMI & Interest Rates',
    description: 'Calculate loan EMI, interest rates, and repayment schedules for agricultural loans, KCC, and farm financing options on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/interest-calculator' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Farm Loan Interest Calculator',
        description: 'Calculate EMI and interest for agricultural loans.',
        url: 'https://www.miraitu.in/home/toolbox/interest-calculator',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function InterestCalculatorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
