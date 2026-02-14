'use client';

import Link from 'next/link';
import { useState } from 'react';

const cropCategories = [
    {
        name: 'Food Grains',
        emoji: '🌾',
        color: 'from-amber-500 to-yellow-600',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-300',
        items: ['Rice', 'Wheat', 'Maize (Corn)', 'Barley', 'Millets (Jowar, Bajra, Ragi)']
    },
    {
        name: 'Pulses (Dal)',
        emoji: '🫘',
        color: 'from-orange-500 to-red-500',
        lightBg: 'bg-orange-50 dark:bg-orange-900/15',
        border: 'border-orange-200 dark:border-orange-800/40',
        text: 'text-orange-700 dark:text-orange-300',
        items: ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chana (Bengal Gram)', 'Masoor Dal']
    },
    {
        name: 'Oil Seeds',
        emoji: '🌻',
        color: 'from-yellow-500 to-amber-600',
        lightBg: 'bg-yellow-50 dark:bg-yellow-900/15',
        border: 'border-yellow-200 dark:border-yellow-800/40',
        text: 'text-yellow-700 dark:text-yellow-300',
        items: ['Groundnut', 'Sunflower', 'Mustard', 'Sesame (Til)', 'Soybean', 'Castor']
    },
    {
        name: 'Fruits',
        emoji: '🍎',
        color: 'from-red-500 to-pink-500',
        lightBg: 'bg-red-50 dark:bg-red-900/15',
        border: 'border-red-200 dark:border-red-800/40',
        text: 'text-red-700 dark:text-red-300',
        items: ['Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate', 'Papaya', 'Watermelon']
    },
    {
        name: 'Vegetables',
        emoji: '🥦',
        color: 'from-green-500 to-emerald-600',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Chilli', 'Cabbage', 'Cauliflower', 'Carrot', 'Beans']
    },
    {
        name: 'Spices & Condiments',
        emoji: '🌿',
        color: 'from-teal-500 to-emerald-600',
        lightBg: 'bg-teal-50 dark:bg-teal-900/15',
        border: 'border-teal-200 dark:border-teal-800/40',
        text: 'text-teal-700 dark:text-teal-300',
        items: ['Turmeric', 'Coriander', 'Cumin', 'Pepper', 'Cardamom', 'Cloves']
    },
    {
        name: 'Commercial / Cash Crops',
        emoji: '🌱',
        color: 'from-emerald-500 to-green-700',
        lightBg: 'bg-emerald-50 dark:bg-emerald-900/15',
        border: 'border-emerald-200 dark:border-emerald-800/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        items: ['Cotton', 'Sugarcane', 'Tobacco', 'Jute', 'Tea', 'Coffee']
    },
    {
        name: 'Fodder Crops',
        emoji: '🌾',
        color: 'from-lime-500 to-green-600',
        lightBg: 'bg-lime-50 dark:bg-lime-900/15',
        border: 'border-lime-200 dark:border-lime-800/40',
        text: 'text-lime-700 dark:text-lime-300',
        items: ['Napier Grass', 'Lucerne (Alfalfa)', 'Fodder Maize']
    },
    {
        name: 'Plantation Crops',
        emoji: '🌿',
        color: 'from-green-600 to-teal-700',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Coconut', 'Arecanut', 'Rubber']
    },
    {
        name: 'Flowers (Floriculture)',
        emoji: '🌸',
        color: 'from-pink-500 to-rose-600',
        lightBg: 'bg-pink-50 dark:bg-pink-900/15',
        border: 'border-pink-200 dark:border-pink-800/40',
        text: 'text-pink-700 dark:text-pink-300',
        items: ['Rose', 'Jasmine', 'Marigold', 'Lily']
    },
    {
        name: 'Cereals (Additional)',
        emoji: '🌾',
        color: 'from-amber-600 to-yellow-700',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-300',
        items: ['Oats', 'Rye', 'Foxtail Millet', 'Little Millet', 'Kodo Millet']
    },
    {
        name: 'Leafy Vegetables (Greens)',
        emoji: '🌿',
        color: 'from-green-500 to-lime-600',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Spinach', 'Fenugreek Leaves (Methi)', 'Amaranthus', 'Curry Leaves', 'Coriander Leaves', 'Mint']
    },
    {
        name: 'Nuts & Dry Fruits',
        emoji: '🥜',
        color: 'from-amber-700 to-yellow-800',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-800 dark:text-amber-300',
        items: ['Almond', 'Cashew', 'Walnut', 'Pistachio', 'Dates']
    },
    {
        name: 'Root & Tuber Crops',
        emoji: '🥔',
        color: 'from-yellow-700 to-orange-700',
        lightBg: 'bg-yellow-50 dark:bg-yellow-900/15',
        border: 'border-yellow-200 dark:border-yellow-800/40',
        text: 'text-yellow-800 dark:text-yellow-300',
        items: ['Sweet Potato', 'Tapioca (Cassava)', 'Yam', 'Beetroot', 'Radish']
    },
    {
        name: 'Exotic / High-Value Crops',
        emoji: '🍄',
        color: 'from-purple-500 to-indigo-600',
        lightBg: 'bg-purple-50 dark:bg-purple-900/15',
        border: 'border-purple-200 dark:border-purple-800/40',
        text: 'text-purple-700 dark:text-purple-300',
        items: ['Mushroom', 'Broccoli', 'Zucchini', 'Cherry Tomato', 'Dragon Fruit', 'Avocado']
    },
    {
        name: 'Medicinal & Herbal Crops',
        emoji: '🌿',
        color: 'from-teal-600 to-cyan-700',
        lightBg: 'bg-teal-50 dark:bg-teal-900/15',
        border: 'border-teal-200 dark:border-teal-800/40',
        text: 'text-teal-700 dark:text-teal-300',
        items: ['Aloe Vera', 'Ashwagandha', 'Tulsi', 'Lemongrass', 'Stevia']
    },
    {
        name: 'Fiber Crops',
        emoji: '🌾',
        color: 'from-stone-500 to-stone-700',
        lightBg: 'bg-stone-50 dark:bg-stone-900/15',
        border: 'border-stone-200 dark:border-stone-800/40',
        text: 'text-stone-700 dark:text-stone-300',
        items: ['Flax', 'Hemp', 'Banana Fiber']
    }
];

// Seller data for crops — multiple verified farmers per crop for comparison
const cropSellers: Record<string, { name: string; location: string; phone: string; price: string; minQty: string; rating: number; verified: boolean }[]> = {
    'Rice': [
        { name: 'Rajesh Kumar', location: 'Karnal, Haryana', phone: '+91 98765 43210', price: '₹2,400/qtl', minQty: '5 Quintals', rating: 4.5, verified: true },
        { name: 'Suresh Patel', location: 'Guntur, AP', phone: '+91 87654 32109', price: '₹2,250/qtl', minQty: '10 Quintals', rating: 4.2, verified: true },
        { name: 'Anand Singh', location: 'Burdwan, WB', phone: '+91 76543 21098', price: '₹2,350/qtl', minQty: '2 Quintals', rating: 3.8, verified: false },
        { name: 'Lakshmi Devi', location: 'Thanjavur, TN', phone: '+91 94321 56789', price: '₹2,300/qtl', minQty: '3 Quintals', rating: 4.6, verified: true },
    ],
    'Wheat': [
        { name: 'Mohan Lal', location: 'Indore, MP', phone: '+91 99876 54321', price: '₹2,500/qtl', minQty: '10 Quintals', rating: 4.7, verified: true },
        { name: 'Harpreet Singh', location: 'Ludhiana, Punjab', phone: '+91 88765 43210', price: '₹2,450/qtl', minQty: '5 Quintals', rating: 4.3, verified: true },
        { name: 'Devendra Sharma', location: 'Hoshangabad, MP', phone: '+91 77654 32100', price: '₹2,380/qtl', minQty: '3 Quintals', rating: 4.1, verified: true },
    ],
    'Tomato': [
        { name: 'Venkatesh Rao', location: 'Kolar, Karnataka', phone: '+91 97654 31098', price: '₹2,500/qtl', minQty: '1 Quintal', rating: 4.1, verified: true },
        { name: 'Manoj Kumar', location: 'Nashik, Maharashtra', phone: '+91 86543 20987', price: '₹2,200/qtl', minQty: '2 Quintals', rating: 4.4, verified: true },
        { name: 'Sita Ram', location: 'Chittoor, AP', phone: '+91 75432 19876', price: '₹2,100/qtl', minQty: '50 Kg', rating: 3.9, verified: true },
    ],
    'Onion': [
        { name: 'Ganesh Patil', location: 'Lasalgaon, Maharashtra', phone: '+91 95432 10876', price: '₹3,200/qtl', minQty: '5 Quintals', rating: 4.6, verified: true },
        { name: 'Ravi Deshmukh', location: 'Nashik, Maharashtra', phone: '+91 84321 09765', price: '₹3,000/qtl', minQty: '2 Quintals', rating: 4.0, verified: true },
        { name: 'Bhimrao Jadhav', location: 'Pune, Maharashtra', phone: '+91 73210 98654', price: '₹2,900/qtl', minQty: '1 Quintal', rating: 4.3, verified: true },
    ],
    'Potato': [
        { name: 'Ram Prasad', location: 'Agra, UP', phone: '+91 96543 21098', price: '₹1,200/qtl', minQty: '5 Quintals', rating: 4.4, verified: true },
        { name: 'Dinesh Yadav', location: 'Farrukhabad, UP', phone: '+91 85432 10987', price: '₹1,100/qtl', minQty: '10 Quintals', rating: 4.1, verified: true },
        { name: 'Amit Gupta', location: 'Meerut, UP', phone: '+91 74321 09876', price: '₹1,250/qtl', minQty: '2 Quintals', rating: 4.5, verified: true },
    ],
    'Mango': [
        { name: 'Balasaheb More', location: 'Ratnagiri, Maharashtra', phone: '+91 93210 98765', price: '₹8,500/qtl', minQty: '1 Quintal', rating: 4.8, verified: true },
        { name: 'Kishan Verma', location: 'Malihabad, UP', phone: '+91 82109 87654', price: '₹7,200/qtl', minQty: '50 Kg', rating: 4.5, verified: true },
        { name: 'Raju Naik', location: 'Dharwad, Karnataka', phone: '+91 71098 76543', price: '₹7,800/qtl', minQty: '1 Quintal', rating: 4.3, verified: true },
    ],
    'Cotton': [
        { name: 'Prakash Reddy', location: 'Warangal, Telangana', phone: '+91 82109 87654', price: '₹6,100/qtl', minQty: '10 Quintals', rating: 4.3, verified: true },
        { name: 'Santosh Rathod', location: 'Jalgaon, Maharashtra', phone: '+91 91098 76543', price: '₹5,900/qtl', minQty: '5 Quintals', rating: 4.0, verified: true },
    ],
    'Turmeric': [
        { name: 'Shankar Naik', location: 'Sangli, Maharashtra', phone: '+91 71098 76543', price: '₹12,000/qtl', minQty: '1 Quintal', rating: 4.5, verified: true },
        { name: 'Venkat Rao', location: 'Erode, Tamil Nadu', phone: '+91 61098 65432', price: '₹11,500/qtl', minQty: '50 Kg', rating: 4.7, verified: true },
    ],
    'Brinjal': [
        { name: 'Ramesh Gowda', location: 'Mysore, Karnataka', phone: '+91 91234 56789', price: '₹2,000/qtl', minQty: '25 Kg', rating: 4.2, verified: true },
        { name: 'Arjun Patil', location: 'Satara, Maharashtra', phone: '+91 81234 56780', price: '₹1,800/qtl', minQty: '50 Kg', rating: 4.0, verified: true },
    ],
    'Banana': [
        { name: 'Nagesh S.', location: 'Jalgaon, Maharashtra', phone: '+91 92345 67890', price: '₹1,500/qtl', minQty: '1 Quintal', rating: 4.4, verified: true },
        { name: 'Murugan K.', location: 'Trichy, Tamil Nadu', phone: '+91 82345 67891', price: '₹1,400/qtl', minQty: '50 Kg', rating: 4.2, verified: true },
        { name: 'Ravi Kumar', location: 'Anantapur, AP', phone: '+91 72345 67892', price: '₹1,350/qtl', minQty: '1 Quintal', rating: 3.9, verified: true },
    ],
    'Sugarcane': [
        { name: 'Shivaji Deshmukh', location: 'Kolhapur, Maharashtra', phone: '+91 93456 78901', price: '₹350/qtl', minQty: '50 Quintals', rating: 4.5, verified: true },
        { name: 'Jagdish Prasad', location: 'Muzaffarnagar, UP', phone: '+91 83456 78902', price: '₹320/qtl', minQty: '100 Quintals', rating: 4.3, verified: true },
    ],
    'Coriander': [
        { name: 'Mahesh Joshi', location: 'Kota, Rajasthan', phone: '+91 94567 89012', price: '₹8,000/qtl', minQty: '10 Kg', rating: 4.3, verified: true },
        { name: 'Sunil Meena', location: 'Mandsaur, MP', phone: '+91 84567 89013', price: '₹7,500/qtl', minQty: '25 Kg', rating: 4.1, verified: true },
    ],
    'Chilli': [
        { name: 'Narasimha Rao', location: 'Guntur, AP', phone: '+91 95678 90123', price: '₹15,000/qtl', minQty: '1 Quintal', rating: 4.7, verified: true },
        { name: 'Abdul Karim', location: 'Byadgi, Karnataka', phone: '+91 85678 90124', price: '₹14,500/qtl', minQty: '50 Kg', rating: 4.4, verified: true },
    ],
    'Coconut': [
        { name: 'Thomas Mathew', location: 'Thrissur, Kerala', phone: '+91 96789 01234', price: '₹25/piece', minQty: '100 Pieces', rating: 4.6, verified: true },
        { name: 'Manjunath', location: 'Tumkur, Karnataka', phone: '+91 86789 01235', price: '₹22/piece', minQty: '200 Pieces', rating: 4.2, verified: true },
    ],
    'Groundnut': [
        { name: 'Patel Bhikhabhai', location: 'Junagadh, Gujarat', phone: '+91 97890 12345', price: '₹5,500/qtl', minQty: '5 Quintals', rating: 4.5, verified: true },
        { name: 'Kiran Kumar', location: 'Anantapur, AP', phone: '+91 87890 12346', price: '₹5,200/qtl', minQty: '2 Quintals', rating: 4.3, verified: true },
    ],
    'Soybean': [
        { name: 'Rajendra Jain', location: 'Indore, MP', phone: '+91 98901 23456', price: '₹4,800/qtl', minQty: '10 Quintals', rating: 4.4, verified: true },
        { name: 'Anil Tiwari', location: 'Ujjain, MP', phone: '+91 88901 23457', price: '₹4,600/qtl', minQty: '5 Quintals', rating: 4.2, verified: true },
    ],
    'Apple': [
        { name: 'Ashok Thakur', location: 'Shimla, HP', phone: '+91 99012 34567', price: '₹12,000/qtl', minQty: '1 Quintal', rating: 4.8, verified: true },
        { name: 'Nazir Ahmad', location: 'Shopian, J&K', phone: '+91 89012 34568', price: '₹11,000/qtl', minQty: '50 Kg', rating: 4.6, verified: true },
    ],
    'Maize': [
        { name: 'Yogesh Patil', location: 'Aurangabad, Maharashtra', phone: '+91 90123 45678', price: '₹1,900/qtl', minQty: '10 Quintals', rating: 4.2, verified: true },
        { name: 'Surya Prakash', location: 'Karimnagar, Telangana', phone: '+91 80123 45679', price: '₹1,800/qtl', minQty: '5 Quintals', rating: 4.0, verified: true },
    ],
};

// Default sellers for crops without specific data
const defaultSellers = [
    { name: 'Miraitu Verified Farmer', location: 'Pan India', phone: '+91 74484 10198', price: 'Market Rate', minQty: '1 Quintal', rating: 4.0, verified: true },
    { name: 'AgriConnect Seller', location: 'Multiple locations', phone: '+91 74484 10198', price: 'Negotiable', minQty: 'Flexible', rating: 3.8, verified: true },
];

export default function BuyCropsPage() {
    const [search, setSearch] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
    const [cropQuantities, setCropQuantities] = useState<Record<string, { qty: string; unit: string }>>({});
    const [showCallModal, setShowCallModal] = useState<{ name: string; phone: string } | null>(null);

    const filteredCategories = cropCategories
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat =>
            search === '' ||
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.items.length > 0
        );

    const totalCrops = cropCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    const toggleCrop = (crop: string) => {
        setSelectedCrops(prev => {
            if (prev.includes(crop)) {
                // Remove crop and its quantity
                setCropQuantities(q => {
                    const next = { ...q };
                    delete next[crop];
                    return next;
                });
                return prev.filter(c => c !== crop);
            } else {
                // Add crop with default quantity
                setCropQuantities(q => ({ ...q, [crop]: { qty: '', unit: 'Kg' } }));
                return [...prev, crop];
            }
        });
    };

    const removeCrop = (crop: string) => {
        setSelectedCrops(prev => prev.filter(c => c !== crop));
        setCropQuantities(q => {
            const next = { ...q };
            delete next[crop];
            return next;
        });
    };

    const updateCropQty = (crop: string, qty: string) => {
        setCropQuantities(prev => ({ ...prev, [crop]: { ...prev[crop], qty } }));
    };

    const updateCropUnit = (crop: string, unit: string) => {
        setCropQuantities(prev => ({ ...prev, [crop]: { ...prev[crop], unit } }));
    };

    // Build a summary string like "Brinjal 1 Kg, Onion 0.5 Kg"
    const orderSummaryText = selectedCrops
        .map(crop => {
            const q = cropQuantities[crop];
            return q?.qty ? `${crop} ${q.qty} ${q.unit}` : crop;
        })
        .join(', ');

    const hasAnyQuantity = selectedCrops.some(crop => cropQuantities[crop]?.qty);

    const handleCall = (seller: { name: string; phone: string }) => {
        setShowCallModal(seller);
    };

    const initiateCall = (phone: string) => {
        window.location.href = `tel:${phone.replace(/\s/g, '')}`;
        setShowCallModal(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d]">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-green-900">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 md:py-14 relative z-10">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-bold hover:bg-white/20 transition-all mb-6 backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Crops
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Buy <span className="text-lime-300">Crops</span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mb-8">
                        Browse {totalCrops}+ varieties across {cropCategories.length} categories. Best prices, verified sellers.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">search</span>
                        <input
                            type="text"
                            placeholder="Search for crops... e.g. Rice, Mango, Turmeric"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {[
                        { label: 'Total Categories', value: cropCategories.length.toString(), icon: 'category' },
                        { label: 'Crop Varieties', value: `${totalCrops}+`, icon: 'eco' },
                        { label: 'Verified Sellers', value: '5,200+', icon: 'verified' },
                        { label: 'Avg. Savings', value: '15-25%', icon: 'savings' }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs font-semibold text-gray-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected Crop Order Panel */}
                {selectedCrops.length > 0 && (
                    <div className="mb-8 rounded-3xl overflow-hidden border-2 border-green-200 dark:border-green-800 bg-white dark:bg-[#1a231a] shadow-xl"
                        style={{ animation: 'slideDown 0.3s ease-out' }}
                    >
                        {/* Order Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-white text-xl">shopping_cart</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Order: {selectedCrops.length} {selectedCrops.length === 1 ? 'Crop' : 'Crops'} Selected</h3>
                                    <p className="text-white/70 text-sm">Select quantity and contact seller</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedCrops([]); setCropQuantities({}); }}
                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-white text-lg">close</span>
                            </button>
                        </div>

                        {/* Selected Crops Tags */}
                        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
                            {selectedCrops.map(crop => (
                                <span
                                    key={crop}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold border border-green-200 dark:border-green-800"
                                >
                                    {crop}
                                    {cropQuantities[crop]?.qty && (
                                        <span className="text-green-500 text-xs">({cropQuantities[crop].qty} {cropQuantities[crop].unit})</span>
                                    )}
                                    <button
                                        onClick={() => removeCrop(crop)}
                                        className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Per-Crop Quantity Inputs */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4 block">
                                How much do you need?
                            </label>
                            <div className="space-y-3">
                                {selectedCrops.map(crop => (
                                    <div key={crop} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                        {/* Crop label */}
                                        <div className="w-32 sm:w-40 shrink-0">
                                            <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate block">{crop}</span>
                                        </div>
                                        {/* Quantity input */}
                                        <div className="relative flex-1 min-w-0">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">scale</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                placeholder="Qty"
                                                value={cropQuantities[crop]?.qty || ''}
                                                onChange={(e) => updateCropQty(crop, e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-sm focus:border-green-500 outline-none transition-colors"
                                            />
                                        </div>
                                        {/* Unit selector */}
                                        <select
                                            value={cropQuantities[crop]?.unit || 'Kg'}
                                            onChange={(e) => updateCropUnit(crop, e.target.value)}
                                            className="shrink-0 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-bold text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="Kg">Kg</option>
                                            <option value="Quintals">Quintals</option>
                                            <option value="Tonnes">Tonnes</option>
                                            <option value="Bags">Bags</option>
                                            <option value="Pieces">Pieces</option>
                                            <option value="Dozen">Dozen</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            {hasAnyQuantity && (
                                <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Order: {orderSummaryText}
                                </p>
                            )}
                        </div>

                        {/* Sellers List — Grouped by Crop */}
                        <div className="p-6">
                            <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">group</span>
                                Available Sellers
                            </h4>
                            <div className="space-y-6">
                                {selectedCrops.map(crop => {
                                    const cropSellerList = cropSellers[crop] || defaultSellers;
                                    return (
                                        <div key={crop}>
                                            {/* Crop sub-header */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                <h5 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">{crop}</h5>
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                    {cropSellerList.length} {cropSellerList.length === 1 ? 'seller' : 'sellers'}
                                                </span>
                                                {cropQuantities[crop]?.qty && (
                                                    <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                        Need: {cropQuantities[crop].qty} {cropQuantities[crop].unit}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Sellers grid — compact card layout */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-green-200 dark:border-green-800">
                                                {cropSellerList.map((seller, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all flex flex-col"
                                                    >
                                                        {/* Top: Avatar + Name */}
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${seller.verified ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                                                                <span className="text-white font-black text-sm">{seller.name[0]}</span>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">{seller.name}</h5>
                                                                    {seller.verified && (
                                                                        <span className="material-symbols-outlined text-blue-500 text-sm shrink-0">verified</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                    <span className="flex items-center gap-0.5 truncate">
                                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                                        {seller.location}
                                                                    </span>
                                                                    <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                                                                        <span className="material-symbols-outlined text-xs">star</span>
                                                                        {seller.rating}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Middle: Price + Min Qty */}
                                                        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-green-50/80 dark:bg-green-900/20">
                                                            <span className="font-bold text-green-600 dark:text-green-400 text-sm">{seller.price}</span>
                                                            <span className="text-gray-300 dark:text-gray-600">|</span>
                                                            <span className="text-xs text-gray-500">Min: {seller.minQty}</span>
                                                        </div>

                                                        {/* Bottom: Call Button */}
                                                        <button
                                                            onClick={() => handleCall(seller)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-md shadow-green-500/15 hover:shadow-green-500/25 active:scale-[0.97] transition-all mt-auto"
                                                        >
                                                            <span className="material-symbols-outlined text-base">call</span>
                                                            Call Seller
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* WhatsApp Quick Contact */}
                            <div className="mt-4 p-4 rounded-2xl bg-[#dcf8c6] dark:bg-green-900/30 border border-green-200 dark:border-green-800 flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Need help finding a seller?</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Chat with us on WhatsApp for assistance</p>
                                    </div>
                                </div>
                                <a
                                    href={`https://wa.me/917448410198?text=Hi, I want to buy: ${orderSummaryText}. Please help.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Cards */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">search_off</span>
                        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">No crops found</h3>
                        <p className="text-gray-400 text-sm">Try searching for something else</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCategories.map((cat) => {
                            const isExpanded = expandedCategory === cat.name;
                            const displayItems = search ? cat.items : (isExpanded ? cat.items : cat.items.slice(0, 4));
                            const hasMore = !search && cat.items.length > 4;

                            return (
                                <div
                                    key={cat.name}
                                    className={`group rounded-3xl border ${cat.border} ${cat.lightBg} p-5 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                    onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                                >
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg`}>
                                                {cat.emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                                                <p className="text-xs font-semibold text-gray-400">{cat.items.length} items</p>
                                            </div>
                                        </div>
                                        <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>

                                    {/* Crop Items */}
                                    <div className="flex flex-wrap gap-2">
                                        {displayItems.map((item) => {
                                            const isSelected = selectedCrops.includes(item);
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCrop(item);
                                                        // Scroll to order panel if adding
                                                        if (!isSelected) {
                                                            setTimeout(() => {
                                                                const panel = document.getElementById('order-panel');
                                                                if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }, 100);
                                                        }
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border text-sm font-semibold transition-all ${isSelected
                                                        ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-2 ring-green-500/20'
                                                        : 'border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-700'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                                                    )}
                                                    {item}
                                                </button>
                                            );
                                        })}
                                        {hasMore && !isExpanded && (
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${cat.text}`}>
                                                +{cat.items.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Banner */}
                <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl">verified</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-1">100% Verified Sellers</h3>
                            <p className="text-white/70 font-medium text-sm">All listings are from verified farmers. Look for the verified badge for extra trust.</p>
                        </div>
                    </div>
                    <Link
                        href="/home/crops/sell"
                        className="shrink-0 px-6 py-3 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-colors shadow-lg"
                    >
                        Start Selling Crops →
                    </Link>
                </div>
            </div>

            {/* Call Modal */}
            {showCallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowCallModal(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'slideUp 0.3s ease-out' }}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-green-600 text-3xl">call</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Contact Seller</h3>
                            <p className="text-gray-500 text-sm">{showCallModal.name}</p>
                        </div>

                        {hasAnyQuantity && (
                            <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
                                    Requesting: <strong>{orderSummaryText}</strong>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => initiateCall(showCallModal.phone)}
                                className="flex-1 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <span className="material-symbols-outlined">call</span>
                                Call Now
                            </button>
                            <a
                                href={`https://wa.me/${showCallModal.phone.replace(/[^0-9]/g, '')}?text=Hi ${showCallModal.name}, I want to buy: ${orderSummaryText}. Is it available?`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp
                            </a>
                        </div>

                        <button
                            onClick={() => setShowCallModal(null)}
                            className="w-full mt-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
