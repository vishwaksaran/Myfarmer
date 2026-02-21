'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

type TabType = 'buy' | 'sell';

const tabs = [
    { id: 'buy' as TabType, title: 'Buy Cattle', icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Cattle', icon: 'sell', bgColor: 'bg-orange-500' },
];

const breeds = ['All Breeds', 'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Murrah', 'Mehsana', 'Holstein', 'Jersey'];

const listings = [
    { id: 1, name: 'Pure Gir Cow', breed: 'Gir', age: '4 Years', milkYield: '12 L/day', price: '₹85,000', location: 'Rajkot, Gujarat', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: true, seller: 'Ramesh Patel', phone: '+91 98765 43210' },
    { id: 2, name: 'Murrah Buffalo', breed: 'Murrah', age: '5 Years', milkYield: '15 L/day', price: '₹1,20,000', location: 'Karnal, Haryana', image: 'https://images.unsplash.com/photo-1619452104266-0d23df2119ac?w=400&h=300&fit=crop', verified: true, seller: 'Sukhdev Singh', phone: '+91 87654 32109' },
    { id: 3, name: 'Sahiwal Cow', breed: 'Sahiwal', age: '3 Years', milkYield: '10 L/day', price: '₹75,000', location: 'Amritsar, Punjab', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=300&fit=crop', verified: false, seller: 'Gurpreet Kaur', phone: '+91 76543 21098' },
    { id: 4, name: 'Jersey Cross', breed: 'Jersey', age: '2 Years', milkYield: '18 L/day', price: '₹65,000', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400&h=300&fit=crop', verified: true, seller: 'Amit Kulkarni', phone: '+91 65432 10987' },
    { id: 5, name: 'Red Sindhi Bull', breed: 'Red Sindhi', age: '4 Years', milkYield: '-', price: '₹55,000', location: 'Jodhpur, Rajasthan', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: false, seller: 'Ram Singh', phone: '+91 54321 09876' },
    { id: 6, name: 'Holstein Friesian', breed: 'Holstein', age: '3 Years', milkYield: '22 L/day', price: '₹1,50,000', location: 'Bangalore, Karnataka', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=300&fit=crop', verified: true, seller: 'Krishna Reddy', phone: '+91 43210 98765' },
];

export default function CattlePage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');
    const [selectedBreed, setSelectedBreed] = useState('All Breeds');
    const [contactModal, setContactModal] = useState<{ open: boolean; seller: string; phone: string } | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingContact, setPendingContact] = useState<{ seller: string; phone: string } | null>(null);

    const { user } = useAuth();
    const filteredListings = selectedBreed === 'All Breeds' ? listings : listings.filter(l => l.breed === selectedBreed);

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
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cattle Marketplace</h1>
                        <Link href="/home/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Buy or sell cows, bulls & buffaloes</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'}`}>
                            {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.title}</p>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select value={selectedBreed} onChange={(e) => setSelectedBreed(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    {breeds.map(b => <option key={b}>{b}</option>)}
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Price Range</option><option>Under ₹50K</option><option>₹50K-1L</option><option>Above ₹1L</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Location</option><option>Gujarat</option><option>Haryana</option><option>Punjab</option><option>Maharashtra</option>
                                </select>
                            </div>
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> cattle</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((l) => (
                                    <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span>Verified</div>}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{l.breed}</span>
                                                <span>•</span><span>{l.age}</span>
                                                {l.milkYield !== '-' && <><span>•</span><span>{l.milkYield}</span></>}
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-lg font-bold text-primary">{l.price}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{l.location.split(',')[0]}</p>
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
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-bold text-primary text-center mb-2">Sell Your Cattle</h2>
                                <p className="text-gray-500 text-center mb-8">Fill in the details to list your animal</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Breed</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"><option value="">Select Breed</option>{breeds.slice(1).map(b => <option key={b}>{b}</option>)}</select></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Age</label>
                                            <input type="text" placeholder="e.g. 3 Years" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Milk Yield (L/day)</label>
                                            <input type="text" placeholder="e.g. 12" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                                            <input type="text" placeholder="e.g. 85000" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                        <input type="text" placeholder="e.g. Rajkot, Gujarat" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                        <textarea placeholder="Describe your animal..." rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Photos</label>
                                        <div className="p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-center cursor-pointer hover:border-primary/50 transition-all">
                                            <span className="material-symbols-outlined text-3xl text-primary mb-1">add_photo_alternate</span>
                                            <p className="text-sm text-gray-500">Click to upload photos</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">publish</span>Publish Listing
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Modal (only shows if logged in) */}
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
