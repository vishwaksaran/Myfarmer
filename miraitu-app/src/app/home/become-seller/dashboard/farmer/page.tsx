'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import MiraituLoader from '@/components/v2/MiraituLoader';
import {
    fetchSellerDashboard,
    createSellerListing,
    setSellerListingStatus,
    deleteSellerListing,
    type SellerDashboard,
    type SellerListing,
} from '@/app/actions/seller-dashboard';

/**
 * The farmer's workspace.
 *
 * This used to be a mock-up: hardcoded stats, a hardcoded "Verification
 * Pending" badge, tabs that only changed their own highlight, and not one
 * button with a handler behind it. It also rendered the public storefront
 * header, so a farmer at work saw a search box and a Login button for an
 * account they were not using.
 *
 * Now it reads the seller's own session and shows what is actually true:
 * their real verification state, their real listings, and a form that
 * publishes to the same `marketplace_listings` table the public boards
 * read — so an approved farmer's produce appears in the app the moment
 * they post it. A farmer still waiting on approval sees the form disabled
 * and is told why.
 */

const SIDEBAR = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'listings', icon: 'storefront', label: 'My Listings' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
] as const;

type TabId = (typeof SIDEBAR)[number]['id'];

const CATEGORIES = [
    { value: 'crops', label: 'Crops, vegetables & fruits' },
    { value: 'animals', label: 'Livestock' },
    { value: 'machinery', label: 'Machinery & equipment' },
];

const PRICE_UNITS = ['per quintal', 'per kg', 'per piece', 'per litre', 'Total'];

function rupees(n: number | null) {
    if (n === null) return 'Price on request';
    return `₹${n.toLocaleString('en-IN')}`;
}

export default function FarmerDashboardPage() {
    const router = useRouter();
    const [tab, setTab] = useState<TabId>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<SellerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = useCallback(() => {
        let cancelled = false;
        fetchSellerDashboard()
            .then(res => {
                if (cancelled) return;
                setData(res);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setData({
                    seller: null, listings: [],
                    stats: { activeListings: 0, totalListings: 0, buyerRequests: 0 },
                    error: 'Could not load your dashboard.',
                });
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => load(), [load]);

    const refresh = () => { setLoading(true); load(); };

    const handleLogout = async () => {
        await fetch('/api/seller/auth/logout', { method: 'POST' }).catch(() => { });
        router.push('/seller-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d] flex items-center justify-center">
                <MiraituLoader />
            </div>
        );
    }

    // No valid session — the dashboard is not browsable, so say so plainly
    // and send them to the seller sign-in rather than the shopper one.
    if (!data?.seller) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d] flex flex-col">
                <header className="px-6 py-5">
                    <Link href="/home" aria-label="Miraitu home"><MiraituLogo /></Link>
                </header>
                <main className="flex-1 flex items-center justify-center px-4 pb-20">
                    <div className="max-w-sm text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">lock</span>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1.5">Sign in to your seller account</h1>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            {data?.error ?? 'This dashboard is for registered sellers. Use the username and password Miraitu issued you.'}
                        </p>
                        <Link
                            href="/seller-login"
                            className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110"
                        >
                            Go to seller sign in
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const { seller, listings, stats } = data;
    const approved = seller.approved;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d] text-[#121811] dark:text-[#f9fbf9]">
            {/*
              A workspace bar, not the storefront header. The public Header
              put a product search and a Login button on this page, both of
              which belong to a shopper's session the seller is not using.
            */}
            <header className="sticky top-0 z-40 bg-white dark:bg-[#111a11] border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
                        </button>
                        <Link href="/home" aria-label="Miraitu home" className="shrink-0">
                            <MiraituLogo size={32} />
                        </Link>
                        <span className="hidden sm:inline text-sm font-bold text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-3">
                            Seller Workspace
                        </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[160px]">
                            {seller.fullName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-base">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white dark:bg-[#111a11] border-r border-gray-200 dark:border-gray-800 z-30 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-black text-sm text-gray-900 dark:text-white">Farmer Dashboard</p>
                        {/* The real status, not a hardcoded badge. */}
                        {approved ? (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-green-700 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">verified</span>Verified Seller
                            </span>
                        ) : seller.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">block</span>Not Approved
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>Verification Pending
                            </span>
                        )}
                    </div>
                    <nav className="p-3">
                        {SIDEBAR.map(link => (
                            <button
                                key={link.id}
                                onClick={() => { setTab(link.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold mb-1 transition-all ${tab === link.id
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{link.icon}</span>{link.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-[1100px]">
                    {notice && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-800 text-sm font-medium flex items-center justify-between gap-3">
                            <span>{notice}</span>
                            <button onClick={() => setNotice(null)} className="font-bold">Dismiss</button>
                        </div>
                    )}

                    {/* Verification gate, stated once and honestly. */}
                    {!approved && (
                        <div className={`mb-6 rounded-2xl p-5 border ${seller.status === 'rejected'
                            ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900'
                            : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900'}`}>
                            <div className="flex items-start gap-3">
                                <span className={`material-symbols-outlined ${seller.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {seller.status === 'rejected' ? 'block' : 'hourglass_top'}
                                </span>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {seller.status === 'rejected'
                                            ? 'Your application was not approved'
                                            : 'Your application is being verified'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                        {seller.status === 'rejected'
                                            ? (seller.reviewNote || 'Miraitu could not approve this application. Contact us if you think this is a mistake.')
                                            : 'Miraitu checks every seller by hand. You can post produce as soon as that is done, and we will call you on the number you gave.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'overview' && (
                        <>
                            <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 mb-6">
                                <h1 className="text-2xl font-black mb-1">Namaskaram, {seller.fullName.split(' ')[0]}</h1>
                                <p className="text-white/90 text-sm leading-relaxed max-w-xl">
                                    {approved
                                        ? 'You are verified. Anything you list here goes straight onto the Miraitu boards where buyers are looking.'
                                        : 'Your dashboard is ready. Listing opens as soon as your application is approved.'}
                                </p>
                                <button
                                    onClick={() => { setTab('listings'); setShowForm(true); }}
                                    disabled={!approved}
                                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-xl font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    List produce
                                </button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: 'Active Listings', value: String(stats.activeListings), icon: 'storefront', hint: approved ? 'Visible to buyers now' : 'List once verified' },
                                    { label: 'Total Posted', value: String(stats.totalListings), icon: 'inventory_2', hint: 'Including taken down' },
                                    { label: 'Buyer Requests', value: String(stats.buyerRequests), icon: 'handshake', hint: 'Callbacks about your listings' },
                                ].map(s => (
                                    <div key={s.label} className="bg-white dark:bg-[#1a231a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                        <span className="material-symbols-outlined text-green-600 mb-2 block">{s.icon}</span>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{s.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{s.hint}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Your details</p>
                                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    {[
                                        ['Name', seller.fullName],
                                        ['Phone', seller.phone ?? '—'],
                                        ['Business', seller.businessName ?? '—'],
                                        ['Place', [seller.location, seller.district, seller.state].filter(Boolean).join(', ') || '—'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex gap-2">
                                            <dt className="text-gray-500 min-w-[70px]">{k}</dt>
                                            <dd className="font-medium text-gray-900 dark:text-white">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </>
                    )}

                    {tab === 'listings' && (
                        <ListingsTab
                            listings={listings}
                            approved={approved}
                            showForm={showForm}
                            setShowForm={setShowForm}
                            defaultLocation={seller.location ?? ''}
                            onChanged={(msg) => { setNotice(msg); refresh(); }}
                        />
                    )}

                    {tab === 'settings' && (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-lg">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">Settings</h2>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                Your name, phone and place come from the application Miraitu approved.
                                To change them, or to get a new password, contact Miraitu and we will
                                update it for you.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200"
                            >
                                Sign out of this device
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

/** My Listings: what is live, plus the form that publishes a new one. */
function ListingsTab({
    listings, approved, showForm, setShowForm, defaultLocation, onChanged,
}: {
    listings: SellerListing[];
    approved: boolean;
    showForm: boolean;
    setShowForm: (v: boolean) => void;
    defaultLocation: string;
    onChanged: (msg: string) => void;
}) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('crops');
    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState(PRICE_UNITS[0]);
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState(defaultLocation);
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        const res = await createSellerListing({
            title,
            category,
            price: price.trim() ? Number(price.replace(/[^\d.]/g, '')) : null,
            priceUnit,
            quantity,
            location: location.trim() || defaultLocation,
            description,
        });
        setSaving(false);

        if (!res.success) { setFormError(res.error ?? 'Could not publish that listing.'); return; }

        setTitle(''); setPrice(''); setQuantity(''); setDescription('');
        setShowForm(false);
        onChanged('Your listing is live on Miraitu.');
    };

    const toggle = async (l: SellerListing) => {
        const res = await setSellerListingStatus(l.id, l.status === 'active' ? 'inactive' : 'active');
        onChanged(res.success
            ? (l.status === 'active' ? 'Listing taken down.' : 'Listing is live again.')
            : (res.error ?? 'Could not update that listing.'));
    };

    const remove = async (l: SellerListing) => {
        const res = await deleteSellerListing(l.id);
        onChanged(res.success ? 'Listing deleted.' : (res.error ?? 'Could not delete that listing.'));
    };

    return (
        <>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">My Listings</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    disabled={!approved}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 flex items-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancel' : 'New listing'}
                </button>
            </div>

            {showForm && approved && (
                <form onSubmit={submit} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">What are you selling?</label>
                            <input
                                value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Organic Sona Masoori paddy"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Category</label>
                            <select
                                value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            >
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Quantity available</label>
                            <input
                                value={quantity} onChange={e => setQuantity(e.target.value)}
                                placeholder="e.g. 20 quintals"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Price (optional)</label>
                            <input
                                value={price} onChange={e => setPrice(e.target.value)}
                                inputMode="numeric" placeholder="2400"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Priced</label>
                            <select
                                value={priceUnit} onChange={e => setPriceUnit(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            >
                                {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Village / town</label>
                            <input
                                value={location} onChange={e => setLocation(e.target.value)}
                                placeholder="Where buyers should come"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Details (optional)</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                placeholder="Variety, when it was harvested, how it was grown"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary resize-none"
                            />
                        </div>
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit" disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 flex items-center gap-2"
                        >
                            {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                            Publish listing
                        </button>
                        <p className="text-xs text-gray-400">Goes live on Miraitu straight away.</p>
                    </div>
                </form>
            )}

            {listings.length === 0 ? (
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">inventory_2</span>
                    <p className="font-bold text-gray-900 dark:text-white">No listings yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {approved ? 'Post your first produce and buyers will start seeing it.' : 'You can post once Miraitu approves your account.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {listings.map(l => (
                        <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-gray-900 dark:text-white">{l.title}</p>
                                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${l.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {l.status === 'active' ? 'Live' : 'Taken down'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {rupees(l.price)}{l.priceUnit ? ` ${l.priceUnit}` : ''}
                                    {l.location ? ` · ${l.location}` : ''}
                                    {` · posted ${new Date(l.createdAt).toLocaleDateString('en-IN')}`}
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => toggle(l)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    {l.status === 'active' ? 'Take down' : 'Put back up'}
                                </button>
                                <button
                                    onClick={() => remove(l)}
                                    className="px-3 py-2 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
