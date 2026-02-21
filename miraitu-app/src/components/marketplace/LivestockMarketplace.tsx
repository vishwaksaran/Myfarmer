'use client';

import { useState, useEffect } from 'react';

type LivestockSubcategory = 'All' | 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Poultry';

interface FilterState {
    location: string;
    nearbyOnly: boolean;
    radius: number;
    priceRange: { min: number; max: number };
    searchQuery: string;
    subcategory: LivestockSubcategory;
}

interface Product {
    id: number;
    name: string;
    image: string;
    price: string;
    priceValue: number;
    category: string;
    subcategory?: LivestockSubcategory;
    location: string;
    distance: string;
    description: string;
    badge?: string;
    badgeColor?: string;
    specs?: Record<string, string>;
}

interface LivestockMarketplaceProps {
    categoryFilter?: string; // Only show products from this category
}

export default function LivestockMarketplace({ categoryFilter = 'Livestock' }: LivestockMarketplaceProps) {
    const [filters, setFilters] = useState<FilterState>({
        location: 'Pune, MH',
        nearbyOnly: true,
        radius: 50,
        priceRange: { min: 0, max: 10000000 },
        searchQuery: '',
        subcategory: 'All',
    });

    const [sortBy, setSortBy] = useState('recommended');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const subcategories: { id: LivestockSubcategory; label: string; emoji: string }[] = [
        { id: 'All', label: 'All', emoji: '🌾' },
        { id: 'Cow', label: 'Cow', emoji: '🐄' },
        { id: 'Buffalo', label: 'Buffalo', emoji: '🐃' },
        { id: 'Goat', label: 'Goat', emoji: '🐐' },
        { id: 'Sheep', label: 'Sheep', emoji: '🐑' },
        { id: 'Poultry', label: 'Poultry', emoji: '🐔' },
    ];

    // All products
    const allProducts: Product[] = [
        {
            id: 1,
            name: 'Mahindra 575 DI Tractor',
            image: 'https://images.unsplash.com/photo-1592805723127-004b174a1d03?w=400&h=300&fit=crop',
            price: '₹5,50,000',
            priceValue: 550000,
            category: 'Machinery',
            location: 'Nasik, MH',
            distance: '12 km away',
            description: '2019 Model, excellent condition with attachment included.',
            badge: 'PREMIUM',
            badgeColor: 'bg-amber-500',
            specs: { hp: '47 HP', lift: '1800 kg', fuel: '60 Litres', warranty: '8F + 4R', years: '5 Years' }
        },
        {
            id: 2,
            name: 'Holstein Friesian Cow',
            image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
            price: '₹45,000',
            priceValue: 45000,
            category: 'Livestock',
            subcategory: 'Cow',
            location: 'Satara, MH',
            distance: '4.8 km away',
            description: 'High milk yield capacity, 3 years old, healthy and vaccinated.',
            badge: 'NEW',
            badgeColor: 'bg-lime-500',
        },
        {
            id: 3,
            name: 'Organic Wheat Seeds',
            image: 'https://images.pexels.com/photos/11870839/pexels-photo-11870839.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            price: '₹3,200',
            priceValue: 3200,
            category: 'Crops & Seeds',
            location: 'Nagpur, MH',
            distance: '40 km away',
            description: 'Certified organic Lokwan wheat seeds. Best germination rate.',
            badge: 'LIMITED STOCK',
            badgeColor: 'bg-orange-500',
        },
        {
            id: 4,
            name: 'Agri-Spray Drone V2',
            image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop',
            price: '₹4,20,000',
            priceValue: 420000,
            category: 'Machinery',
            location: 'Pune, MH',
            distance: '8 km away',
            description: '10L tank capacity, automated flight path, includes 2 batteries.',
            badge: 'BULK DEAL',
            badgeColor: 'bg-purple-600',
        },
        {
            id: 5,
            name: 'NPK 19:19:19 Fertilizer',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
            price: '₹1,200',
            priceValue: 1200,
            category: 'Fertilizers',
            location: 'Nashik, MH',
            distance: '15 km away',
            description: 'Water soluble fertilizer for all crops. Minimum order 10 bags.',
            badge: 'PER BAG (50KG)',
            badgeColor: 'bg-green-600',
        },
        {
            id: 6,
            name: 'Claas Combine Harvester',
            image: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?w=400&h=300&fit=crop',
            price: '₹2,500',
            priceValue: 2500,
            category: 'Machinery',
            location: 'Solapur, MH',
            distance: '25 km away',
            description: 'Available for rental in Oct-Nov season. Driver included.',
            badge: 'RENTAL',
            badgeColor: 'bg-orange-500',
        },
        {
            id: 7,
            name: 'John Deere 5055E',
            image: 'https://images.unsplash.com/photo-1589771145485-d2e7e9b9de35?w=400&h=300&fit=crop',
            price: '₹6,20,000',
            priceValue: 620000,
            category: 'Machinery',
            location: 'Pune, MH',
            distance: '10 km away',
            description: 'Latest model with advanced features.',
            specs: { hp: '55 HP', lift: '2100 kg', fuel: '65 Litres', warranty: '12F + 3R', years: '6 Years' }
        },
        {
            id: 8,
            name: 'Sahiwal Bull',
            image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
            price: '₹65,000',
            priceValue: 65000,
            category: 'Livestock',
            subcategory: 'Cow',
            location: 'Satara, MH',
            distance: '6 km away',
            description: 'Strong breeding bull, excellent lineage, 4 years old.',
        },
        {
            id: 9,
            name: 'Murrah Buffalo',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP9XsbxcXU-LW6s0ui96SUbvZ5gsWjz9pAEZ_bYQXN-tdptYt62s8Wp6vEaKUz4SSUKt6KTWL3I3ASUjJOg-i7XctgNcNsfCJrVfauFq685ka6lQW2qTQjfKpjWN8cwTT2mJga-41DrZH4TwpCGIpygcXAOCsnV5slpKb8f1KyBWpWIEObDT6AxWsRAwcogrrBwlYE_E6NvHYTM6yI_7aPZw2mHnUj6OmIHn91VgCSuPW_zRWV-oIABDHKzg3goonUfYRyNMssQNle',
            price: '₹1,20,000',
            priceValue: 120000,
            category: 'Livestock',
            subcategory: 'Buffalo',
            location: 'Moga, Punjab',
            distance: '15 km away',
            description: 'Premium milk buffalo, excellent health.',
        },
        {
            id: 10,
            name: 'Beetal Goat',
            image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
            price: '₹15,000',
            priceValue: 15000,
            category: 'Livestock',
            subcategory: 'Goat',
            location: 'Nashik, MH',
            distance: '8 km away',
            description: 'Healthy breeding goat, 2 years old.',
        },
        {
            id: 11,
            name: 'Merino Sheep',
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
            price: '₹8,500',
            priceValue: 8500,
            category: 'Livestock',
            subcategory: 'Sheep',
            location: 'Satara, MH',
            distance: '12 km away',
            description: 'Quality wool sheep, excellent breed.',
        },
        {
            id: 12,
            name: 'Country Chicken',
            image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
            price: '₹450',
            priceValue: 450,
            category: 'Livestock',
            subcategory: 'Poultry',
            location: 'Pune, MH',
            distance: '5 km away',
            description: 'Desi chicken, organic raised.',
        },
    ];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.searchQuery]);

    // Filter products by category from prop first
    const categoryProducts = allProducts.filter(p => p.category === categoryFilter);

    // Then filter by subcategory, price, and search
    const filteredProducts = categoryProducts.filter(product => {
        // Subcategory filter (only for livestock)
        if (categoryFilter === 'Livestock' && filters.subcategory !== 'All') {
            if (product.subcategory !== filters.subcategory) {
                return false;
            }
        }

        // Price filter
        if (product.priceValue < filters.priceRange.min || product.priceValue > filters.priceRange.max) {
            return false;
        }

        // Search filter
        if (debouncedSearch && !product.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
            return false;
        }

        return true;
    });

    const handleComparisonToggle = (productId: number) => {
        setSelectedForComparison(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            if (prev.length >= 2) {
                return [prev[1], productId];
            }
            return [...prev, productId];
        });
    };

    const comparisonProducts = allProducts.filter(p => selectedForComparison.includes(p.id));

    // Format price for display
    const formatPrice = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        }
        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(0)}K`;
        }
        return `₹${value}`;
    };

    return (
        <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-6 p-6 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-primary-dark">Filters</h3>
                        <button
                            onClick={() => setFilters({
                                location: 'Pune, MH',
                                nearbyOnly: true,
                                radius: 50,
                                priceRange: { min: 0, max: 10000000 },
                                searchQuery: '',
                                subcategory: 'All',
                            })}
                            className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-primary-dark mb-3">Location</h4>
                        <div className="flex items-center gap-2 text-sm text-soil-dark">
                            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                            <span>{filters.location}</span>
                        </div>
                    </div>

                    {/* Nearby Toggle */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9f6] border border-primary/10">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">near_me</span>
                                <span className="font-bold text-primary-dark text-sm">Nearby Only</span>
                            </div>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, nearbyOnly: !prev.nearbyOnly }))}
                                className={`relative w-12 h-6 rounded-full transition-all ${filters.nearbyOnly ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${filters.nearbyOnly ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}
                                ></div>
                            </button>
                        </div>
                    </div>

                    {/* Radius - Only show if nearby is OFF */}
                    {!filters.nearbyOnly && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-primary-dark mb-3">Radius</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-primary">{filters.radius} km</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={filters.radius}
                                onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                                className="w-full h-2 bg-[#e0e5df] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                            />
                        </div>
                    )}

                    {/* Price Range */}
                    <div>
                        <h4 className="text-sm font-bold text-primary-dark mb-3">Price Range</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-primary">{formatPrice(filters.priceRange.max)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10000000"
                            step="50000"
                            value={filters.priceRange.max}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceRange: { min: 0, max: Number(e.target.value) } }))}
                            className="w-full h-2 bg-[#e0e5df] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium text-soil-dark">₹0</span>
                            <span className="text-xs font-medium text-soil-dark">₹100L</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Search and Sort */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-soil-dark/60">search</span>
                        <input
                            type="text"
                            placeholder="Search tractors, seeds, or cattle..."
                            value={filters.searchQuery}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#fbfaf9] shadow-[inset_4px_4px_8px_#d4d9ce,inset_-4px_-4px_8px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-6 py-3 pr-10 rounded-xl bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] border border-[#e0e5df]/50 outline-none font-bold text-primary-dark cursor-pointer appearance-none"
                        >
                            <option value="recommended">Sort by: Recommended</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                            expand_more
                        </span>
                    </div>
                </div>

                {/* Livestock Subcategories - Only show for Livestock category */}
                {categoryFilter === 'Livestock' && (
                    <div className="mb-6 flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        {subcategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setFilters(prev => ({ ...prev, subcategory: sub.id }))}
                                className={`flex-shrink-0 flex flex-col items-center justify-center size-20 rounded-3xl bg-[#fbfaf9] border border-white/60 transition-all ${filters.subcategory === sub.id
                                    ? 'bg-[#2c5926]/5 shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] border-[#2c5926]/30'
                                    : 'shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]'
                                    }`}
                            >
                                <div
                                    className="text-3xl mb-1"
                                    style={{
                                        WebkitTextStroke: '0px',
                                        fontVariantEmoji: 'emoji',
                                        paintOrder: 'fill',
                                    }}
                                >
                                    {sub.emoji}
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase ${filters.subcategory === sub.id ? 'text-[#2c5926]' : 'text-[#4a453e]'
                                    }`}>
                                    {sub.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Comparison Bar */}
                {selectedForComparison.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-[#e8eede] border-2 border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">compare</span>
                            <span className="font-bold text-primary-dark">
                                {selectedForComparison.length} item{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {selectedForComparison.length === 2 && (
                                <button
                                    onClick={() => setShowComparison(true)}
                                    className="px-6 py-2 rounded-lg bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                    Compare Now
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedForComparison([])}
                                className="px-4 py-2 rounded-lg bg-white/50 font-bold text-soil-dark hover:bg-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="group rounded-2xl bg-[#fbfaf9] overflow-hidden shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all"
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                {product.badge && (
                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${product.badgeColor} text-white text-xs font-bold shadow-md`}>
                                        {product.badge}
                                    </div>
                                )}
                                {product.category === 'Machinery' && product.specs && (
                                    <button
                                        onClick={() => handleComparisonToggle(product.id)}
                                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${selectedForComparison.includes(product.id)
                                            ? 'bg-primary text-white'
                                            : 'bg-white/90 text-soil-dark hover:bg-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">compare_arrows</span>
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-primary-dark flex-1">{product.name}</h4>
                                </div>
                                <p className="text-sm text-soil-dark mb-3 line-clamp-2">{product.description}</p>

                                <div className="flex items-center gap-2 text-sm text-soil-dark mb-3">
                                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                    <span>{product.location}</span>
                                    <span className="text-xs">• {product.distance}</span>
                                </div>

                                <div className="text-2xl font-black text-primary mb-4">{product.price}</div>

                                {/* Action Button */}
                                <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">lock</span>
                                    Secure Call
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-primary-dark mb-2">No {categoryFilter} products found</h3>
                        <p className="text-soil-dark">Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>

            {/* Comparison Modal */}
            {showComparison && comparisonProducts.length === 2 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#fbfaf9] rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-primary-dark flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">compare</span>
                                Side-by-Side Comparison
                            </h3>
                            <button
                                onClick={() => setShowComparison(false)}
                                className="w-10 h-10 rounded-full bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] flex items-center justify-center transition-all"
                            >
                                <span className="material-symbols-outlined text-soil-dark">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {comparisonProducts.map((product) => (
                                <div key={product.id} className="p-5 rounded-xl bg-white border-2 border-primary/20">
                                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                                    <h4 className="text-lg font-bold text-primary-dark mb-2">{product.name}</h4>
                                    <p className="text-2xl font-black text-primary mb-4">{product.price}</p>

                                    {product.specs && (
                                        <table className="w-full">
                                            <tbody>
                                                <tr className="border-b border-[#e0e5df]">
                                                    <td className="py-2 font-bold text-soil-dark text-sm">Horsepower (HP)</td>
                                                    <td className="py-2 text-right font-bold text-primary">{product.specs.hp}</td>
                                                </tr>
                                                <tr className="border-b border-[#e0e5df]">
                                                    <td className="py-2 font-bold text-soil-dark text-sm">Lift Capacity</td>
                                                    <td className="py-2 text-right font-bold text-primary-dark">{product.specs.lift}</td>
                                                </tr>
                                                <tr className="border-b border-[#e0e5df]">
                                                    <td className="py-2 font-bold text-soil-dark text-sm">Fuel Capacity</td>
                                                    <td className="py-2 text-right font-bold text-primary-dark">{product.specs.fuel}</td>
                                                </tr>
                                                <tr className="border-b border-[#e0e5df]">
                                                    <td className="py-2 font-bold text-soil-dark text-sm">Transmission</td>
                                                    <td className="py-2 text-right font-bold text-primary-dark">{product.specs.warranty}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 font-bold text-soil-dark text-sm">Warranty</td>
                                                    <td className="py-2 text-right font-bold text-primary">{product.specs.years}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowComparison(false);
                                    setSelectedForComparison([]);
                                }}
                                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
