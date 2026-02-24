'use client';

import { useState } from 'react';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

type DurationType = 'hourly' | 'daily' | 'weekly';
type ViewType = 'grid' | 'list';

const rentalListings = [
    { id: 1, name: 'JCB 3DX Backhoe Loader', brand: 'JCB', type: 'Backhoe Loader', hp: '76 HP', location: 'Mumbai, Maharashtra', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop', hourlyRate: '₹1,800', dailyRate: '₹12,000', weeklyRate: '₹72,000', availability: 'Available', owner: 'Mumbai Machinery Hub', rating: 4.8, reviews: 45, features: ['With Operator', 'Fuel Included'] },
    { id: 2, name: 'JCB 4DX Xtra Super', brand: 'JCB', type: 'Backhoe Loader', hp: '92 HP', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop', hourlyRate: '₹2,200', dailyRate: '₹15,000', weeklyRate: '₹90,000', availability: 'Available', owner: 'Deccan Heavy Works', rating: 4.9, reviews: 63, features: ['With Operator', 'Fuel Included', 'Insurance'] },
    { id: 3, name: 'L&T Komatsu PC130', brand: 'Komatsu', type: 'Excavator', hp: '95 HP', location: 'Bangalore, Karnataka', image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400&h=300&fit=crop', hourlyRate: '₹2,500', dailyRate: '₹18,000', weeklyRate: '₹1,10,000', availability: 'Booked till Mar 8', owner: 'Karnataka Infra Co.', rating: 4.7, reviews: 38, features: ['With Operator'] },
    { id: 4, name: 'Caterpillar 424B2', brand: 'Caterpillar', type: 'Backhoe Loader', hp: '86 HP', location: 'Chennai, Tamil Nadu', image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop', hourlyRate: '₹2,000', dailyRate: '₹14,000', weeklyRate: '₹82,000', availability: 'Available', owner: 'TN Heavy Equipment', rating: 4.6, reviews: 29, features: ['With Operator', 'Fuel Included'] },
    { id: 5, name: 'Tata Hitachi EX110', brand: 'Tata Hitachi', type: 'Excavator', hp: '82 HP', location: 'Hyderabad, Telangana', image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop', hourlyRate: '₹2,300', dailyRate: '₹16,000', weeklyRate: '₹95,000', availability: 'Available', owner: 'Telangana Machines', rating: 4.7, reviews: 52, features: ['With Operator', 'Insurance'] },
    { id: 6, name: 'JCB Skid Steer 155', brand: 'JCB', type: 'Skid Steer Loader', hp: '49 HP', location: 'Nagpur, Maharashtra', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop', hourlyRate: '₹1,400', dailyRate: '₹9,500', weeklyRate: '₹55,000', availability: 'Available', owner: 'Vidarbha Equipment', rating: 4.5, reviews: 21, features: ['With Operator'] },
];

const durationOptions: { id: DurationType; label: string; icon: string }[] = [
    { id: 'hourly', label: 'Hourly', icon: 'schedule' },
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'weekly', label: 'Weekly', icon: 'date_range' },
];

export default function RentJCBPage() {
    const [durationType, setDurationType] = useState<DurationType>('daily');
    const [viewType, setViewType] = useState<ViewType>('grid');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<typeof rentalListings[0] | null>(null);
    const [compareIds, setCompareIds] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const getRateLabel = (item: typeof rentalListings[0]) => {
        if (durationType === 'hourly') return item.hourlyRate + '/hr';
        if (durationType === 'daily') return item.dailyRate + '/day';
        return item.weeklyRate + '/week';
    };

    const toggleCompare = (id: number) => {
        setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length >= 3 ? prev : [...prev, id]);
    };

    const compareItems = rentalListings.filter(i => compareIds.includes(i.id));

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="jcb" currentAction="rent" />

                <div className="mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent JCB & Excavators</h1>
                        <p className="text-sm text-gray-500">Hire heavy equipment by hour, day, or week</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Available Now', value: '45+', icon: 'front_loader', color: 'text-primary' },
                        { label: 'Avg. Daily Rate', value: '₹14,000', icon: 'payments', color: 'text-blue-600' },
                        { label: 'Verified Operators', value: '30+', icon: 'verified', color: 'text-emerald-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                            <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1`}>{stat.icon}</span>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        {durationOptions.map((opt) => (
                            <button key={opt.id} onClick={() => setDurationType(opt.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${durationType === opt.id ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <span className="material-symbols-outlined text-base">{opt.icon}</span>{opt.label}
                            </button>
                        ))}
                    </div>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                        <option>All Types</option><option>Backhoe Loader</option><option>Excavator</option><option>Skid Steer</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                        <option>All Locations</option><option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>Telangana</option>
                    </select>
                    <div className="ml-auto flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
                        <button onClick={() => setViewType('grid')} className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        </button>
                        <button onClick={() => setViewType('list')} className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>
                            <span className="material-symbols-outlined text-xl">view_list</span>
                        </button>
                    </div>
                </div>

                {compareIds.length > 0 && (
                    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary">compare</span>
                        <p className="text-sm font-semibold text-primary flex-1">{compareIds.length} machine{compareIds.length > 1 ? 's' : ''} selected for comparison</p>
                        {compareIds.length >= 2 && <button onClick={() => setShowCompareModal(true)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-sm">Compare Now</button>}
                        <button onClick={() => setCompareIds([])}><span className="material-symbols-outlined text-gray-500">close</span></button>
                    </div>
                )}

                {viewType === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rentalListings.map((item) => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border-2 transition-all shadow-sm hover:shadow-lg group ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="relative h-44 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${item.availability === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{item.availability}</span>
                                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{item.type}</span>
                                    <button onClick={() => toggleCompare(item.id)} className={`absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${compareIds.includes(item.id) ? 'bg-primary border-primary' : 'bg-white/20 border-white/50 backdrop-blur-sm'}`}>
                                        {compareIds.includes(item.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                    </button>
                                    <div className="absolute bottom-3 left-3 flex gap-1">
                                        {item.features.slice(0, 2).map((f) => <span key={f} className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full border border-white/30">{f}</span>)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div><h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3><p className="text-xs text-gray-500">{item.hp} • {item.brand}</p></div>
                                        <p className="text-lg font-black text-primary">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><span className="material-symbols-outlined text-sm">location_on</span>{item.location}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3"><span className="material-symbols-outlined text-sm">person</span>{item.owner}<span className="ml-auto flex items-center gap-0.5 text-amber-500 font-semibold"><span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})</span></div>
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'}
                                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${item.availability === 'Available' ? 'bg-primary hover:bg-primary/90 text-white active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                                        {item.availability === 'Available' ? 'Book Now' : item.availability}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewType === 'list' && (
                    <div className="flex flex-col gap-3">
                        {rentalListings.map((item) => (
                            <div key={item.id} className={`bg-white dark:bg-[#1a231a] rounded-2xl border-2 transition-all shadow-sm hover:shadow-md flex gap-4 p-4 ${compareIds.includes(item.id) ? 'border-primary' : 'border-gray-100 dark:border-gray-800'}`}>
                                <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div><h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3><p className="text-xs text-gray-500">{item.hp} • {item.brand} • {item.type}</p></div>
                                        <p className="text-xl font-black text-primary shrink-0">{getRateLabel(item)}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                                        {item.features.map(f => <span key={f} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{item.location}</span>
                                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold ml-auto"><span className="material-symbols-outlined text-sm">star</span>{item.rating} ({item.reviews})</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <button onClick={() => { setSelectedItem(item); setShowBookingForm(true); }} disabled={item.availability !== 'Available'}
                                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap ${item.availability === 'Available' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                                        {item.availability === 'Available' ? 'Book Now' : 'Booked'}
                                    </button>
                                    <button onClick={() => toggleCompare(item.id)} className={`w-full text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${compareIds.includes(item.id) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary'}`}>
                                        {compareIds.includes(item.id) ? '✓ Comparing' : '+ Compare'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showCompareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCompareModal(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare JCB & Excavators</h2><button onClick={() => setShowCompareModal(false)}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareItems.length}, 1fr)` }}>
                                {compareItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">{item.name}</h3>
                                            {[{ label: 'Brand', value: item.brand }, { label: 'Power', value: item.hp }, { label: 'Type', value: item.type }, { label: 'Daily Rate', value: item.dailyRate + '/day' }, { label: 'Hourly Rate', value: item.hourlyRate + '/hr' }, { label: 'Weekly Rate', value: item.weeklyRate + '/week' }, { label: 'Location', value: item.location }, { label: 'Owner', value: item.owner }, { label: 'Rating', value: `${item.rating} ★` }, { label: 'Status', value: item.availability }].map(row => (
                                                <div key={row.label} className="mb-2"><p className="text-xs text-gray-400 uppercase tracking-wide">{row.label}</p><p className="text-sm font-semibold text-gray-800 dark:text-white">{row.value}</p></div>
                                            ))}
                                            <button onClick={() => { setSelectedItem(item); setShowCompareModal(false); setShowBookingForm(true); }} className="w-full mt-3 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90">Book This</button>
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
                            <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Book JCB Rental</h2><button onClick={() => setShowBookingForm(false)}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                            <div className="bg-primary/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div><p className="font-bold text-gray-900 dark:text-white">{selectedItem.name}</p><p className="text-sm text-gray-500">{selectedItem.hp} • {selectedItem.owner}</p><p className="text-primary font-bold">{getRateLabel(selectedItem)}</p></div>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <input type="tel" placeholder="Mobile Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                    <input type="date" className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <input type="text" placeholder="Work Location / Site Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary" />
                                <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors">Confirm Booking</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
