import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Become a Seller – Join Miraitu as a Dealer or Service Provider',
    description: 'Register as a seller, dealer, or service provider on Miraitu. Reach thousands of farmers and grow your agricultural business across India.',
    alternates: {
        canonical: 'https://miraitu.in/home/become-seller',
    },
    openGraph: {
        title: 'Become a Seller on Miraitu',
        description: 'Join India\'s leading agriculture platform as a seller, dealer, or service provider.',
        url: 'https://miraitu.in/home/become-seller',
    },
};

export default function BecomeSellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
