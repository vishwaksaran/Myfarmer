'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import { useLanguage } from '@/i18n/LanguageContext';
import { LangCode } from '@/i18n/translations';
import { useCart } from '@/context/CartContext';
import HeaderAuthSection from './HeaderAuthSection';


// Searchable items across the entire app
const searchableItems = [
    { name: 'About Us', path: '/home/about', icon: 'info', keywords: ['about', 'company', 'team', 'miraitu', 'who we are'] },
    { name: 'Machinery', path: '/home/machinery', icon: 'agriculture', keywords: ['machinery', 'tractor', 'equipment', 'farm machines'] },
    { name: 'Tractors', path: '/home/machinery', icon: 'agriculture', keywords: ['tractor', 'mahindra', 'john deere', 'kubota', 'swaraj'] },
    { name: 'JCB & Excavators', path: '/home/machinery', icon: 'construction', keywords: ['jcb', 'excavator', 'earthmover', 'backhoe'] },
    { name: 'Harvesters', path: '/home/machinery', icon: 'agriculture', keywords: ['harvester', 'combine harvester', 'crop harvesting'] },
    { name: 'Agri Drones', path: '/home/machinery', icon: 'flight', keywords: ['drone', 'agri drone', 'spraying drone', 'dji'] },
    { name: 'Crops', path: '/home/crops', icon: 'grass', keywords: ['crops', 'wheat', 'rice', 'paddy', 'sugarcane', 'cotton', 'maize'] },
    { name: 'Livestock', path: '/home/livestock', icon: 'pets', keywords: ['livestock', 'cattle', 'cow', 'buffalo', 'goat', 'sheep', 'poultry', 'animal'] },
    { name: 'Finance & Loans', path: '/home/finance', icon: 'account_balance', keywords: ['finance', 'loan', 'kisan credit', 'subsidy', 'insurance', 'pm kisan'] },
    { name: 'Shop', path: '/home/shop', icon: 'shopping_bag', keywords: ['shop', 'store', 'buy', 'organic', 'fertilizer', 'pesticide', 'seeds'] },
    { name: 'Organic Products', path: '/home/organic-store', icon: 'eco', keywords: ['organic', 'natural', 'chemical free', 'organic store'] },
    { name: 'Fertilizers', path: '/home/shop', icon: 'science', keywords: ['fertilizer', 'urea', 'dap', 'npk', 'manure'] },
    { name: 'Pesticides', path: '/home/shop', icon: 'bug_report', keywords: ['pesticide', 'insecticide', 'herbicide', 'fungicide', 'crop protection'] },
    { name: 'Seeds', path: '/home/shop', icon: 'spa', keywords: ['seeds', 'hybrid seeds', 'seed variety', 'sowing'] },
    { name: 'Veterinary', path: '/home/veterinary', icon: 'vaccines', keywords: ['veterinary', 'vet', 'animal doctor', 'vaccination', 'animal health'] },
    { name: 'Land', path: '/home/land', icon: 'landscape', keywords: ['land', 'farm land', 'plot', 'agriculture land', 'buy land', 'sell land'] },
    { name: 'Farm Services', path: '/home/services', icon: 'home_repair_service', keywords: ['services', 'labour', 'borewell', 'fencing', 'cctv', 'solar'] },
    { name: 'Borewell Services', path: '/home/borewell', icon: 'water_drop', keywords: ['borewell', 'borewell drilling', 'water', 'tubewell'] },
    { name: 'Fencing', path: '/home/fencing', icon: 'fence', keywords: ['fencing', 'farm fencing', 'barbed wire', 'chain link'] },
    { name: 'CCTV & Security', path: '/home/cctv', icon: 'videocam', keywords: ['cctv', 'camera', 'security', 'surveillance', 'farm security'] },
    { name: 'Crop Protection', path: '/home/protection', icon: 'shield', keywords: ['protection', 'crop protection', 'pest control', 'disease'] },
    { name: 'Agri Calculators', path: '/home/toolbox', icon: 'calculate', keywords: ['agri calculators', 'tools', 'calculator', 'weather', 'mandi prices'] },
    { name: 'Community', path: '/home/community', icon: 'groups', keywords: ['community', 'farmer forum', 'discussion', 'help', 'connect'] },
    { name: 'Become a Seller', path: '/home/become-seller', icon: 'storefront', keywords: ['seller', 'dealer', 'sell', 'register as seller', 'become dealer'] },
    { name: 'Settings', path: '/home/settings', icon: 'settings', keywords: ['settings', 'profile', 'notification', 'language', 'account'] },
    { name: 'Dashboard', path: '/home/dashboard', icon: 'dashboard', keywords: ['dashboard', 'bookings', 'my bookings', 'orders', 'status'] },
    { name: 'Provider Dashboard', path: '/home/provider-dashboard', icon: 'engineering', keywords: ['provider', 'service provider', 'provider dashboard', 'earnings', 'jobs'] },
    { name: 'Weather', path: '/home/toolbox', icon: 'cloud', keywords: ['weather', 'forecast', 'rain', 'temperature', 'humidity'] },
    { name: 'Mandi Prices', path: '/home/toolbox', icon: 'trending_up', keywords: ['mandi', 'market price', 'mandi price', 'apmc', 'crop price'] },
    { name: 'Cart & Checkout', path: '/home/shop/checkout', icon: 'shopping_cart', keywords: ['cart', 'checkout', 'order', 'payment'] },
    { name: 'Wishlist', path: '/home/shop/wishlist', icon: 'favorite', keywords: ['wishlist', 'saved products', 'liked products', 'favorites'] },
];

const primaryNavItems = [
    { tKey: 'nav.about', path: '/home/about', icon: 'info' },
    { tKey: 'nav.machinery', path: '/home/machinery', icon: 'agriculture' },
    { tKey: 'nav.crops', path: '/home/crops', icon: 'grass' },
    { tKey: 'nav.livestock', path: '/home/livestock', icon: 'pets' },
    { tKey: 'nav.finance', path: '/home/finance', icon: 'account_balance' },
    { tKey: 'nav.shop', path: '/home/shop', icon: 'shopping_bag' },
];

const moreNavItems = [
    { tKey: 'nav.veterinary', path: '/home/veterinary', icon: 'vaccines' },
    { tKey: 'nav.land', path: '/home/land', icon: 'landscape' },
    { tKey: 'nav.services', path: '/home/services', icon: 'home_repair_service' },
    { tKey: 'nav.toolbox', path: '/home/toolbox', icon: 'calculate' },
    { tKey: 'nav.community', path: '/home/community', icon: 'groups' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { lang, setLang, t } = useLanguage();
    const { totalItems } = useCart();

    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState<LangCode>(lang);
    // Sync selectedLang when context lang changes (e.g., restored from localStorage)
    useEffect(() => { setSelectedLang(lang); }, [lang]);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const moreMenuRef = useRef<HTMLDivElement>(null);


    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof searchableItems>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setActiveResultIndex(-1);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            setDebouncedQuery(value);
        }, 300);
    }, []);

    // Filter results when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length === 0) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const query = debouncedQuery.toLowerCase().trim();
        const matched = searchableItems.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(query);
            const keywordMatch = item.keywords.some(kw => kw.includes(query));
            return nameMatch || keywordMatch;
        });

        // Deduplicate by path + name
        const seen = new Set<string>();
        const unique = matched.filter(item => {
            const key = `${item.path}|${item.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        setSearchResults(unique.slice(0, 8));
        setShowSearchResults(true);
    }, [debouncedQuery]);

    // Close search results when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                searchRef.current && !searchRef.current.contains(target) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(target)
            ) {
                setShowSearchResults(false);
            } else if (searchRef.current && !searchRef.current.contains(target) && !mobileSearchRef.current) {
                setShowSearchResults(false);
            } else if (!searchRef.current && mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
                setShowSearchResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation in search results
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (!showSearchResults || searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveResultIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveResultIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Enter' && activeResultIndex >= 0) {
            e.preventDefault();
            const selected = searchResults[activeResultIndex];
            router.push(selected.path);
            setSearchQuery('');
            setDebouncedQuery('');
            setShowSearchResults(false);
        } else if (e.key === 'Escape') {
            setShowSearchResults(false);
        }
    };

    const handleResultClick = (path: string) => {
        router.push(path);
        setSearchQuery('');
        setDebouncedQuery('');
        setShowSearchResults(false);
    };

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const allLanguages: { name: string; sub: string; code: LangCode }[] = [
        { name: 'English', sub: 'ENGLISH', code: 'en' },
        { name: 'हिंदी', sub: 'HINDI', code: 'hi' },
        { name: 'मराठी', sub: 'MARATHI', code: 'mr' },
        { name: 'ગુજરાતી', sub: 'GUJARATI', code: 'gu' },
        { name: 'తెలుగు', sub: 'TELUGU', code: 'te' },
        { name: 'தமிழ்', sub: 'TAMIL', code: 'ta' },
        { name: 'ಕನ್ನಡ', sub: 'KANNADA', code: 'kn' },
        { name: 'ਪੰਜਾਬੀ', sub: 'PUNJABI', code: 'pa' },
        { name: 'বাংলা', sub: 'BENGALI', code: 'bn' },
        { name: 'മലയാളം', sub: 'MALAYALAM', code: 'ml' },
    ];

    // Close more menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll direction detection — hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (isMobileMenuOpen) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobileMenuOpen]);

    // Force header visible when mobile menu opens
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsHeaderVisible(true);
        }
    }, [isMobileMenuOpen]);

    // Lock body scroll when mobile menu or language modal is open
    useEffect(() => {
        if (isMobileMenuOpen || isLanguageModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen, isLanguageModalOpen]);

    const saveLanguageSelection = () => {
        setLang(selectedLang);
        setIsLanguageModalOpen(false);
    };

    const isActive = (path: string) => pathname.startsWith(path);

    // Check if any "more" item is active
    const isMoreActive = moreNavItems.some(item => isActive(item.path)) || isActive('/home/services/fpo');

    return (
        <>
            <header className={`sticky top-0 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'z-[70]' : 'z-50'} ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} overflow-visible`}>
                <div className="mx-auto max-w-[1400px] px-4 py-3 overflow-visible">
                    {/* Main Header Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <MiraituLogo size={36} />
                            <h2 className="text-xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={searchRef} onClick={(e) => e.stopPropagation()}>
                            <div className="skeuo-inset flex h-10 w-full items-center rounded-xl bg-[#ebf0ea] dark:bg-[#222d21] px-4">
                                <span className="material-symbols-outlined text-primary/60 text-lg">search</span>
                                <input
                                    className="w-full border-none bg-transparent px-3 text-sm focus:ring-0 placeholder:text-gray-500 outline-none"
                                    placeholder={t('header.search')}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    onFocus={() => { if (debouncedQuery.trim()) setShowSearchResults(true); }}
                                />
                                {searchQuery && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSearchQuery(''); setDebouncedQuery(''); setShowSearchResults(false); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>

                            {/* Desktop Search Suggestions */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 min-w-[280px]" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-2">
                                        <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('header.suggestions')}</p>
                                        {searchResults.map((item, index) => (
                                            <button
                                                key={`${item.path}-${item.name}`}
                                                onClick={() => handleResultClick(item.path)}
                                                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${activeResultIndex === index
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary'
                                                    }`}
                                            >
                                                <span className={`material-symbols-outlined text-lg shrink-0 ${activeResultIndex === index ? 'text-primary' : 'text-gray-400'
                                                    }`}>{item.icon}</span>
                                                <span className="flex-1 min-w-0 truncate">{item.name}</span>
                                                <span className="material-symbols-outlined text-sm text-gray-300 shrink-0">arrow_forward</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No results */}
                            {showSearchResults && debouncedQuery.trim() && searchResults.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-6 text-center">
                                        <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">search_off</span>
                                        <p className="text-sm text-gray-500">{t('header.noResults')} &ldquo;{debouncedQuery}&rdquo;</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Menu — Desktop */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {primaryNavItems.map((item) => (
                                <Link
                                    key={item.tKey}
                                    href={item.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${isActive(item.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {t(item.tKey)}
                                </Link>
                            ))}

                            {/* More Menu Button + Dropdown */}
                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                    className={`flex items-center justify-center size-9 rounded-lg transition-all ${isMoreMenuOpen || isMoreActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    aria-label="More categories"
                                >
                                    <span className="material-symbols-outlined text-xl">apps</span>
                                </button>

                                {/* Dropdown */}
                                {isMoreMenuOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                        <div className="p-2">
                                            <p className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('nav.moreCategories')}</p>
                                            {moreNavItems.map((item) => (
                                                <Link
                                                    key={item.tKey}
                                                    href={item.path}
                                                    onClick={() => setIsMoreMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(item.path)
                                                        ? 'text-primary bg-primary/5'
                                                        : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`}>{item.icon}</span>
                                                    {t(item.tKey)}
                                                </Link>
                                            ))}
                                            <Link
                                                href="/home/services/fpo"
                                                onClick={() => setIsMoreMenuOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive('/home/services/fpo')
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                                    }`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${isActive('/home/services/fpo') ? 'text-primary' : 'text-gray-400'}`}>groups</span>
                                                <span className="flex-1">FPO</span>
                                            </Link>
                                        </div>

                                        {/* Become a Dealer/Seller Banner */}
                                        <Link
                                            href="/home/become-seller"
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className="block m-2 mt-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 group hover:from-orange-600 hover:to-amber-600 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-white/20 backdrop-blur-sm shrink-0">
                                                    <span className="material-symbols-outlined text-white text-xl">storefront</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white leading-tight">{t('header.becomeDealer')}</p>
                                                    <p className="text-[11px] text-white/80 font-medium">{t('header.startSelling')}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-white/80 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Download App Buttons */}
                            <div className="hidden xl:flex items-center gap-1.5">
                                <a href="/home/about" className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 transition-colors">
                                    <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.608-2.302 2.608-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                                    <span className="leading-tight">{t('header.playStore')}</span>
                                </a>
                                <a href="/home/about" className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 transition-colors">
                                    <svg className="size-4 fill-white" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                    <span className="leading-tight">{t('header.appStore')}</span>
                                </a>
                            </div>
                            <button
                                onClick={() => setIsLanguageModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl px-2 sm:px-3 py-2 text-sm font-semibold skeuo-card transition-transform hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-primary text-lg">translate</span>
                                <span className="hidden lg:inline">{allLanguages.find(lang => lang.code === selectedLang)?.name || 'English'}</span>
                            </button>

                            {/* Cart Button */}
                            <Link href="/home/shop/checkout" className="relative flex items-center justify-center size-9 sm:size-10 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/10 hover:bg-primary/5 hover:text-primary transition-colors skeuo-card">
                                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            {/* Auth section: dynamically loaded with ssr:false to prevent hydration mismatch */}
                            <HeaderAuthSection />
                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => { if (!isMobileMenuOpen) setIsHeaderVisible(true); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                                className="lg:hidden flex items-center justify-center size-10 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden mt-2 relative" ref={mobileSearchRef} onClick={(e) => e.stopPropagation()}>
                        <div className="skeuo-inset flex h-10 w-full items-center rounded-xl bg-[#ebf0ea] dark:bg-[#222d21] px-4">
                            <span className="material-symbols-outlined text-primary/60 text-lg">search</span>
                            <input
                                className="w-full border-none bg-transparent px-3 text-sm focus:ring-0 placeholder:text-gray-500 outline-none"
                                placeholder={t('header.search')}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => { if (debouncedQuery.trim()) setShowSearchResults(true); }}
                            />
                            {searchQuery && (
                                <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSearchQuery(''); setDebouncedQuery(''); setShowSearchResults(false); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Search Suggestions */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 min-w-[280px]" onClick={(e) => e.stopPropagation()}>
                                <div className="p-2">
                                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('header.suggestions')}</p>
                                    {searchResults.map((item, index) => (
                                        <button
                                            key={`${item.path}-${item.name}`}
                                            onClick={() => handleResultClick(item.path)}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${activeResultIndex === index
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-lg shrink-0 ${activeResultIndex === index ? 'text-primary' : 'text-gray-400'
                                                }`}>{item.icon}</span>
                                            <span className="flex-1 min-w-0 truncate">{item.name}</span>
                                            <span className="material-symbols-outlined text-sm text-gray-300 shrink-0">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results - mobile */}
                        {showSearchResults && debouncedQuery.trim() && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-6 text-center">
                                    <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">search_off</span>
                                    <p className="text-sm text-gray-500">{t('header.noResults')} &ldquo;{debouncedQuery}&rdquo;</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            {/* Mobile Menu — Full-screen Overlay (covers bottom nav & WhatsApp) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-0 z-[60] bg-background-light dark:bg-background-dark overflow-y-auto pt-[140px] pb-8 px-4">
                    <div className="grid grid-cols-2 gap-2">
                        {[...primaryNavItems, ...moreNavItems].map((item) => (
                            <Link
                                key={item.tKey}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(item.path)
                                    ? 'text-primary bg-primary/5'
                                    : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`}>{item.icon}</span>
                                {t(item.tKey)}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile: Become a Dealer/Seller Banner */}
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                        <Link
                            href="/home/become-seller"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 group hover:from-orange-600 hover:to-amber-600 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center size-10 rounded-lg bg-white/20 backdrop-blur-sm shrink-0">
                                    <span className="material-symbols-outlined text-white text-xl">storefront</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white leading-tight">{t('header.becomeDealer')}</p>
                                    <p className="text-[11px] text-white/80 font-medium">{t('header.startSelling')}</p>
                                </div>
                                <span className="material-symbols-outlined text-white/80 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Language Selection Modal */}
            {isLanguageModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" data-no-auth onClick={() => setIsLanguageModalOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                    <div
                        className="relative w-full sm:max-w-2xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border-t-4 border-white max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f0f4ec] opacity-50 pointer-events-none"></div>

                        {/* Scrollable content */}
                        <div className="relative z-10 p-5 sm:p-8 lg:p-10 overflow-y-auto flex-1">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLanguageModalOpen(false)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.8)] flex items-center justify-center text-soil-dark hover:text-red-500 transition-all active:shadow-inner active:scale-95 z-20"
                            >
                                <span className="material-symbols-outlined font-bold text-lg sm:text-xl">close</span>
                            </button>

                            {/* Header */}
                            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                                <div className="size-14 sm:size-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary to-[#4d8f43] shadow-floating flex items-center justify-center text-white mb-4 sm:mb-6">
                                    <span className="material-symbols-outlined text-2xl sm:text-4xl">translate</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-dark tracking-tight">{t('lang.title')}</h2>
                                <p className="text-soil-dark font-medium mt-1 sm:mt-2 text-sm sm:text-base">{t('lang.subtitle')}</p>
                            </div>

                            {/* Language Grid */}
                            <div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
                                    {allLanguages.map((lang) => {
                                        const isSelected = selectedLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => setSelectedLang(lang.code)}
                                                className={`
                                                    relative h-20 sm:h-28 rounded-2xl sm:rounded-[2rem] p-2.5 sm:p-4 flex flex-col items-center justify-center border-2 transition-all
                                                    ${isSelected
                                                        ? 'bg-white border-[#4d8f43] shadow-none'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-transparent shadow-[4px_4px_8px_rgba(166,164,156,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-xl'}
                                                `}
                                            >
                                                <p className="text-lg sm:text-2xl font-extrabold text-primary-dark mb-0.5 sm:mb-1">{lang.name}</p>
                                                <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-soil-dark/50">{lang.sub}</p>

                                                {isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 size-5 sm:size-6 bg-[#4d8f43] rounded-full flex items-center justify-center shadow-md">
                                                        <span className="material-symbols-outlined text-xs sm:text-sm text-white font-black">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Save Button */}
                        <div className="relative z-10 p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
                            <button
                                onClick={saveLanguageSelection}
                                className="w-full sm:w-80 sm:mx-auto h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-[#4d8f43] to-primary text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_5px_0_#1a3617,_0_10px_14px_rgba(44,89,38,0.4)] active:shadow-[0_2px_0_#1a3617,_0_5px_10px_rgba(44,89,38,0.4)] active:translate-y-1 transition-all"
                            >
                                <span className="material-symbols-outlined font-black text-xl sm:text-2xl">done_all</span>
                                {t('lang.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}

