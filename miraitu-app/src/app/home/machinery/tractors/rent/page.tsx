'use client';

import { useState } from 'react';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

type DurationType = 'hourly' | 'daily' | 'seasonal';
type ViewType = 'grid' | 'list';

const rentalListings = [
    {
        id: 1,
        name: 'Mahindra Yuvo 575 DI',
        hp: '45 HP',
        brand: 'Mahindra',
        type: 'Utility Tractor',
        location: 'Pune, Maharashtra',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        hourlyRate: '₹450',
        dailyRate: '₹2,800',
        seasonalRate: '₹32,000',
        availability: 'Available',
        owner: 'Raju Farm Services',
        rating: 4.8,
        reviews: 34,
        features: ['With Operator', 'Fuel Included', 'Insurance Covered'],
    },
    {
        id: 2,
        name: 'John Deere 5050E',
        hp: '50 HP',
        brand: 'John Deere',
        type: 'Utility Tractor',
        location: 'Nashik, Maharashtra',
        image: 'https://images.unsplash.com/photo-1589771145485-d2e7e9b9de35?w=400&h=300&fit=crop',
        hourlyRate: '₹520',
        dailyRate: '₹3,200',
        seasonalRate: '₹38,000',
        availability: 'Available',
        owner: 'Green Fields Rentals',
        rating: 4.9,
        reviews: 52,
        features: ['With Operator', 'Insurance Covered'],
    },
    {
        id: 3,
        name: 'Swaraj 744 FE',
        hp: '48 HP',
        brand: 'Swaraj',
        type: 'Farm Tractor',
        location: 'Belgaum, Karnataka',
        image: 'https://images.unsplash.com/photo-1592805723127-004b174a1d03?w=400&h=300&fit=crop',
        hourlyRate: '₹400',
        dailyRate: '₹2,500',
        seasonalRate: '₹28,000',
        availability: 'Booked till Mar 5',
        owner: 'Punjab Agri Rentals',
        rating: 4.6,
        reviews: 21,
        features: ['Self Drive', 'Fuel Extra'],
    },
    {
        id: 4,
        name: 'Sonalika Tiger DI 60',
        hp: '60 HP',
        brand: 'Sonalika',
        type: 'Heavy Duty Tractor',
        location: 'Ludhiana, Punjab',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop',
        hourlyRate: '₹580',
        dailyRate: '₹3,600',
        seasonalRate: '₹42,000',
        availability: 'Available',
        owner: 'KisanPro Services',
        rating: 4.7,
        reviews: 41,
        features: ['With Operator', 'Fuel Included', 'GPS Tracking'],
    },
    {
        id: 5,
        name: 'Kubota MU4501',
        hp: '45 HP',
        brand: 'Kubota',
        type: 'Utility Tractor',
        location: 'Coimbatore, Tamil Nadu',
        image: 'https://images.pexels.com/photos/4394883/pexels-photo-4394883.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        hourlyRate: '₹470',
        dailyRate: '₹2,900',
        seasonalRate: '₹34,000',
        availability: 'Available',
        owner: 'Tamil Agri Hub',
        rating: 4.5,
        reviews: 18,
        features: ['With Operator', 'Insurance Covered'],
    },
    {
        id: 6,
        name: 'New Holland 3630 TX Plus',
        hp: '55 HP',
        brand: 'New Holland',
        type: 'Utility Tractor',
        location: 'Sangli, Maharashtra',
        image: 'https://images.pexels.com/photos/2332736/pexels-photo-2332736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        hourlyRate: '₹500',
        dailyRate: '₹3,100',
        seasonalRate: '₹36,000',
        availability: 'Available',
        owner: 'Deccan Farm Rentals',
        rating: 4.8,
        reviews: 29,
        features: ['With Operator', 'Fuel Included'],
    },
];

const durationOptions: { id: DurationType; label: string; icon: string }[] = [
    { id: 'hourly', label: 'Hourly', icon: 'schedule' },
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'seasonal', label: 'Seasonal', icon: 'event_available' },
];

export default function RentTractorsPage() {
    const [durationType, setDurationType] = useState<DurationType>('daily');
    const [viewType, setViewType] = useState<ViewType>('grid');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<typeof rentalListings[0] | null>(null);
    const [compareIds, setCompareIds] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const getRateLabel = (item: typeof rentalListings[0]) => {
        if (durationType === 'hourly') return item.hourlyRate + '/hr';
        if (durationType === 'daily') return item.dailyRate + '/day';
        return item.seasonalRate + '/season';
    };

    const toggleCompare = (id: number) => {
        setCompareIds(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const compareItems = rentalListings.filter(i => compareIds.includes(i.id));

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="tractors" currentAction="rent" />

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent Tractors</h1>
                        <p className="text-sm text-gray-500">Hire tractors by hour, day, or season</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Available Now', value: '120+', icon: 'agriculture', color: 'text-primary' },
                        { label: 'Avg. Daily Rate', value: '₹2,800', icon: 'payments', color: 'text-blue-600' },
                        { label: 'Verified Owners', value: '85+', icon: 'verified', color: 'text-emerald-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                            <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1`}>{stat.icon}</span>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Duration Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        {durationOptions.map((opt) => (
                            <button key={opt.id} onClick={() => setDurationType(opt.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${durationType === opt.id ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <span className="material-symbols-outlined text-base">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                        <option>All Locations</option>
                        <option>Maharashtra</option><option>Karnataka</option><option>Punjab</option><option>Tamil Nadu</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                        <option>All Brands</option>
                        <option>Mahindra</option><option>John Deere</option><option>Swaraj</option><option>Sonalika</option><option>Kubota</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                        <option>HP Range</option>
                        <option>25-35 HP</option><option>35-50 HP</option><option>50-65 HP</option><option>65+ HP</option>
                    </select>

                    {/* View Toggle */}
                    <div className="ml-auto flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        <button onClick={() => setViewType('grid')} className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        </button>
                        <button onClick={() => setViewType('list')} className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>
                            <span className="material-symbols-outlined text-xl">view_list</span>
                        </button>
                    </div>
                </div>

                {/* Compare Bar */}
                {compareIds.length > 0 && (
                    <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary">compare</span>
                        <p className="text-sm font-semibold text-primary flex-1">{compareIds.length} tractor{compareIds.length > 1 ? 's' : ''} selected for comparison</p>
                        {compareIds.length >= 2 && (
                            <button onClick={() => setShowCompareModal(true)} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-colors">
                                Compare Now
                            </button>
                        )}
                        <button onClick={() => setCompareIds([])} className="text-gray-500 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                )}

                {/* Grid View */}
                {viewType === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rentalListings.map((item) => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border-2 transition-all duration-300 group shadow-sm hover:shadow-lg ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="relative h-44 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${item.availability === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{item.availability}</span>
                                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{item.type}</span>
                                    {/* Compare Checkbox */}
                                    <button onClick={() => toggleCompare(item.id)} className={`absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${compareIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-white/20 border-white/50 backdrop-blur-sm'}`}>
                                        {compareIds.includes(item.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                    </button>
                                    <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                                        {item.features.slice(0, 2).map((f) => (
                                            <span key={f} className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full border border-white/30">{f}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                                            <p className="text-xs text-gray-500">{item.hp} • {item.brand}</p>
                                        </div>
                                        <p className="text-lg font-black text-primary">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span>{item.location}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                        <span className="material-symbols-outlined text-sm">person</span>{item.owner}
                                        <span className="ml-auto flex items-center gap-0.5 text-amber-500 font-semibold">
                                            <span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})
                                        </span>
                                    </div>
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'}
                                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${item.availability === 'Available' ? 'bg-primary hover:bg-primary/90 text-white active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                                        {item.availability === 'Available' ? 'Book Now' : item.availability}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewType === 'list' && (
                    <div className="flex flex-col gap-3">
                        {rentalListings.map((item) => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md flex gap-4 p-4 ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.availability === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{item.availability === 'Available' ? '✓' : '●'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                            <p className="text-xs text-gray-500">{item.hp} • {item.brand} • {item.type}</p>
                                        </div>
                                        <p className="text-xl font-black text-primary shrink-0">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                                        {item.features.map((f) => (
                                            <span key={f} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{item.location}</span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span>{item.owner}</span>
                                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold ml-auto">
                                            <span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'}
                                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${item.availability === 'Available' ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                                        {item.availability === 'Available' ? 'Book Now' : 'Booked'}
                                    </button>
                                    <button onClick={() => toggleCompare(item.id)}
                                        className={`w-full text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${compareIds.includes(item.id) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary'}`}>
                                        {compareIds.includes(item.id) ? '✓ Comparing' : '+ Compare'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Compare Modal */}
                {showCompareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCompareModal(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare Tractors</h2>
                                <button onClick={() => setShowCompareModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareItems.length}, 1fr)` }}>
                                {compareItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">{item.name}</h3>
                                            {[
                                                { label: 'Brand', value: item.brand },
                                                { label: 'Power', value: item.hp },
                                                { label: 'Daily Rate', value: item.dailyRate + '/day' },
                                                { label: 'Hourly Rate', value: item.hourlyRate + '/hr' },
                                                { label: 'Season Rate', value: item.seasonalRate + '/season' },
                                                { label: 'Location', value: item.location },
                                                { label: 'Owner', value: item.owner },
                                                { label: 'Rating', value: `${item.rating} ★ (${item.reviews} reviews)` },
                                                { label: 'Status', value: item.availability },
                                            ].map(row => (
                                                <div key={row.label} className="mb-2">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{row.label}</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{row.value}</p>
                                                </div>
                                            ))}
                                            <button onClick={() => { setSelectedItem(item); setShowCompareModal(false); setShowBookingForm(true); }} className="w-full mt-3 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors">Book This</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Modal */}
                {showBookingForm && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingForm(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Book Tractor Rental</h2>
                                <button onClick={() => setShowBookingForm(false)}><span className="material-symbols-outlined text-gray-400">close</span></button>
                            </div>
                            <div className="bg-primary/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{selectedItem.name}</p>
                                    <p className="text-sm text-gray-500">{selectedItem.hp} • {selectedItem.owner}</p>
                                    <p className="text-primary font-bold">{getRateLabel(selectedItem)}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <input type="tel" placeholder="Mobile Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                    <input type="date" className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <input type="text" placeholder="Field Location / Village" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors">Confirm Booking</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
