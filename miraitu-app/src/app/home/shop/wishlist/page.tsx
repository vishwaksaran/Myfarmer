'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { featuredProducts } from '../data';
import { categoryMeta, categoryProducts, type Product } from '../categoryData';
import { useShopWishlist } from '@/lib/use-shop-wishlist';

type WishlistProduct = Product & {
    categoryName: string;
};

export default function ShopWishlistPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { quantities, addItem, removeItem } = useCart();
    const { wishlistIdList, wishlistCount, toggleWishlist, clearWishlist } = useShopWishlist();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/user-login?redirect=/home/shop/wishlist');
        }
    }, [loading, user, router]);

    const productMap = useMemo(() => {
        const map = new Map<number, WishlistProduct>();

        featuredProducts.forEach((product) => {
            map.set(product.id, {
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                rating: product.rating,
                reviews: product.reviews,
                image: product.image,
                badge: product.badge,
                description: '',
                categoryName: product.category || 'Featured',
            });
        });

        Object.entries(categoryProducts).forEach(([categoryId, products]) => {
            const categoryName = categoryMeta[categoryId]?.title || 'Shop';

            products.forEach((product) => {
                map.set(product.id, {
                    ...product,
                    categoryName,
                });
            });
        });

        return map;
    }, []);

    const wishlistProducts = useMemo(
        () => wishlistIdList
            .map((productId) => productMap.get(productId))
            .filter((product): product is WishlistProduct => Boolean(product)),
        [wishlistIdList, productMap]
    );

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-6 md:py-8">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6">
                    <nav className="flex items-center gap-1 mb-4 md:mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/shop" className="text-gray-500 hover:text-primary font-medium">Shop</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Wishlist</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-7">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">My Wishlist</h1>
                            <p className="text-sm text-gray-500 mt-1">{wishlistCount} saved product{wishlistCount === 1 ? '' : 's'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {wishlistCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearWishlist}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Clear Wishlist
                                </button>
                            )}
                            <Link
                                href="/home/shop/all"
                                className="px-3 py-2 rounded-xl bg-primary text-white text-xs md:text-sm font-bold hover:brightness-110 transition-all"
                            >
                                Browse Products
                            </Link>
                        </div>
                    </div>

                    {wishlistProducts.length === 0 ? (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">favorite</span>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                            <p className="text-sm text-gray-500 mb-5">Tap the heart icon on any product to save it here.</p>
                            <Link
                                href="/home/shop"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110"
                            >
                                <span className="material-symbols-outlined text-base">shopping_bag</span>
                                Start Exploring
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {wishlistProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.badge && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] md:text-xs font-bold rounded">
                                                {product.badge}
                                            </span>
                                        )}
                                        {product.weight && (
                                            <span className="absolute bottom-2 left-2 px-2 py-1 text-[10px] md:text-[11px] font-extrabold rounded-full backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                {product.weight}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleWishlist(product.id)}
                                            aria-label="Remove from wishlist"
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-red-500 hover:scale-105 hover:shadow-md transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">favorite</span>
                                        </button>
                                    </div>

                                    <div className="p-3 md:p-4">
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1 truncate">{product.categoryName}</p>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 min-h-[40px]">
                                            {product.name}
                                        </h3>
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
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="px-3 md:px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                                >
                                                    −
                                                </button>
                                                <span className="font-black text-sm">{quantities[product.id]}</span>
                                                <button
                                                    onClick={() => addItem(product.id)}
                                                    className="px-3 md:px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addItem(product.id)}
                                                className="w-full mt-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
