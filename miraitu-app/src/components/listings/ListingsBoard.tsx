'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { useAppLocation } from '@/context/LocationContext';
import supabase from '@/lib/supabase';
import { Z } from '@/lib/z-layers';
import {
    createListing,
    deleteListing,
    fetchListings,
    setListingStatus,
    updateListing,
} from '@/app/actions/listings';
import { CATEGORIES_BY_MODE } from './listingTypes';
import type { Listing, ListingCategory, ListingInput, ListingMode } from './listingTypes';
import ListingCard from './ListingCard';
import ListingFormModal from './ListingFormModal';
import ListingDetailModal from './ListingDetailModal';
import EnableLocationBanner from '@/components/location/EnableLocationBanner';
import { nearFrom } from '@/lib/geo-distance';
import { boardCategories, CATEGORY_META, boardTitle, postCta, searchPlaceholder } from './listingFormat';
import { SUBCATEGORIES } from './listingTypes';

const PAGE_SIZE = 20;

/**
 * The Rent and Buy & Sell boards — same component, split by `mode`.
 *
 * Search, category chips, distance sorting, posting, editing and deleting all
 * behave identically on both; only the copy, the price units and which rows
 * are fetched differ.
 */
// useSearchParams must sit inside a Suspense boundary, or the production build
// fails to prerender these routes.
export default function ListingsBoard({ mode }: { mode: ListingMode }) {
    return (
        <Suspense fallback={null}>
            <Board mode={mode} />
        </Suspense>
    );
}

function Board({ mode }: { mode: ListingMode }) {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    /** `?mine=1` opens straight into My Ads — what the home screen's tile links to. */
    const wantsMine = searchParams.get('mine') === '1';
    /**
     * `?category=machinery&post=1` — how the Machinery and Livestock pages hand
     * someone straight to the right form. An unknown or wrong-board category is
     * ignored rather than rejected: a stale link should land on the full board,
     * not an error.
     */
    const wantsCategory = (() => {
        const c = searchParams.get('category');
        return c && (CATEGORIES_BY_MODE[mode] as string[]).includes(c)
            ? (c as ListingCategory)
            : 'all';
    })();
    const wantsPost = searchParams.get('post') === '1';
    /**
     * `?subcategory=Tractor` — the type the caller already knows, e.g. every
     * machinery category page. It only seeds the form; the board itself stays
     * on the whole category so the seller can still see what else is listed.
     * The form drops it if it does not belong to the category.
     */
    const wantsSubcategory = searchParams.get('subcategory');
    const { location } = useAppLocation();

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [category, setCategory] = useState<ListingCategory | 'all'>(wantsCategory);
    const [subcategory, setSubcategory] = useState('');
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [mineOnly, setMineOnly] = useState(wantsMine);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Listing | null>(null);
    const [viewing, setViewing] = useState<Listing | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null);
    const loadedCountRef = useRef(0);

    const near = nearFrom(location);
    const nearKey = near ? `${near.lat},${near.lng}` : '';

    // Debounce typing so a search does not fire a query per keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), query ? 350 : 0);
        return () => clearTimeout(timer);
    }, [query]);

    const load = useCallback(async () => {
        const res = await fetchListings({
            mode,
            category,
            subcategory,
            query: debouncedQuery,
            near,
            mineOnly,
            limit: Math.max(PAGE_SIZE, loadedCountRef.current),
        });
        setListings(res.data);
        setHasMore(res.hasMore);
        loadedCountRef.current = res.data.length;
        setLoading(false);
        // `near` is an object rebuilt each render; nearKey is its stable identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, category, subcategory, debouncedQuery, mineOnly, nearKey]);

    useEffect(() => {
        // A filter change starts a fresh page, so reset the cursor first.
        loadedCountRef.current = 0;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    // A new ad posted by anyone shows up without a refresh.
    useEffect(() => {
        let pending: ReturnType<typeof setTimeout> | null = null;
        const refresh = () => {
            if (pending) clearTimeout(pending);
            pending = setTimeout(() => { void load(); }, 400);
        };

        const channel = supabase
            .channel(`marketplace-${mode}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_listings' }, refresh)
            .subscribe();

        return () => {
            if (pending) clearTimeout(pending);
            void supabase.removeChannel(channel);
        };
    }, [load, mode]);

    const loadMore = async () => {
        setLoadingMore(true);
        const res = await fetchListings({
            mode,
            category,
            subcategory,
            query: debouncedQuery,
            near,
            mineOnly,
            limit: PAGE_SIZE,
            offset: loadedCountRef.current,
        });
        setListings(prev => {
            const seen = new Set(prev.map(l => l.id));
            const merged = [...prev, ...res.data.filter(l => !seen.has(l.id))];
            loadedCountRef.current = merged.length;
            return merged;
        });
        setHasMore(res.hasMore);
        setLoadingMore(false);
    };

    /** Posting needs an account — everything else on the board is public.
     *  Memoised so `openNew` below keeps a stable identity for its effect. */
    const requireAuth = useCallback((action: () => void) => {
        if (!user) { setShowLogin(true); return; }
        action();
    }, [user]);

    const handleSubmit = async (input: ListingInput): Promise<{ success: boolean; error?: string }> => {
        const res = editing ? await updateListing(editing.id, input) : await createListing(input);
        if (!res.success) return res;

        await load();
        setNotice(editing ? 'Listing updated' : `${postCta(mode)} — published`);
        setTimeout(() => setNotice(null), 3000);
        setEditing(null);
        return { success: true };
    };

    const handleDelete = async (listing: Listing) => {
        const res = await deleteListing(listing.id);
        setConfirmDelete(null);
        if (!res.success) {
            setNotice(res.error || 'Could not delete that listing');
            setTimeout(() => setNotice(null), 4000);
            return;
        }
        setViewing(null);
        await load();
        setNotice('Listing deleted');
        setTimeout(() => setNotice(null), 3000);
    };

    const handleToggleSold = async (listing: Listing) => {
        const next = listing.status === 'active' ? 'sold' : 'active';
        const res = await setListingStatus(listing.id, next);
        if (!res.success) {
            setNotice(res.error || 'Could not update that listing');
            setTimeout(() => setNotice(null), 4000);
            return;
        }
        await load();
    };

    const openNew = useCallback(() => {
        requireAuth(() => { setEditing(null); setShowForm(true); });
    }, [requireAuth]);

    /**
     * `?post=1` opens the form on arrival. Fires once: without the guard any
     * re-render would re-open a form the user had just dismissed.
     */
    const autoPosted = useRef(false);
    useEffect(() => {
        if (!wantsPost || autoPosted.current) return;
        autoPosted.current = true;
        openNew();
    }, [wantsPost, openNew]);
    const openEdit = (listing: Listing) => { setViewing(null); setEditing(listing); setShowForm(true); };

    return (
        <div className="min-h-screen bg-[#f4f6f0] dark:bg-[#0d110d] pb-28 md:pb-0">
            <Header />

            <main className="py-4 sm:py-6">
                <div className="mx-auto max-w-[900px] px-3 sm:px-6">
                    {/* Board heading */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#22c33d] text-2xl">
                                    {mode === 'labour' ? 'engineering' : mode === 'rent' ? 'agriculture' : 'storefront'}
                                </span>
                                {boardTitle(mode)}
                            </h1>
                            {location?.address && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-[13px] text-red-500">location_on</span>
                                    {location.address}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={openNew}
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            {postCta(mode)}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 mb-3">
                        <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder(mode)}
                            aria-label={`Search ${boardTitle(mode)}`}
                            className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                        {boardCategories(mode).map(c => {
                            const active = category === c;
                            const label = c === 'all' ? 'All' : CATEGORY_META[c].label;
                            const emoji = c === 'all' ? '📋' : CATEGORY_META[c].emoji;
                            return (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setCategory(c);
                                        // The sub-filter belongs to the previous
                                        // category, so it cannot carry over.
                                        setSubcategory('');
                                    }}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${active
                                        ? 'bg-[#22c33d] text-white shadow-sm'
                                        : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    <span aria-hidden>{emoji}</span>
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sub-category chips — only once a category narrows the board,
                        so the default view stays a single row. */}
                    {category !== 'all' && SUBCATEGORIES[category]?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                            <button
                                onClick={() => setSubcategory('')}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!subcategory
                                    ? 'bg-[#1f8c30] text-white'
                                    : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                                    }`}
                            >
                                All {CATEGORY_META[category].label}
                            </button>
                            {SUBCATEGORIES[category].map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${subcategory === sub
                                        ? 'bg-[#1f8c30] text-white'
                                        : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* My ads toggle */}
                    {user && (
                        <div className="flex items-center gap-2 mb-3">
                            <button
                                onClick={() => setMineOnly(v => !v)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${mineOnly
                                    ? 'bg-[#22c33d] text-white'
                                    : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">person</span>
                                My ads
                            </button>
                            {mineOnly && (
                                <span className="text-[11px] text-gray-500">Showing your listings, including sold ones</span>
                            )}
                        </div>
                    )}

                    {notice && (
                        <div className="mb-3 flex items-center gap-2 p-3 rounded-xl bg-[#22c33d]/10 border border-[#22c33d]/20">
                            <span className="material-symbols-outlined text-[#22c33d]">check_circle</span>
                            <span className="text-sm font-semibold text-[#1f8c30] dark:text-[#6abf62]">{notice}</span>
                        </div>
                    )}

                    {/* Only worth asking for a location when there is something
                        on screen to measure against. */}
                    {!loading && listings.length > 0 && <EnableLocationBanner />}

                    {/* Results */}
                    {loading ? (
                        <div className="space-y-3">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 animate-pulse" />
                            ))}
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                                {debouncedQuery ? 'search_off' : 'inventory_2'}
                            </span>
                            <p className="text-gray-500 font-medium px-6">
                                {debouncedQuery
                                    ? `Nothing matches “${debouncedQuery}”`
                                    : mineOnly
                                        ? 'You have not posted anything here yet.'
                                        : `No ${mode === 'labour' ? 'listings' : mode === 'rent' ? 'rentals' : 'ads'} here yet — be the first to post one.`}
                            </p>
                            <button
                                onClick={openNew}
                                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                {postCta(mode)}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {listings.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onOpen={setViewing}
                                    {...(listing.isOwn && mineOnly
                                        ? {
                                            onEdit: openEdit,
                                            onDelete: setConfirmDelete,
                                            onToggleSold: handleToggleSold,
                                        }
                                        : {})}
                                />
                            ))}
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className="text-center mt-6">
                            <button
                                onClick={() => { void loadMore(); }}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 text-sm font-bold text-[#22c33d] hover:bg-[#22c33d]/5 disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined ${loadingMore ? 'animate-spin' : ''}`}>
                                    {loadingMore ? 'progress_activity' : 'expand_more'}
                                </span>
                                {loadingMore ? 'Loading…' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Mobile post button, clear of the bottom nav */}
            <button
                onClick={openNew}
                className="sm:hidden fixed bottom-24 right-4 z-40 inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-[#22c33d] text-white text-sm font-bold shadow-lg shadow-[#22c33d]/30 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-xl">add</span>
                {postCta(mode)}
            </button>

            <ListingFormModal
                key={editing ? `edit-${editing.id}` : 'new'}
                isOpen={showForm}
                mode={mode}
                editing={editing}
                initialCategory={wantsCategory === 'all' ? null : wantsCategory}
                initialSubcategory={wantsSubcategory}
                onClose={() => { setShowForm(false); setEditing(null); }}
                onSubmit={handleSubmit}
            />

            <ListingDetailModal
                listing={viewing}
                onClose={() => setViewing(null)}
                onEdit={openEdit}
                onDelete={setConfirmDelete}
            />

            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: Z.LIGHTBOX }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="relative w-full max-w-xs rounded-2xl bg-white dark:bg-[#1a231a] p-5 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                            <span className="material-symbols-outlined text-xl text-red-500">delete_forever</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Delete listing?</h4>
                        <p className="text-xs text-gray-500 mb-4">
                            “{confirmDelete.title}” will be removed for everyone. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { void handleDelete(confirmDelete); }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
}
