'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
    {
        name: 'Treatment',
        icon: 'medical_services',
        path: '/v2/veterinary/treatment',
    },
    {
        name: 'Vaccination',
        icon: 'vaccines',
        path: '/v2/veterinary/vaccination',
    },
    {
        name: 'Deworming',
        icon: 'medication',
        path: '/v2/veterinary/deworming',
    },
    {
        name: 'Mastitis Test',
        icon: 'science',
        path: '/v2/veterinary/mastitis-test',
    },
    {
        name: 'Grooming',
        icon: 'content_cut',
        path: '/v2/veterinary/grooming',
    },
    {
        name: 'Nutritional Advice',
        icon: 'nutrition',
        path: '/v2/veterinary/nutritional-advice',
    },
];

export default function VeterinaryNav() {
    const pathname = usePathname();
    const isMainPage = pathname === '/v2/veterinary';

    const isCategoryActive = (categoryPath: string) => {
        if (isMainPage && categoryPath === '/v2/veterinary/treatment') return true;
        return pathname === categoryPath || pathname.startsWith(categoryPath + '/');
    };

    return (
        <nav className="bg-white dark:bg-[#1a231a] border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-[60]">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="flex items-center gap-2 py-3">
                    {/* Category Links */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.path}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all text-sm shrink-0 ${isCategoryActive(category.path)
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{category.icon}</span>
                                <span className="hidden md:inline">{category.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Book Appointment Button */}
                    <div className="shrink-0 ml-2">
                        <Link
                            href="/v2/veterinary/book"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                            <span className="material-symbols-outlined">calendar_add_on</span>
                            <span className="hidden sm:inline">Book Appointment</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
