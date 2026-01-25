'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MiraituLogo from '@/components/MiraituLogo';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    // Fallback if user is null (though dashboard protects this)
    const userName = user?.displayName || 'Farmer';
    const userPhoto = user?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO';

    const menuItems = [
        { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
        { name: 'Marketplace', icon: 'storefront', href: '#' },
        { name: 'My Farm', icon: 'potted_plant', href: '#' },
        { name: 'Community', icon: 'groups', href: '#' },
    ];

    return (
        <aside className="w-full lg:w-72 flex flex-col justify-between border-r border-[#e0e5df] bg-[#fbfaf9] p-4 lg:p-6 shadow-sm z-20 transition-all duration-300 h-full">
            <div className="flex flex-col gap-8">
                {/* Brand */}
                <div className="flex items-center gap-3 px-2">
                    <div className="size-12 rounded-xl flex items-center justify-center">
                        <MiraituLogo size={48} />
                    </div>
                    <h1 className="hidden lg:block text-2xl font-extrabold tracking-tight text-primary-dark">Miraitu</h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    group relative flex items-center gap-4 rounded-xl p-4 transition-all duration-200
                                    ${isActive
                                        ? 'bg-[#dce8d5] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-primary-dark'
                                        : 'bg-gradient-to-br from-white to-harvest-loam text-soil-dark border-transparent shadow-[6px_6px_12px_rgba(166,164,156,0.4),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:text-primary hover:shadow-xl'}
                                `}
                            >
                                <span
                                    className={`material-symbols-outlined ${isActive ? 'text-primary' : ''}`}
                                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {item.icon}
                                </span>
                                <span className={`hidden lg:block font-bold ${isActive ? 'text-primary-dark' : ''}`}>{item.name}</span>

                                {/* Active Indicator for Mobile/Visual */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary lg:hidden"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4">
                <Link
                    className={`
                        group relative flex items-center gap-4 rounded-xl p-4 transition-all duration-200
                        ${pathname === '/settings'
                            ? 'bg-[#dce8d5] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-primary-dark'
                            : 'bg-gradient-to-br from-white to-harvest-loam text-soil-dark border-transparent shadow-[6px_6px_12px_rgba(166,164,156,0.4),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:shadow-xl'}
                    `}
                    href="/settings"
                >
                    <span
                        className={`material-symbols-outlined ${pathname === '/settings' ? 'text-primary' : ''}`}
                        style={pathname === '/settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        settings
                    </span>
                    <span className={`hidden lg:block font-semibold ${pathname === '/settings' ? 'text-primary-dark' : ''}`}>Settings</span>
                    {pathname === '/settings' && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary lg:hidden"></div>
                    )}
                </Link>

                {/* User Profile */}
                <div className="hidden lg:flex items-center gap-3 rounded-xl border border-[#dce3da] bg-[#f2f4f0] p-3 shadow-sm">
                    <div
                        className="size-10 rounded-full bg-cover bg-center shadow-inner ring-2 ring-white"
                        style={{ backgroundImage: `url('${userPhoto}')` }}
                    ></div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-primary-dark truncate">{userName}</span>
                        <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline flex items-start">Sign Out</button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
