import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farmer Community – Connect, Learn & Share with Farmers',
    description: 'Join India\'s largest farmer community. Share farming knowledge, get advice, connect with fellow farmers, and stay updated with agricultural news on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/community',
    },
    openGraph: {
        title: 'Farmer Community – Connect & Learn',
        description: 'Join India\'s largest farmer community on Miraitu.',
        url: 'https://miraitu.in/home/community',
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
