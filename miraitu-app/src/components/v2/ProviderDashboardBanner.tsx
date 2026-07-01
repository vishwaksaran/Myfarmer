'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getCategoryConfig } from '@/lib/provider-config';

/**
 * Slim entry point to the provider workspace, shown on the home page
 * ONLY to signed-in service providers. Renders nothing for everyone else.
 */
export default function ProviderDashboardBanner() {
    const { user, fetchProfile } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchProfile().then(p => {
                setRole(p?.role || null);
                setServiceTypes(p?.service_types || []);
            });
        } else {
            setRole(null);
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    if (role !== 'service_provider') return null;

    const cat = getCategoryConfig(serviceTypes);

    return (
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 mt-4">
            <Link
                href="/home/provider-dashboard"
                className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-emerald-500/5 p-4 md:p-5 hover:border-primary/40 hover:shadow-md transition-all"
            >
                <div className="size-12 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">
                        Your {cat.label} workspace
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                        Manage {cat.jobNounPlural.toLowerCase()}, customers, services &amp; earnings
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 shrink-0 px-3 md:px-4 py-2 rounded-xl bg-primary text-white text-xs md:text-sm font-bold group-hover:brightness-110 transition-all">
                    Open
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </span>
            </Link>
        </div>
    );
}
