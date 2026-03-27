'use client';

import Link from 'next/link';

const popularBrands = [
    { name: 'Mahindra', slug: 'mahindra' },
    { name: 'John Deere', slug: 'john-deere' },
    { name: 'Sonalika', slug: 'sonalika' },
    { name: 'Swaraj', slug: 'swaraj' },
    { name: 'Kubota', slug: 'kubota' },
    { name: 'Eicher', slug: 'eicher' },
    { name: 'New Holland', slug: 'new-holland' },
    { name: 'Massey Ferguson', slug: 'massey-ferguson' },
    { name: 'Farmtrac', slug: 'farmtrac' },
    { name: 'Powertrac', slug: 'powertrac' },
];

const popularTractors = [
    { name: 'Swaraj 855 FE', slug: 'swaraj-855-fe' },
    { name: 'New Holland 3630', slug: 'new-holland-3630-tx-plus' },
    { name: 'Swaraj 744 XT', slug: 'swaraj-744-xt' },
    { name: 'Mahindra 575 DI XP Plus', slug: 'mahindra-575-di-xp-plus' },
    { name: 'Farmtrac 60 Powermaxx', slug: 'farmtrac-60-powermaxx' },
    { name: 'Swaraj 735 FE', slug: 'swaraj-735-fe' },
    { name: 'Farmtrac 45 Ultramaxx', slug: 'farmtrac-45-ultramaxx' },
    { name: 'John Deere 5050 D', slug: 'john-deere-5050-d' },
    { name: 'Sonalika DI 35', slug: 'sonalika-di-35' },
    { name: 'Eicher 380', slug: 'eicher-380' },
];

const quickLinks = [
    { name: 'New Tractors', href: '/home/machinery/tractors' },
    { name: 'Compare Tractors', href: '/home/machinery/tractors/compare' },
    { name: 'Mini Tractors', href: '/home/machinery/tractors' },
    { name: 'Used Tractors', href: '/home/machinery/tractors' },
    { name: 'Tractor Implements', href: '/home/machinery' },
    { name: 'Sell Your Tractor', href: '/home/machinery' },
];

const importantLinks = [
    { name: 'About Us', href: '/home/about' },
    { name: 'Contact Us', href: '/home/about' },
    { name: 'Privacy Policy', href: '/home/privacy-policy' },
    { name: 'Terms & Conditions', href: '/home/about' },
    { name: 'Sitemap', href: '/sitemap.xml' },
];

export default function TractorFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-8">
            {/* Social bar */}
            <div className="border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">Follow Miraitu</span>
                    <div className="flex gap-3">
                        {[
                            { label: 'Facebook', href: 'https://www.facebook.com/share/17xh4f5AUZ/', icon: 'M24 12.07c0-6.63-5.37-12-12-12S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z' },
                            { label: 'Instagram', href: 'https://www.instagram.com/miraituapp', icon: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.65 2.16 15.27 2.16 12.07c0-3.2.01-3.58.07-4.85C2.38 4 3.87 2.46 7.15 2.23 8.41 2.17 8.8 2.16 12 2.16zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z' },
                            { label: 'YouTube', href: 'https://www.youtube.com/@Miraitu', icon: 'M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z' },
                            { label: 'X', href: 'https://x.com/Miraitu', icon: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23zM17.08 19.77h1.83L7.08 4.13H5.12z' },
                        ].map((s) => (
                            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main footer grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Quick Links */}
                    <div>
                        <h3 className="text-white text-sm font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {importantLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Popular Brands */}
                    <div>
                        <h3 className="text-white text-sm font-bold mb-4">Popular Brands</h3>
                        <ul className="space-y-2">
                            {popularBrands.map((brand) => (
                                <li key={brand.slug}>
                                    <Link href={`/home/machinery/tractors/brand/${brand.slug}`} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                        {brand.name} Tractors
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Popular Tractors */}
                    <div>
                        <h3 className="text-white text-sm font-bold mb-4">Popular Tractors</h3>
                        <ul className="space-y-2">
                            {popularTractors.map((t) => (
                                <li key={t.slug}>
                                    <Link href={`/home/machinery/tractors/${t.slug}`} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                        {t.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Browse by */}
                    <div>
                        <h3 className="text-white text-sm font-bold mb-4">Browse By</h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'Mini Tractors (Below 30 HP)', href: '/home/machinery/tractors' },
                                { name: '4WD Tractors', href: '/home/machinery/tractors' },
                                { name: 'Tractors Under ₹5 Lakh', href: '/home/machinery/tractors' },
                                { name: 'Tractors 31-50 HP', href: '/home/machinery/tractors' },
                                { name: 'Tractors 51-75 HP', href: '/home/machinery/tractors' },
                                { name: 'Electric Tractors', href: '/home/machinery/tractors' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-white text-sm font-bold mt-6 mb-4">Contact</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Miraitu Agritech Pvt Ltd<br />
                            Tamil Nadu, India<br />
                            <a href="mailto:support@miraitu.in" className="hover:text-emerald-400 transition-colors">support@miraitu.in</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Miraitu. All Rights Reserved.
                    </p>
                    <p className="text-[10px] text-gray-600 text-center sm:text-right max-w-lg">
                        Prices shown are ex-showroom and may vary by state and dealer. Images are for representation only.
                    </p>
                </div>
            </div>
        </footer>
    );
}
