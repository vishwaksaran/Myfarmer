import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Other Livestock – Rabbits, Dogs & More | Miraitu',
    description: 'Buy and sell other livestock including rabbits, dogs, horses, and exotic animals. Connect with breeders and sellers across India.',
    alternates: { canonical: 'https://www.miraitu.in/home/livestock/others' },
    openGraph: {
        title: 'Other Livestock – Rabbits, Dogs & More | Miraitu',
        description: 'Buy and sell other livestock including rabbits, dogs, horses, and exotic animals.',
        url: 'https://www.miraitu.in/home/livestock/others',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function OtherLivestockLayout({ children }: { children: React.ReactNode }) {
    return children;
}
