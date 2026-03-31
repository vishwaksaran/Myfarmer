'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

type TabType = 'buy' | 'sell';

const listings = [
    { id: 1, name: 'Rohu Fish Farm Setup', type: 'Rohu', quantity: '500 kg capacity', price: '₹1,50,000', location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=400&h=300&fit=crop', verified: true, seller: 'Rao Aqua Farms', phone: '+91 99887 76655' },
    { id: 2, name: 'Catla Fingerlings - 10000', type: 'Catla', quantity: '10,000 pcs', price: '₹25,000', location: 'West Bengal', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=400&h=300&fit=crop', verified: true, seller: 'Biswas Hatchery', phone: '+91 88776 65544' },
    { id: 3, name: 'Prawn Farm Ready', type: 'Vannamei', quantity: '2 acre', price: '₹8,00,000', location: 'Gujarat', image: 'https://images.unsplash.com/photo-1565680018093-ebb6e5f79f89?w=400&h=300&fit=crop', verified: false, seller: 'Patel Shrimp', phone: '+91 77665 54433' },
    { id: 4, name: 'Tilapia Seeds', type: 'Tilapia', quantity: '5,000 pcs', price: '₹15,000', location: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=400&h=300&fit=crop', verified: true, seller: 'Murugan Fisheries', phone: '+91 66554 43322' },
];

export default function FishPage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');
    const [contactModal, setContactModal] = useState<{ open: boolean; seller: string; phone: string } | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingContact, setPendingContact] = useState<{ seller: string; phone: string } | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        if (user && pendingContact) {
            setContactModal({ open: true, ...pendingContact });
            setPendingContact(null);
            setShowLoginModal(false);
        }
    }, [user, pendingContact]);

    const handleContactClick = (seller: string, phone: string) => {
        if (user) {
            setContactModal({ open: true, seller, phone });
        } else {
            setPendingContact({ seller, phone });
            setShowLoginModal(true);
        }
    };

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fish & Aquaculture</h1>
                        <Link href="/home/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Fish farming and aquaculture</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {(['buy', 'sell'] as TabType[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${activeTab === tab ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a]'}`}>
                            {activeTab === tab && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === tab ? (tab === 'buy' ? 'bg-emerald-500' : 'bg-orange-500') : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab === 'buy' ? 'shopping_cart' : 'sell'}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab === 'buy' ? 'Buy' : 'Sell'}</p>
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((l) => (
                                <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold">✓ Verified</div>}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{l.type} • {l.quantity}</p>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-lg font-bold text-primary">{l.price}</p>
                                            <p className="text-xs text-gray-500">{l.location}</p>
                                        </div>
                                        <button
                                            onClick={() => handleContactClick(l.seller, l.phone)}
                                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">call</span>
                                            Contact Seller
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary text-center mb-6">Sell Fish / Aquaculture</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fish Type</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800"><option>Fish Type</option><option>Rohu</option><option>Catla</option><option>Tilapia</option><option>Prawn</option></select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                                    <input placeholder="Enter quantity" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input placeholder="Enter price" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input placeholder="Enter location" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                </div>
                                <button className="w-full py-4 rounded-xl bg-primary text-white font-bold">Publish</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Modal */}
                {contactModal?.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setContactModal(null)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setContactModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">call</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Seller</h3>
                                <p className="text-gray-500 mb-4">{contactModal.seller}</p>
                                <div className="flex flex-col gap-3">
                                    <a href={`tel:${contactModal.phone}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                        <span className="material-symbols-outlined">call</span>
                                        Call {contactModal.phone}
                                    </a>
                                    <a href={`https://wa.me/${contactModal.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        Chat on WhatsApp
                                    </a>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Choose how you want to contact the seller</p>
                            </div>
                        </div>
                    </div>
                )}

                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

                <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
            </div>
        </div>
    );
}
