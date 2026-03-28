'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { useBookingSubmit } from '@/lib/useBookingSubmit';

type TabType = 'browse' | 'list';

const rentalListings = [
    {
        id: 1,
        title: '5 Acres Irrigated Land – Seasonal Rent',
        location: 'Mandya, Karnataka',
        area: '5 Acres',
        rentPrice: '₹15,000/acre/season',
        period: 'Kharif Season',
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['Canal Water', 'Road Access', 'Leveled Land'],
        owner: 'Ravi Kumar S',
        postedDate: '2 days ago',
    },
    {
        id: 2,
        title: '3 Acres Paddy Field – Short Term',
        location: 'Hassan, Karnataka',
        area: '3 Acres',
        rentPrice: '₹12,000/acre/season',
        period: 'Rabi Season',
        type: 'Paddy',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['Borewell', 'Fertile Soil', 'Nearby Market'],
        owner: 'Gowda H M',
        postedDate: '5 days ago',
    },
    {
        id: 3,
        title: '8 Acres Dry Land – Annual Rent',
        location: 'Tumkur, Karnataka',
        area: '8 Acres',
        rentPrice: '₹8,000/acre/season',
        period: 'Annual',
        type: 'Dry Land',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        verified: false,
        featured: false,
        amenities: ['Open Well', 'Fencing', 'Electricity'],
        owner: 'Venkatesh R',
        postedDate: '1 week ago',
    },
    {
        id: 4,
        title: '2 Acres Vegetable Farm – Monthly Rent',
        location: 'Kolar, Karnataka',
        area: '2 Acres',
        rentPrice: '₹5,000/acre/month',
        period: 'Monthly',
        type: 'Agriculture',
        image: 'https://images.unsplash.com/photo-1591543620767-582b2e76369e?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['Drip Irrigation', 'Poly House', 'Cold Storage'],
        owner: 'Manjunath D',
        postedDate: '3 days ago',
    },
    {
        id: 5,
        title: '10 Acres Sugarcane Field – Seasonal',
        location: 'Belgaum, Karnataka',
        area: '10 Acres',
        rentPrice: '₹20,000/acre/season',
        period: 'Kharif Season',
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['River Nearby', 'Tractor Access', 'Flat Terrain'],
        owner: 'Shivaraj B',
        postedDate: '4 days ago',
    },
];

const periodFilters = ['All', 'Monthly', 'Kharif Season', 'Rabi Season', 'Annual'];

export default function RentFarmLandPage() {
    const [activeTab, setActiveTab] = useState<TabType>('browse');
    const [activePeriod, setActivePeriod] = useState('All');
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        area: '',
        rentPrice: '',
        period: '',
        description: '',
        contactName: '',
        contactPhone: '',
    });
    const { submit, submitting } = useBookingSubmit();

    const filteredListings = activePeriod === 'All'
        ? rentalListings
        : rentalListings.filter((l) => l.period === activePeriod);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Land title is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.area.trim()) newErrors.area = 'Area is required';
        else if (isNaN(Number(formData.area))) newErrors.area = 'Enter a valid number';
        if (!formData.rentPrice.trim()) newErrors.rentPrice = 'Rent price is required';
        if (!formData.period) newErrors.period = 'Rental period is required';
        if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.contactPhone.replace(/[\s+-]/g, '').slice(-10))) newErrors.contactPhone = 'Enter a valid 10-digit phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const newPhotos: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files) {
            if (photos.length + newPhotos.length >= 3) {
                alert('Maximum 3 photos allowed');
                break;
            }
            if (file.size > maxSize) {
                alert(`${file.name} exceeds 5MB limit`);
                continue;
            }
            newPhotos.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setPhotos([...photos, ...newPhotos]);
        setPreviews([...previews, ...newPreviews]);
    };

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        URL.revokeObjectURL(previews[index]);
        setPhotos(newPhotos);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const result = await submit({
            module: 'land',
            category: 'rent',
            full_name: formData.contactName,
            phone: formData.contactPhone,
            location: formData.location,
            extra_data: {
                title: formData.title,
                area: formData.area,
                rent_price: formData.rentPrice,
                period: formData.period,
                description: formData.description,
            },
        });
        if (result.success) {
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 6000);
        } else {
            setErrors({ submit: result.error || 'Failed to submit' });
        }
    };

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Rent</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Rent Farm Land
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            Short-term and seasonal farm land rentals near you
                        </p>
                    </div>
                    <NearbyLocation />
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                    {[
                        { id: 'browse' as TabType, title: 'Browse Rental Land', icon: 'search', bgColor: 'bg-orange-500' },
                        { id: 'list' as TabType, title: 'List Land for Rent', icon: 'add_circle', bgColor: 'bg-amber-600' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-2xl font-bold transition-all text-center md:text-left ${activeTab === tab.id
                                    ? `${tab.bgColor} text-white shadow-lg`
                                    : 'bg-white dark:bg-[#1a231a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/30'
                                }`}
                        >
                            <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl mx-auto md:mx-0 flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className="material-symbols-outlined text-lg md:text-xl">{tab.icon}</span>
                            </div>
                            <span className="text-xs md:text-sm">{tab.title}</span>
                        </button>
                    ))}
                </div>

                {/* Browse Tab */}
                {activeTab === 'browse' && (
                    <div className="animate-fadeIn">
                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-orange-100 dark:border-orange-900/30">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-orange-600 text-xl md:text-2xl mt-0.5">tips_and_updates</span>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-orange-800 dark:text-orange-300 mb-1">Flexible Rental Options</h3>
                                    <p className="text-xs md:text-sm text-orange-700/80 dark:text-orange-400/80">
                                        Rent farm land on monthly, seasonal, or annual basis. Ideal for seasonal crops, contract farming, or trying new farming areas without long-term commitment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Period Filters */}
                        <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 no-scrollbar">
                            {periodFilters.map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setActivePeriod(period)}
                                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${activePeriod === period
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary/10'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>

                        {/* Count */}
                        <p className="text-xs md:text-sm text-gray-500 mb-4">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredListings.length}</span> rental listings
                        </p>

                        {/* Listings Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {filteredListings.map((listing) => (
                                <div key={listing.id} className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-40 md:h-48 overflow-hidden">
                                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {listing.featured && (
                                            <span className="absolute top-2 md:top-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-amber-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md">
                                                Featured
                                            </span>
                                        )}
                                        {listing.verified && (
                                            <span className="absolute top-2 md:top-3 right-2 md:right-3 px-2 py-0.5 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">verified</span>
                                                Verified
                                            </span>
                                        )}
                                        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-orange-600/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg">
                                            {listing.period}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 md:p-5">
                                        <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {listing.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                                            <span className="material-symbols-outlined text-sm md:text-base">location_on</span>
                                            {listing.location}
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-sm">square_foot</span>
                                                {listing.area}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                                {listing.owner}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                                            {listing.amenities.map((amenity, i) => (
                                                <span key={i} className="px-1.5 md:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs rounded-md font-medium">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-base md:text-xl font-bold text-primary">{listing.rentPrice}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500">{listing.type} • {listing.postedDate}</p>
                                            </div>
                                            <button className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors">
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="text-center py-12 md:py-16">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-gray-300 mb-2 block">search_off</span>
                                <p className="text-sm md:text-base text-gray-500 font-medium">No rental listings found for this period</p>
                                <button onClick={() => setActivePeriod('All')} className="mt-3 text-primary text-xs md:text-sm font-bold hover:underline">View All Listings</button>
                            </div>
                        )}
                    </div>
                )}

                {/* List Your Land Tab */}
                {activeTab === 'list' && (
                    <div className="animate-fadeIn max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">List Your Land for Rent</h2>
                            <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8">Quick & easy listing for short-term farm land rentals</p>

                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 5 Acres Irrigated Field" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Mandya, Karnataka" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.location ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Area (Acres)</label>
                                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 5" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.area ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rent Price</label>
                                        <input type="text" name="rentPrice" value={formData.rentPrice} onChange={handleChange} placeholder="e.g. ₹15,000/acre/season" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.rentPrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.rentPrice && <p className="text-red-500 text-xs mt-1">{errors.rentPrice}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rental Period</label>
                                        <select name="period" value={formData.period} onChange={handleChange} className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.period ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`}>
                                            <option value="">Select Period</option>
                                            <option>Monthly</option>
                                            <option>Kharif Season</option>
                                            <option>Rabi Season</option>
                                            <option>Annual</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your land — soil type, irrigation, nearby facilities, suitable crops..." className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base resize-none" />
                                </div>

                                <>
                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Land Photos ({photos.length}/3)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={photos.length >= 3}
                                        className="hidden"
                                        id="photoInputRent"
                                    />
                                    <label
                                        htmlFor="photoInputRent"
                                        className={`block border-2 border-dashed rounded-lg md:rounded-2xl p-4 md:p-8 text-center ${photos.length >= 3
                                                ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                : 'border-gray-300 dark:border-gray-700 hover:border-primary cursor-pointer transition-colors'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-400 mb-1 md:mb-2 block">add_a_photo</span>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">{photos.length >= 3 ? 'Max 3 photos reached' : 'Upload land photos'}</p>
                                        <p className="text-[10px] md:text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each • Max 3 photos</p>
                                    </label>
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative group rounded-lg md:rounded-xl overflow-hidden">
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 md:h-40 object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-white text-3xl">delete</span>
                                                    </button>
                                                    <span className="absolute top-1 md:top-2 right-1 md:right-2 px-1.5 md:px-2 py-0.5 bg-black/70 text-white text-[10px] md:text-xs font-bold rounded-md">
                                                        {index + 1}/3
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Full Name" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.contactName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.contactPhone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                                    </div>
                                </div>

                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                                <button type="submit" disabled={!agreedToTerms} className={`w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2 ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <span className="material-symbols-outlined text-lg md:text-xl">publish</span>
                                    Submit Rental Listing
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSuccessModal(false)}>
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                            <div className="text-center">
                                <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-3xl md:text-4xl text-white">check</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Rental Listing Created!</h2>
                                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-bold mb-1">Awesome! 🎉</p>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">Your land rental listing has been submitted successfully. Our team will connect you with interested farmers looking for land to rent.</p>
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 mb-4">
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">📞 Our team will contact you shortly</p>
                                </div>
                                <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        </div>
    );
}
