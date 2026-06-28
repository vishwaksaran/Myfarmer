'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useCart } from '@/context/CartContext';
import { shopCategories } from '../data';
import { categoryProducts, categoryMeta, featuredBrands } from '../categoryData';
import FeaturedBrandBanner from '@/components/v2/FeaturedBrandBanner';
import { useShopWishlist } from '@/lib/use-shop-wishlist';
import { useLanguage } from '@/i18n/LanguageContext';

// Category slug → i18n key for the display name
const catNameKey: Record<string, string> = {
    'agriculture-drone': 'shopCat.agricultureDrone',
    'seeds': 'shopCat.seeds',
    'garden-products': 'shopCat.gardenProducts',
    'crop-special-kit': 'shopCat.cropSpecialKit',
    'agri-inputs': 'shopCat.agriInputs',
    'agriculture-tools': 'shopCat.agricultureTools',
    'cold-press-oil': 'shopCat.coldPressOil',
    'solar-dry-products': 'shopCat.solarDryProducts',
    'organic-manure': 'shopCat.organicManure',
    'millets-grains': 'shopCat.milletsGrains',
    'honey-products': 'shopCat.honeyProducts',
    'spices-herbs': 'shopCat.spicesHerbs',
    'dairy-products': 'shopCat.dairyProducts',
};
const badgeKey: Record<string, string> = {
    'Best Seller': 'shopBadge.bestSeller',
    'New': 'shopBadge.new',
    'Eco-Friendly': 'shopBadge.ecoFriendly',
    'Bundle': 'shopBadge.bundle',
    'Top Rated': 'shopBadge.topRated',
    'Popular': 'shopBadge.popular',
};

type SortOption = 'all' | 'popular' | 'price-low' | 'price-high' | 'rating';

const bannerGradients: Record<string, string> = {
    'from-blue-600 to-blue-800': 'linear-gradient(to right, #2563eb, #1e40af)',
    'from-amber-500 to-amber-700': 'linear-gradient(to right, #f59e0b, #b45309)',
    'from-purple-600 to-purple-800': 'linear-gradient(to right, #9333ea, #6b21a8)',
    'from-green-600 to-green-800': 'linear-gradient(to right, #16a34a, #166534)',
    'from-orange-500 to-orange-700': 'linear-gradient(to right, #f97316, #c2410c)',
    'from-slate-600 to-slate-800': 'linear-gradient(to right, #475569, #1e293b)',
    'from-yellow-600 to-yellow-800': 'linear-gradient(to right, #ca8a04, #854d0e)',
    'from-red-500 to-red-700': 'linear-gradient(to right, #ef4444, #b91c1c)',
    'from-amber-400 to-orange-600': 'linear-gradient(to right, #fbbf24, #ea580c)',
    'from-lime-600 to-lime-800': 'linear-gradient(to right, #65a30d, #3f6212)',
    'from-emerald-600 to-emerald-800': 'linear-gradient(to right, #059669, #065f46)',
    'from-rose-600 to-rose-800': 'linear-gradient(to right, #e11d48, #9f1239)',
    'from-sky-500 to-sky-700': 'linear-gradient(to right, #0ea5e9, #0369a1)',
};

export default function CategoryPage({ categorySlug }: { categorySlug?: string }) {
    const params = useParams();
    const slug = categorySlug || (params.category as string);
    const { quantities, addItem, removeItem } = useCart();
    const { isWishlisted, toggleWishlist } = useShopWishlist();
    const { t } = useLanguage();
    // Translated category name (falls back to the meta title)
    const tName = (s: string, fallback: string) => (catNameKey[s] ? t(catNameKey[s]) : fallback);
    const tBadge = (b: string) => (badgeKey[b] ? t(badgeKey[b]) : b);

    const [sortBy, setSortBy] = useState<SortOption>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const meta = categoryMeta[slug];
    const products = categoryProducts[slug] || [];
    const catInfo = shopCategories.find(c => c.id === slug);

    const parsePrice = (p: string) => {
        const num = p.replace(/[₹,]/g, '');
        return parseFloat(num) || 0;
    };

    const filtered = useMemo(() => {
        let list = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (sortBy) {
            case 'price-low': list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
            case 'price-high': list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
            case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
            case 'popular': list = [...list].sort((a, b) => b.reviews - a.reviews); break;
            default: break; // 'all' - keep original order
        }
        return list;
    }, [products, searchTerm, sortBy]);

    if (!meta) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
                <Header />
                <main className="py-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('shopPage.categoryNotFound')}</h1>
                    <p className="text-gray-500 mb-6">{t('shopPage.categoryNotFoundDesc')}</p>
                    <Link href="/home/shop" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110">
                        {t('shopPage.backToShop')}
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-6 md:py-8">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">{t('shopPage.home')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/shop" className="text-gray-500 hover:text-primary font-medium">{t('shopPage.shopBreadcrumb')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">{tName(slug, meta.title)}</span>
                    </nav>

                    {/* Category Banner */}
                    <div
                        className="relative rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-10 mb-8"
                        style={{ background: bannerGradients[meta.bannerColor] || 'linear-gradient(to right, #16a34a, #166534)' }}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                {catInfo?.isMatIcon ? (
                                    <span className="material-symbols-outlined text-4xl md:text-5xl text-white">{meta.icon}</span>
                                ) : (
                                    <span className="text-4xl md:text-5xl">{meta.icon}</span>
                                )}
                                <h1 className="text-2xl md:text-4xl font-black text-white">{tName(slug, meta.title)}</h1>
                            </div>
                            <p className="text-sm md:text-base text-white/80 max-w-xl">{meta.description}</p>
                            <p className="mt-3 text-sm text-white/60 font-bold">{products.length} {t('shopPage.productsAvailable')}</p>
                        </div>
                        <div className="absolute right-4 bottom-4 opacity-10 text-[120px] md:text-[180px] leading-none">
                            {catInfo?.isMatIcon ? (
                                <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>{meta.icon}</span>
                            ) : (
                                meta.icon
                            )}
                        </div>
                    </div>

                    {/* Featured Brand Banners – dynamically driven by featuredBrands config */}
                    {(featuredBrands[slug] ?? []).map(brand => (
                        <FeaturedBrandBanner key={brand.id} brand={brand} />
                    ))}

                    {/* Other Categories Quick Nav */}
                    <div className="flex gap-2.5 mb-6 overflow-x-auto py-2 px-1 -mx-4 md:mx-0 scrollbar-hide">
                        {shopCategories.map(cat => (
                            <Link
                                key={cat.id}
                                href={cat.path}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${cat.id === slug
                                    ? 'bg-white dark:bg-gray-800 shadow-md border-primary text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.isMatIcon ? (
                                    <span className="material-symbols-outlined text-base">{cat.icon}</span>
                                ) : (
                                    <span>{cat.icon}</span>
                                )} {tName(cat.id, cat.name)}
                            </Link>
                        ))}
                    </div>

                    {/* Search & Sort Bar */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder={`${t('shopPage.searchIn')} ${tName(slug, meta.title)}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto py-2 px-1 scrollbar-hide">
                            {([
                                { key: 'all', labelKey: 'shopPage.sortAll' },
                                { key: 'popular', labelKey: 'shopPage.sortPopular' },
                                { key: 'price-low', labelKey: 'shopPage.sortPriceLow' },
                                { key: 'price-high', labelKey: 'shopPage.sortPriceHigh' },
                                { key: 'rating', labelKey: 'shopPage.sortTopRated' },
                            ] as { key: SortOption; labelKey: string }[]).map(s => (
                                <button
                                    key={s.key}
                                    onClick={() => setSortBy(s.key)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${sortBy === s.key
                                        ? 'bg-white dark:bg-gray-800 shadow-md border-primary text-primary'
                                        : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {t(s.labelKey)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filtered.map(product => (
                            <div
                                key={product.id}
                                className="group bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.badge && (
                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">
                                            {tBadge(product.badge)}
                                        </span>
                                    )}
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

                                {/* Info */}
                                <div className="p-3 md:p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 min-h-[40px]">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
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
                                                className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                            >
                                                −
                                            </button>
                                            <span className="font-black text-sm">{quantities[product.id]}</span>
                                            <button
                                                onClick={() => addItem(product.id)}
                                                className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addItem(product.id)}
                                            className="w-full mt-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                                        >
                                            {t('shopPage.addToCart')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                            <h3 className="text-lg font-bold text-gray-500 mb-1">{t('shopPage.noProducts')}</h3>
                            <p className="text-sm text-gray-400">{t('shopPage.tryDifferent')}</p>
                        </div>
                    )}

                    {/* Related Categories */}
                    <section className="mt-12">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('shopPage.exploreOther')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {shopCategories.filter(c => c.id !== slug).map(cat => (
                                <Link
                                    key={cat.id}
                                    href={cat.path}
                                    className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all text-center group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                                        {cat.isMatIcon ? (
                                            <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                        ) : (
                                            cat.icon
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{tName(cat.id, cat.name)}</h4>
                                    <p className="text-xs text-gray-400">{cat.count} {t('shopPage.products')}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
