'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useAuth } from '@/context/AuthContext';
import { getSellerByUserId, getServicesByUserId, createService, deleteService as deleteServiceDb, uploadImages, ServiceRecord } from '@/lib/supabase-db';

const sidebarLinks = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'services', icon: 'handyman', label: 'My Services' },
    { id: 'bookings', icon: 'calendar_month', label: 'Bookings' },
    { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
];

const serviceTypeOptions = [
    { value: 'drone-spraying', label: 'Drone Spraying', icon: '🚁', unit: 'per acre' },
    { value: 'soil-testing', label: 'Soil Testing', icon: '🧪', unit: 'per sample' },
    { value: 'transportation', label: 'Transportation', icon: '🚛', unit: 'per km' },
    { value: 'equipment-rental', label: 'Equipment Rental', icon: '🔧', unit: 'per day' },
    { value: 'veterinary', label: 'Veterinary', icon: '🐄', unit: 'per visit' },
    { value: 'consulting', label: 'Consulting', icon: '📋', unit: 'per session' },
    { value: 'harvesting', label: 'Harvesting', icon: '🌾', unit: 'per acre' },
    { value: 'ploughing', label: 'Ploughing / Tilling', icon: '🚜', unit: 'per acre' },
    { value: 'irrigation', label: 'Irrigation Setup', icon: '💧', unit: 'per project' },
    { value: 'other', label: 'Other Service', icon: '⚙️', unit: 'per unit' },
];

const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AddedService {
    id: number;
    type: string;
    typeLabel: string;
    typeIcon: string;
    title: string;
    description: string;
    price: string;
    unit: string;
    area: string;
    availability: string[];
    images: string[];
    status: 'active' | 'pending';
    createdAt: string;
}

const serviceCategories = [
    { name: 'Drone Spraying', icon: '🚁', demand: 'High', rate: '₹500-800/acre' },
    { name: 'Soil Testing', icon: '🧪', demand: 'Medium', rate: '₹300-500/sample' },
    { name: 'Transportation', icon: '🚛', demand: 'High', rate: '₹15-25/km' },
    { name: 'Equipment Rental', icon: '🔧', demand: 'High', rate: '₹800-2000/day' },
    { name: 'Veterinary', icon: '🐄', demand: 'Medium', rate: '₹500-1500/visit' },
    { name: 'Consulting', icon: '📋', demand: 'Low', rate: '₹300-1000/session' },
];

export default function ServiceProviderDashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [sellerId, setSellerId] = useState<string | null>(null);

    // Add Service form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormStep, setAddFormStep] = useState(0);
    const [addedServices, setAddedServices] = useState<AddedService[]>([]);
    const [showServiceSuccess, setShowServiceSuccess] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        type: '', title: '', description: '', price: '', area: '', equipment: '', experience: '', availability: [] as string[],
    });
    const [serviceImages, setServiceImages] = useState<{ file: File; preview: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleServiceField = (name: string, value: string) => setServiceForm(prev => ({ ...prev, [name]: value }));
    const toggleDay = (day: string) => setServiceForm(prev => ({ ...prev, availability: prev.availability.includes(day) ? prev.availability.filter(d => d !== day) : [...prev.availability, day] }));

    const handleServiceImageUpload = useCallback((files: FileList | null) => {
        if (!files) return;
        const remaining = 5 - serviceImages.length;
        const toAdd = Array.from(files).slice(0, remaining);
        const newImages = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setServiceImages(prev => [...prev, ...newImages]);
    }, [serviceImages.length]);

    const removeServiceImage = (index: number) => {
        setServiceImages(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
    };

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleServiceImageUpload(e.dataTransfer.files); }, [handleServiceImageUpload]);

    const selectedTypeInfo = serviceTypeOptions.find(o => o.value === serviceForm.type);

    const openAddForm = () => {
        setShowAddForm(true);
        setAddFormStep(0);
        setServiceForm({ type: '', title: '', description: '', price: '', area: '', equipment: '', experience: '', availability: [] });
        setServiceImages([]);
        setActiveTab('services');
    };

    const submitService = async () => {
        try {
            // Upload images to Supabase Storage if user is logged in
            let imageUrls: string[] = [];
            if (user && !user.isGuest && serviceImages.length > 0) {
                const files = serviceImages.map(img => img.file);
                imageUrls = await uploadImages('service-images', user.id, files);
            } else {
                imageUrls = serviceImages.map(img => img.preview);
            }

            const newService: AddedService = {
                id: Date.now(),
                type: serviceForm.type,
                typeLabel: selectedTypeInfo?.label || serviceForm.type,
                typeIcon: selectedTypeInfo?.icon || '⚙️',
                title: serviceForm.title || selectedTypeInfo?.label || 'My Service',
                description: serviceForm.description,
                price: serviceForm.price,
                unit: selectedTypeInfo?.unit || 'per unit',
                area: serviceForm.area,
                availability: serviceForm.availability,
                images: imageUrls,
                status: 'pending',
                createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            };

            // Save to Supabase if logged in
            if (user && !user.isGuest) {
                const { data } = await createService({
                    user_id: user.id,
                    seller_id: sellerId || undefined,
                    service_type: serviceForm.type,
                    type_label: selectedTypeInfo?.label || serviceForm.type,
                    type_icon: selectedTypeInfo?.icon || '⚙️',
                    title: serviceForm.title || selectedTypeInfo?.label || 'My Service',
                    description: serviceForm.description,
                    price: serviceForm.price,
                    unit: selectedTypeInfo?.unit || 'per unit',
                    area: serviceForm.area,
                    availability: serviceForm.availability.join(', '),
                    images: imageUrls,
                    status: 'pending',
                });
                // Use the Supabase ID if available
                if (data?.id) {
                    newService.id = parseInt(data.id.replace(/-/g, '').substring(0, 8), 16);
                    (newService as AddedService & { dbId?: string }).dbId = data.id;
                }
            }

            setAddedServices(prev => [...prev, newService]);
            setShowAddForm(false);
            setShowServiceSuccess(true);
            setTimeout(() => setShowServiceSuccess(false), 4000);
        } catch (error) {
            console.error('Error submitting service:', error);
            // Still add locally as fallback
            const fallbackService: AddedService = {
                id: Date.now(),
                type: serviceForm.type,
                typeLabel: selectedTypeInfo?.label || serviceForm.type,
                typeIcon: selectedTypeInfo?.icon || '⚙️',
                title: serviceForm.title || selectedTypeInfo?.label || 'My Service',
                description: serviceForm.description,
                price: serviceForm.price,
                unit: selectedTypeInfo?.unit || 'per unit',
                area: serviceForm.area,
                availability: serviceForm.availability,
                images: serviceImages.map(img => img.preview),
                status: 'pending',
                createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            };
            setAddedServices(prev => [...prev, fallbackService]);
            setShowAddForm(false);
            setShowServiceSuccess(true);
            setTimeout(() => setShowServiceSuccess(false), 4000);
        }
    };

    const handleDeleteService = async (id: number) => {
        const service = addedServices.find(s => s.id === id) as (AddedService & { dbId?: string }) | undefined;
        // Delete from Supabase if it has a DB ID
        if (service?.dbId && user && !user.isGuest) {
            await deleteServiceDb(service.dbId);
        }
        setAddedServices(prev => prev.filter(s => s.id !== id));
    };

    // Load seller data from Supabase (with localStorage fallback)
    useEffect(() => {
        const loadData = async () => {
            // Try Supabase first
            if (user && !user.isGuest) {
                try {
                    const seller = await getSellerByUserId(user.id);
                    if (seller) {
                        setUserName(seller.full_name || user.displayName || '');
                        setSellerId(seller.id || null);
                        const formData = seller.form_data as Record<string, string>;
                        if (formData?.serviceType) setServiceType(formData.serviceType);
                    } else {
                        // No seller record — use auth user name
                        setUserName(user.displayName || '');
                    }

                    // Load services from Supabase
                    const dbServices = await getServicesByUserId(user.id);
                    if (dbServices.length > 0) {
                        const mapped: AddedService[] = dbServices.map((s: ServiceRecord) => ({
                            id: parseInt((s.id || '0').replace(/-/g, '').substring(0, 8), 16),
                            dbId: s.id,
                            type: s.service_type,
                            typeLabel: s.type_label || s.service_type,
                            typeIcon: s.type_icon || '⚙️',
                            title: s.title,
                            description: s.description || '',
                            price: s.price || '',
                            unit: s.unit || 'per unit',
                            area: s.area || '',
                            availability: s.availability ? s.availability.split(', ') : [],
                            images: s.images || [],
                            status: (s.status as 'active' | 'pending') || 'pending',
                            createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
                        }));
                        setAddedServices(mapped as AddedService[]);
                    }
                } catch (error) {
                    console.error('Error loading from Supabase:', error);
                    // Fallback to localStorage
                    loadFromLocalStorage();
                }
            } else {
                // Not logged in — use localStorage
                loadFromLocalStorage();
            }
        };

        const loadFromLocalStorage = () => {
            if (typeof window !== 'undefined') {
                const name = localStorage.getItem('miraitu_seller_name') || '';
                setUserName(name);
                try {
                    const data = JSON.parse(localStorage.getItem('miraitu_seller_data') || '{}');
                    setServiceType(data.serviceType || '');
                } catch { /* ignore */ }
            }
        };

        loadData();
    }, [user]);

    const displayName = userName || 'Service Provider';
    const firstName = displayName.split(' ')[0];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            <div className="fixed top-0 left-0 right-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
            </div>

            <div className="flex flex-1 pt-20">
                {/* Mobile Sidebar Toggle */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed bottom-6 left-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{sidebarOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Sidebar */}
                <aside className={`fixed md:sticky top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-[#1a251a] border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-xl font-black">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-black text-sm text-gray-900 dark:text-white truncate max-w-[140px]">{displayName}</h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[10px]">schedule</span>Verification Pending
                                </span>
                            </div>
                        </div>
                    </div>
                    <nav className="p-3">
                        {sidebarLinks.map(link => (
                            <button key={link.id} onClick={() => { setActiveTab(link.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold mb-1 transition-all ${activeTab === link.id ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                <span className="material-symbols-outlined text-xl">{link.icon}</span>{link.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 mt-auto">
                        <Link href="/home/become-seller" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Seller Page
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 p-5 md:p-8 text-white mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">waving_hand</span>Welcome back!
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-2">Hello, {firstName}! 👋</h1>
                            <p className="text-sm md:text-base text-white/80 mb-4 max-w-xl">
                                {serviceType ? `Your ${serviceType} service` : 'Your service'} application is being reviewed. Once verified, farmers can discover and book your services.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={openAddForm} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>{addedServices.length > 0 ? 'Add Another Service' : 'Add First Service'}
                                </button>
                                <button onClick={() => setActiveTab('settings')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl font-bold text-sm border border-white/30 hover:bg-white/25 transition-all">
                                    <span className="material-symbols-outlined text-lg">settings</span>Account Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                                {[
                                    { label: 'Active Services', value: String(addedServices.length), icon: 'handyman', change: addedServices.length > 0 ? `${addedServices.length} listed` : 'Add your services', lightBg: 'bg-orange-50 dark:bg-orange-950/20', textColor: 'text-orange-600 dark:text-orange-400' },
                                    { label: 'Pending Bookings', value: '0', icon: 'event_note', change: 'No bookings yet', lightBg: 'bg-blue-50 dark:bg-blue-950/20', textColor: 'text-blue-600 dark:text-blue-400' },
                                    { label: 'Total Earnings', value: '₹0', icon: 'currency_rupee', change: 'Start offering to earn', lightBg: 'bg-green-50 dark:bg-green-950/20', textColor: 'text-green-600 dark:text-green-400' },
                                    { label: 'Avg. Rating', value: '-', icon: 'star', change: 'Complete first job', lightBg: 'bg-amber-50 dark:bg-amber-950/20', textColor: 'text-amber-600 dark:text-amber-400' },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 ${stat.lightBg} rounded-xl flex items-center justify-center`}>
                                                <span className={`material-symbols-outlined ${stat.textColor} text-xl`}>{stat.icon}</span>
                                            </div>
                                        </div>
                                        <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">{stat.label}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{stat.change}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Add Your First Service – Prominent CTA (only if no services) */}
                            {addedServices.length === 0 ? (
                            <div className="mb-6 bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border-2 border-dashed border-orange-300 dark:border-orange-700 p-6 md:p-10 text-center">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-orange-500 text-4xl">add_business</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Add Your First Service</h3>
                                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                                    Start by listing your service — drone spraying, soil testing, transportation, equipment rental, or any farm service you offer. Farmers in your area are looking for services right now!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button onClick={openAddForm} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all">
                                        <span className="material-symbols-outlined text-lg">add_circle</span>Add Service Now
                                    </button>
                                    <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <span className="material-symbols-outlined text-lg">play_circle</span>Watch How It Works
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm mx-auto">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">Free Listing</p>
                                    </div>
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">Instant Visibility</p>
                                    </div>
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">Direct Bookings</p>
                                    </div>
                                </div>
                            </div>
                            ) : (
                            /* Listed Services Summary on Overview */
                            <div className="mb-6 bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-black text-sm text-gray-900 dark:text-white">Your Services ({addedServices.length})</h3>
                                    <button onClick={openAddForm} className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span>Add More
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {addedServices.slice(0, 3).map(svc => (
                                        <div key={svc.id} className="flex items-center gap-3 p-4">
                                            <span className="text-2xl">{svc.typeIcon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{svc.title}</p>
                                                <p className="text-[10px] text-gray-400">₹{svc.price} {svc.unit} • {svc.area}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">Pending Review</span>
                                        </div>
                                    ))}
                                </div>
                                {addedServices.length > 3 && (
                                    <button onClick={() => setActiveTab('services')} className="w-full p-3 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">View All {addedServices.length} Services →</button>
                                )}
                            </div>
                            )}

                            {/* Service Demand in Area */}
                            <div className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
                                <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-black text-sm text-gray-900 dark:text-white">📊 Service Demand in Your Area</h3>
                                    <span className="text-xs font-bold text-gray-400">Market Rates</span>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {serviceCategories.map(item => (
                                            <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                                <span className="text-xl">{item.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400">{item.rate}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.demand === 'High' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : item.demand === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                                    {item.demand} Demand
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl md:rounded-2xl p-5 md:p-6 border border-orange-100 dark:border-orange-900/30">
                                <h3 className="font-black text-sm text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">tips_and_updates</span>Pro Tips for More Bookings
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { icon: 'camera_alt', tip: 'Upload photos of your equipment and past work for trust' },
                                        { icon: 'location_on', tip: 'Set accurate service area to appear in relevant searches' },
                                        { icon: 'schedule', tip: 'Keep real-time availability updated for instant bookings' },
                                        { icon: 'rate_review', tip: 'Ask satisfied customers to leave reviews on your profile' },
                                    ].map(item => (
                                        <div key={item.tip} className="flex items-start gap-2.5">
                                            <span className="material-symbols-outlined text-orange-500 text-base mt-0.5 shrink-0">{item.icon}</span>
                                            <p className="text-xs text-orange-700 dark:text-orange-300/80 leading-relaxed">{item.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* My Services Tab */}
                    {activeTab === 'services' && (
                        <>
                            {/* Add Service Form */}
                            {showAddForm ? (
                                <div className="bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    {/* Form Header */}
                                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">Add New Service</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">Step {addFormStep + 1} of 3</p>
                                        </div>
                                        <button onClick={() => setShowAddForm(false)} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
                                        </button>
                                    </div>
                                    {/* Step Progress */}
                                    <div className="px-4 md:px-6 pt-5">
                                        <div className="flex items-center gap-1 mb-6">
                                            {['Service Type', 'Details & Pricing', 'Photos & Availability'].map((label, i) => (
                                                <div key={label} className="flex-1">
                                                    <div className={`h-2 rounded-full transition-all ${i <= addFormStep ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                                    <p className={`text-[10px] font-bold mt-1.5 ${i <= addFormStep ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-6">
                                        {/* Step 1: Service Type */}
                                        {addFormStep === 0 && (
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">What service do you offer?</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {serviceTypeOptions.map(opt => (
                                                        <button key={opt.value} onClick={() => handleServiceField('type', opt.value)}
                                                            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${serviceForm.type === opt.value ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-md' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121811] hover:border-orange-200'}`}>
                                                            <span className="text-2xl">{opt.icon}</span>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white mt-2">{opt.label}</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{opt.unit}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Details & Pricing */}
                                        {addFormStep === 1 && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Service Title <span className="text-red-500">*</span></label>
                                                    <input className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300" placeholder={`e.g., ${selectedTypeInfo?.label || 'Professional Farm Service'}`} value={serviceForm.title} onChange={e => handleServiceField('title', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Description <span className="text-red-500">*</span></label>
                                                    <textarea className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300 resize-none" rows={3} placeholder="Describe what you offer, equipment used, experience..." value={serviceForm.description} onChange={e => handleServiceField('description', e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Price (₹) <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <input className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300" type="number" placeholder="500" value={serviceForm.price} onChange={e => handleServiceField('price', e.target.value)} />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">{selectedTypeInfo?.unit}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Service Area <span className="text-red-500">*</span></label>
                                                        <input className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300" placeholder="e.g., 50 km radius" value={serviceForm.area} onChange={e => handleServiceField('area', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Equipment Owned</label>
                                                        <input className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300" placeholder="e.g., DJI Agras T30" value={serviceForm.equipment} onChange={e => handleServiceField('equipment', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Years of Experience</label>
                                                        <input className="w-full bg-gray-50 dark:bg-[#121811] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-300" placeholder="e.g., 5 years" value={serviceForm.experience} onChange={e => handleServiceField('experience', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Photos & Availability */}
                                        {addFormStep === 2 && (
                                            <div className="space-y-6">
                                                {/* Image Upload */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Upload Photos (max 5)</label>
                                                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                                        onClick={() => serviceImages.length < 5 && fileInputRef.current?.click()}
                                                        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/10 scale-[1.01]' : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 hover:bg-gray-50 dark:hover:bg-white/5'} ${serviceImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleServiceImageUpload(e.target.files)} disabled={serviceImages.length >= 5} />
                                                        <div className="w-14 h-14 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-3">
                                                            <span className="material-symbols-outlined text-orange-500 text-2xl">cloud_upload</span>
                                                        </div>
                                                        <p className="text-sm font-black text-gray-700 dark:text-gray-300">{isDragging ? 'Drop images here!' : 'Drag & Drop or Browse'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Add photos of your equipment, work samples, certifications</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{serviceImages.length}/5 uploaded</p>
                                                    </div>
                                                    {serviceImages.length > 0 && (
                                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                                            {serviceImages.map((img, i) => (
                                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
                                                                    <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                                                                    <button onClick={e => { e.stopPropagation(); removeServiceImage(i); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Availability */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Available Days</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {availabilityOptions.map(day => (
                                                            <button key={day} onClick={() => toggleDay(day)}
                                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${serviceForm.availability.includes(day) ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                                                {day.slice(0, 3)}
                                                            </button>
                                                        ))}
                                                        <button onClick={() => setServiceForm(prev => ({ ...prev, availability: prev.availability.length === 7 ? [] : [...availabilityOptions] }))}
                                                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors">
                                                            {serviceForm.availability.length === 7 ? 'Clear All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Navigation */}
                                    <div className="flex gap-3 p-4 md:p-6 border-t border-gray-100 dark:border-gray-800">
                                        {addFormStep > 0 && (
                                            <button onClick={() => setAddFormStep(prev => prev - 1)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                <span className="material-symbols-outlined text-lg">arrow_back</span>Previous
                                            </button>
                                        )}
                                        {addFormStep < 2 ? (
                                            <button onClick={() => setAddFormStep(prev => prev + 1)} disabled={addFormStep === 0 && !serviceForm.type}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black text-sm shadow-lg transition-all ${addFormStep === 0 && !serviceForm.type ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.98]'}`}>
                                                Next Step<span className="material-symbols-outlined text-lg">arrow_forward</span>
                                            </button>
                                        ) : (
                                            <button onClick={submitService} disabled={!serviceForm.title || !serviceForm.price}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black text-sm shadow-lg transition-all ${!serviceForm.title || !serviceForm.price ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 active:scale-[0.98]'}`}>
                                                <span className="material-symbols-outlined text-lg">check_circle</span>Publish Service
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Services List or Empty State */
                                <div>
                                    {/* Header with Add Button */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white">My Services ({addedServices.length})</h3>
                                        <button onClick={openAddForm} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                                            <span className="material-symbols-outlined text-lg">add_circle</span>Add Service
                                        </button>
                                    </div>

                                    {addedServices.length === 0 ? (
                                        <div className="bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 md:p-10 text-center">
                                            <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-5">
                                                <span className="material-symbols-outlined text-orange-500 text-4xl">handyman</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">No Services Yet</h3>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Add your first service to start receiving bookings from farmers in your area.</p>
                                            <button onClick={openAddForm} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all">
                                                <span className="material-symbols-outlined text-lg">add_circle</span>Add Your First Service
                                            </button>
                                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {[
                                                    { icon: '🚁', name: 'Drone Spraying', desc: 'Spray pesticides via drone' },
                                                    { icon: '🧪', name: 'Soil Testing', desc: 'Test soil quality & nutrients' },
                                                    { icon: '🚛', name: 'Transportation', desc: 'Move crops & equipment' },
                                                ].map(s => (
                                                    <div key={s.name} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-left">
                                                        <span className="text-2xl">{s.icon}</span>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white mt-2">{s.name}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{s.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Listed Services Cards */
                                        <div className="space-y-4">
                                            {addedServices.map(svc => (
                                                <div key={svc.id} className="bg-white dark:bg-[#1a251a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                                                    <div className="flex flex-col sm:flex-row">
                                                        {svc.images.length > 0 && (
                                                            <div className="sm:w-40 h-32 sm:h-auto shrink-0">
                                                                <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 p-4 md:p-5">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="text-2xl">{svc.typeIcon}</span>
                                                                    <div>
                                                                        <h4 className="text-base font-black text-gray-900 dark:text-white">{svc.title}</h4>
                                                                        <p className="text-[10px] text-gray-400">{svc.typeLabel} • Added {svc.createdAt}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 shrink-0">⏳ Pending</span>
                                                            </div>
                                                            {svc.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{svc.description}</p>}
                                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                                <span className="inline-flex items-center gap-1 text-sm font-black text-green-600"><span className="material-symbols-outlined text-sm">currency_rupee</span>₹{svc.price} <span className="text-[10px] font-bold text-gray-400">{svc.unit}</span></span>
                                                                {svc.area && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><span className="material-symbols-outlined text-sm">location_on</span>{svc.area}</span>}
                                                                {svc.availability.length > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><span className="material-symbols-outlined text-sm">calendar_month</span>{svc.availability.map(d => d.slice(0, 3)).join(', ')}</span>}
                                                                {svc.images.length > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><span className="material-symbols-outlined text-sm">photo_library</span>{svc.images.length} photos</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                                <button className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">edit</span>Edit</button>
                                                                <span className="text-gray-300">•</span>
                                                                <button onClick={() => handleDeleteService(svc.id)} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">delete</span>Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 md:p-10 text-center">
                            <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-blue-500 text-4xl">calendar_month</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Bookings</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">No bookings yet {firstName}. Once you add services and get verified, farmers will be able to book your services directly.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Upcoming</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Completed</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Cancelled</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Earnings Tab */}
                    {activeTab === 'earnings' && (
                        <div className="bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 md:p-10 text-center">
                            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-green-500 text-4xl">account_balance_wallet</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Earnings</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Your earnings will appear here once you complete service bookings. All payments go directly to your bank account.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10">
                                    <p className="text-2xl font-black text-green-600">₹0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">This Month</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">₹0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Total Earned</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">₹0</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Pending</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Account Settings</h3>
                                <p className="text-xs text-gray-400 mt-1">Manage your profile and preferences</p>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {[
                                    { icon: 'person', label: 'Profile Information', desc: `Name: ${displayName}`, action: 'Edit' },
                                    { icon: 'location_on', label: 'Service Area', desc: 'Set your coverage area for bookings', action: 'Setup' },
                                    { icon: 'notifications', label: 'Notifications', desc: 'Manage booking alerts & reminders', action: 'Configure' },
                                    { icon: 'account_balance', label: 'Bank Details', desc: 'Payment account for earnings', action: 'Update' },
                                    { icon: 'security', label: 'Security', desc: 'Password and login settings', action: 'Manage' },
                                    { icon: 'help', label: 'Help & Support', desc: 'FAQs, contact support team', action: 'View' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-4 p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-orange-500 text-xl">{item.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                                        </div>
                                        <button className="text-xs font-bold text-orange-500 hover:text-orange-600 shrink-0">{item.action}</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <Footer />

            {/* Service Added Success Toast */}
            {showServiceSuccess && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-bounce">
                    <div className="flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/30">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm font-black">Service Added Successfully! 🎉</p>
                            <p className="text-xs text-white/80">Your service is under review and will be live within 24 hours.</p>
                        </div>
                        <button onClick={() => setShowServiceSuccess(false)} className="ml-2 text-white/60 hover:text-white">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
