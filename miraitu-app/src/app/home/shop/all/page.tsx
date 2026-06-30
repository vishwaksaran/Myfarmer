'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { shopCategories } from '../data';
import { categoryProducts, categoryMeta } from '../categoryData';
import { useShopWishlist } from '@/lib/use-shop-wishlist';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'rating';

export default function AllProductsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { quantities, addItem, removeItem } = useCart();
    const { isWishlisted, toggleWishlist } = useShopWishlist();
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const allProducts = useMemo(() => {
        const all = Object.entries(categoryProducts).flatMap(([catId, products]) =>
            products.map(p => ({ ...p, categoryId: catId, categoryName: categoryMeta[catId]?.title || catId }))
        );
        return all;
    }, []);

    const parsePrice = (p: string) => parseFloat(p.replace(/[₹,]/g, '')) || 0;

    const filtered = useMemo(() => {
        let list = allProducts;
        if (selectedCategory !== 'all') list = list.filter(p => p.categoryId === selectedCategory);
        if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        switch (sortBy) {
            case 'price-low': return [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            case 'price-high': return [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
            default: return [...list].sort((a, b) => b.reviews - a.reviews);
        }
    }, [allProducts, searchTerm, sortBy, selectedCategory]);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/user-login?redirect=/home/shop/all');
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <MiraituLoader />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-6 md:py-8">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6">
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/shop" className="text-gray-500 hover:text-primary font-medium">Shop</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">All Products</span>
                    </nav>

                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">All Products</h1>

                    {/* Category Filter */}
                    <div className="flex gap-2.5 mb-6 overflow-x-auto py-2 px-1 -mx-4 md:mx-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'all' ? 'bg-white dark:bg-gray-800 shadow-md border-primary text-primary' : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                        >
                            All ({allProducts.length})
                        </button>
                        {shopCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-white dark:bg-gray-800 shadow-md border-primary text-primary' : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                            >
                                <span>{cat.icon}</span>{cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div className="flex gap-2.5 py-2 px-1">
                            {([{ key: 'popular', label: 'Popular' }, { key: 'price-low', label: 'Price ↑' }, { key: 'price-high', label: 'Price ↓' }, { key: 'rating', label: 'Rating' }] as { key: SortOption; label: string }[]).map(s => (
                                <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${sortBy === s.key ? 'bg-white dark:bg-gray-800 shadow-md border-primary text-primary' : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500'}`}>{s.label}</button>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">{filtered.length} products found</p>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filtered.map(product => (
                            <div key={product.id} className="group bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    {product.badge && <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{product.badge}</span>}
                                    {product.weight && (
                                        <span className="absolute bottom-2 left-2 px-2.5 py-1 text-[11px] font-extrabold rounded-full backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
                                            {product.weight}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => toggleWishlist(product.id)}
                                        aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                        aria-pressed={isWishlisted(product.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:scale-105 hover:shadow-md transition-all"
                                    >
                                        <span
                                            className={`material-symbols-outlined text-lg ${isWishlisted(product.id) ? 'text-red-500' : 'text-gray-500'}`}
                                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
                                        >
                                            favorite
                                        </span>
                                    </button>
                                </div>
                                <div className="p-3 md:p-4">
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{product.categoryName}</p>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 min-h-[40px]">{product.name}</h4>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
                                        <span className="text-xs text-gray-400">({product.reviews})</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-bold text-primary">{product.price}</span>
                                        <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                                    </div>
                                    {(quantities[product.id] || 0) > 0 ? (
                                        <div className="w-full mt-3 flex items-center justify-between rounded-lg bg-primary text-white overflow-hidden">
                                            <button onClick={() => removeItem(product.id)} className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg">−</button>
                                            <span className="font-black text-sm">{quantities[product.id]}</span>
                                            <button onClick={() => addItem(product.id)} className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg">+</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => addItem(product.id)} className="w-full mt-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">Add to Cart</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                            <h3 className="text-lg font-bold text-gray-500 mb-1">No products found</h3>
                            <p className="text-sm text-gray-400">Try a different search or category</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
