'use client';

import { useState } from 'react';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

type DurationType = 'hourly' | 'daily' | 'seasonal';
type ViewType = 'grid' | 'list';

const rentalListings = [
    { id: 1, name: 'MB Reversible Plough', brand: 'Fieldking', type: 'MB Plough', hp: '35-60 HP', location: 'Amritsar, Punjab', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', hourlyRate: '₹200', dailyRate: '₹1,200', seasonalRate: '₹9,000', availability: 'Available', owner: 'Punjab Farm Tools', rating: 4.7, reviews: 36, features: ['Tractor Compatible', 'Hydraulic Lift'] },
    { id: 2, name: 'Rotavator 7 Feet', brand: 'Lemken', type: 'Rotavator', hp: '45-75 HP', location: 'Ludhiana, Punjab', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', hourlyRate: '₹350', dailyRate: '₹2,200', seasonalRate: '₹18,000', availability: 'Available', owner: 'Kisan Implements Hub', rating: 4.9, reviews: 58, features: ['7ft Working Width', 'All Soil Types'] },
    { id: 3, name: 'Disc Harrow 20 Disc', brand: 'Shaktiman', type: 'Disc Harrow', hp: '35-55 HP', location: 'Karnal, Haryana', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', hourlyRate: '₹280', dailyRate: '₹1,700', seasonalRate: '₹13,000', availability: 'Booked till Mar 7', owner: 'Haryana Agri Equipment', rating: 4.6, reviews: 27, features: ['20 Disc', 'Heavy Duty'] },
    { id: 4, name: 'Seed Drill 7 Row', brand: 'Tirth Agro', type: 'Seed Drill', hp: '35-50 HP', location: 'Hissar, Haryana', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', hourlyRate: '₹400', dailyRate: '₹2,500', seasonalRate: '₹20,000', availability: 'Available', owner: 'Haryana Implements Hub', rating: 4.8, reviews: 44, features: ['7 Row Sowing', 'Seed & Fertilizer'] },
    { id: 5, name: 'Subsoiler 3 Tyne', brand: 'Maschio', type: 'Subsoiler', hp: '50-90 HP', location: 'Sangrur, Punjab', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', hourlyRate: '₹320', dailyRate: '₹2,000', seasonalRate: '₹15,000', availability: 'Available', owner: 'Punjab Deep Cultivators', rating: 4.5, reviews: 19, features: ['Deep Tillage', '3 Tyne'] },
    { id: 6, name: 'Laser Land Leveller', brand: 'Landforce', type: 'Laser Leveller', hp: '55-75 HP', location: 'Ferozepur, Punjab', image: 'https://images.unsplash.com/photo-1592805723127-004b174a1d03?w=400&h=300&fit=crop', hourlyRate: '₹500', dailyRate: '₹3,200', seasonalRate: '₹25,000', availability: 'Available', owner: 'Punjab Modern Farm', rating: 4.9, reviews: 72, features: ['GPS Precision', 'Water Saving'] },
];

const durationOptions: { id: DurationType; label: string; icon: string }[] = [
    { id: 'hourly', label: 'Hourly', icon: 'schedule' },
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'seasonal', label: 'Seasonal', icon: 'event_available' },
];

export default function RentImplementsPage() {
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
    const toggleCompare = (id: number) => setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length >= 3 ? prev : [...prev, id]);
    const compareItems = rentalListings.filter(i => compareIds.includes(i.id));

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="implements" currentAction="rent" />
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><span className="material-symbols-outlined text-primary text-2xl">handshake</span></div>
                    <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent Implements</h1><p className="text-sm text-gray-500">Hire ploughs, rotavators, seed drills & more</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[{ label: 'Available Now', value: '180+', icon: 'tools_wrench', color: 'text-primary' }, { label: 'Avg. Daily Rate', value: '₹2,000', icon: 'payments', color: 'text-blue-600' }, { label: 'Verified Owners', value: '90+', icon: 'verified', color: 'text-emerald-600' }].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                            <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1`}>{stat.icon}</span>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        {durationOptions.map(opt => (
                            <button key={opt.id} onClick={() => setDurationType(opt.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${durationType === opt.id ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <span className="material-symbols-outlined text-base">{opt.icon}</span>{opt.label}
                            </button>
                        ))}
                    </div>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium"><option>All Types</option><option>MB Plough</option><option>Rotavator</option><option>Disc Harrow</option><option>Seed Drill</option><option>Subsoiler</option><option>Laser Leveller</option></select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium"><option>All Locations</option><option>Punjab</option><option>Haryana</option><option>Uttar Pradesh</option><option>Rajasthan</option></select>
                    <div className="ml-auto flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        <button onClick={() => setViewType('grid')} className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-xl">grid_view</span></button>
                        <button onClick={() => setViewType('list')} className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-xl">view_list</span></button>
                    </div>
                </div>
                {compareIds.length > 0 && (
                    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary">compare</span>
                        <p className="text-sm font-semibold text-primary flex-1">{compareIds.length} implement{compareIds.length > 1 ? 's' : ''} selected</p>
                        {compareIds.length >= 2 && <button onClick={() => setShowCompareModal(true)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-sm">Compare Now</button>}
                        <button onClick={() => setCompareIds([])}><span className="material-symbols-outlined text-gray-500">close</span></button>
                    </div>
                )}
                {viewType === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rentalListings.map(item => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-lg transition-all group ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="relative h-44 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${item.availability === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{item.availability}</span>
                                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{item.type}</span>
                                    <button onClick={() => toggleCompare(item.id)} className={`absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${compareIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-white/20 border-white/50 backdrop-blur-sm'}`}>{compareIds.includes(item.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}</button>
                                    <div className="absolute bottom-3 left-3 flex gap-1">{item.features.slice(0, 2).map(f => <span key={f} className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full border border-white/30">{f}</span>)}</div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div><h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3><p className="text-xs text-gray-500">{item.hp} tractor • {item.brand}</p></div>
                                        <p className="text-lg font-black text-primary">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><span className="material-symbols-outlined text-sm">location_on</span>{item.location}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3"><span className="material-symbols-outlined text-sm">person</span>{item.owner}<span className="ml-auto flex items-center gap-0.5 text-amber-500 font-semibold"><span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})</span></div>
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${item.availability === 'Available' ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>{item.availability === 'Available' ? 'Book Now' : item.availability}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {viewType === 'list' && (
                    <div className="flex flex-col gap-3">
                        {rentalListings.map(item => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl border-2 shadow-sm hover:shadow-md flex gap-4 p-4 transition-all ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div><h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3><p className="text-xs text-gray-500">{item.type} • {item.brand} • {item.hp} tractor</p></div>
                                        <p className="text-xl font-black text-primary shrink-0">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1.5 mb-2">{item.features.map(f => <span key={f} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>)}</div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500"><span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{item.location}</span><span className="flex items-center gap-0.5 text-amber-500 ml-auto"><span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})</span></div>
                                </div>
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'} className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap ${item.availability === 'Available' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>{item.availability === 'Available' ? 'Book Now' : 'Booked'}</button>
                                    <button onClick={() => toggleCompare(item.id)} className={`w-full text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${compareIds.includes(item.id) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary'}`}>{compareIds.includes(item.id) ? '✓ Comparing' : '+ Compare'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showCompareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCompareModal(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Compare Implements</h2><button onClick={() => setShowCompareModal(false)}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareItems.length}, 1fr)` }}>
                                {compareItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                                        <div className="p-4"><h3 className="font-bold text-gray-900 dark:text-white mb-3">{item.name}</h3>
                                            {[{ label: 'Brand', value: item.brand }, { label: 'Type', value: item.type }, { label: 'Compatible HP', value: item.hp }, { label: 'Daily Rate', value: item.dailyRate + '/day' }, { label: 'Hourly Rate', value: item.hourlyRate + '/hr' }, { label: 'Season Rate', value: item.seasonalRate + '/season' }, { label: 'Location', value: item.location }, { label: 'Rating', value: `${item.rating} ★` }, { label: 'Status', value: item.availability }].map(row => (
                                                <div key={row.label} className="mb-2"><p className="text-xs text-gray-400 uppercase tracking-wide">{row.label}</p><p className="text-sm font-semibold text-gray-800 dark:text-white">{row.value}</p></div>
                                            ))}
                                            <button onClick={() => { setSelectedItem(item); setShowCompareModal(false); setShowBookingForm(true); }} className="w-full mt-3 py-2 bg-primary text-white font-bold rounded-xl text-sm">Book This</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {showBookingForm && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingForm(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Book Implement</h2><button onClick={() => setShowBookingForm(false)}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                            <div className="bg-primary/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div><p className="font-bold text-gray-900 dark:text-white">{selectedItem.name}</p><p className="text-sm text-gray-500">{selectedItem.type} • {selectedItem.owner}</p><p className="text-primary font-bold">{getRateLabel(selectedItem)}</p></div>
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
