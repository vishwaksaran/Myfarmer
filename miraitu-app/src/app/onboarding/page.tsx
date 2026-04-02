'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MiraituLogo from '@/components/MiraituLogo';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';

// ─── Types ────────────────────────────────────────────────────────

interface OnboardingData {
    full_name: string;
    email: string;
    role: string;
    interests: string[];
    farm_location: string;
    district: string;
    state: string;
    pincode: string;
    farm_size: string;
    experience_years: string;
    phone: string;
}

const TOTAL_STEPS = 4;

// ─── Role Options ─────────────────────────────────────────────────

const ROLES = [
    {
        id: 'farmer',
        label: 'Farmer',
        icon: 'agriculture',
        color: 'from-green-500 to-emerald-600',
        bg: 'bg-green-50',
        border: 'border-green-300',
        activeBg: 'bg-green-100',
        description: 'I grow crops & manage farmland',
    },
    {
        id: 'dealer',
        label: 'Dealer',
        icon: 'storefront',
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        activeBg: 'bg-blue-100',
        description: 'I sell farm equipment & supplies',
    },
    {
        id: 'service_provider',
        label: 'Service Provider',
        icon: 'engineering',
        color: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        activeBg: 'bg-amber-100',
        description: 'I offer agricultural services',
    },
    {
        id: 'livestock_farmer',
        label: 'Livestock Farmer',
        icon: 'pets',
        color: 'from-rose-500 to-pink-600',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        activeBg: 'bg-rose-100',
        description: 'I raise animals & poultry',
    },
    {
        id: 'buyer',
        label: 'Buyer / Trader',
        icon: 'shopping_cart',
        color: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        activeBg: 'bg-purple-100',
        description: 'I buy agricultural products',
    },
    {
        id: 'student',
        label: 'Agri Student',
        icon: 'school',
        color: 'from-teal-500 to-cyan-600',
        bg: 'bg-teal-50',
        border: 'border-teal-300',
        activeBg: 'bg-teal-100',
        description: 'I\'m learning agriculture',
    },
];

// ─── Role-Specific Interest Options ───────────────────────────────

interface InterestOption {
    id: string;
    label: string;
    icon: string;
    color: string;
    bg: string;
}

const INTERESTS_BY_ROLE: Record<string, InterestOption[]> = {
    farmer: [
        { id: 'crops', label: 'Crop Farming', icon: 'grass', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'organic', label: 'Organic Farming', icon: 'eco', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'irrigation', label: 'Irrigation & Water', icon: 'water_drop', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'soil_testing', label: 'Soil Testing', icon: 'science', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'machinery', label: 'Farm Machinery', icon: 'precision_manufacturing', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'fencing', label: 'Fencing', icon: 'fence', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'finance', label: 'Agri Finance', icon: 'account_balance', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'marketplace', label: 'Sell Produce', icon: 'store', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'weather', label: 'Weather Updates', icon: 'cloud', color: 'text-sky-600', bg: 'bg-sky-50' },
        { id: 'cctv', label: 'Farm Security', icon: 'videocam', color: 'text-gray-600', bg: 'bg-gray-50' },
        { id: 'community', label: 'Farmer Community', icon: 'groups', color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: 'govt_schemes', label: 'Govt Schemes', icon: 'policy', color: 'text-red-600', bg: 'bg-red-50' },
    ],
    dealer: [
        { id: 'machinery_sales', label: 'Machinery Sales', icon: 'precision_manufacturing', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'seeds_fertilizers', label: 'Seeds & Fertilizers', icon: 'spa', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'pesticides', label: 'Pesticides', icon: 'bug_report', color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'tools', label: 'Farm Tools', icon: 'handyman', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'irrigation_equip', label: 'Irrigation Equipment', icon: 'water_drop', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'bulk_orders', label: 'Bulk Orders', icon: 'inventory_2', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'spare_parts', label: 'Spare Parts', icon: 'settings', color: 'text-gray-600', bg: 'bg-gray-50' },
        { id: 'delivery', label: 'Delivery Services', icon: 'local_shipping', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'finance', label: 'Financing Options', icon: 'account_balance', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'marketplace', label: 'Online Marketplace', icon: 'store', color: 'text-teal-600', bg: 'bg-teal-50' },
    ],
    service_provider: [
        { id: 'tractor_rental', label: 'Tractor Rental', icon: 'agriculture', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'harvesting', label: 'Harvesting Services', icon: 'grass', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'spraying', label: 'Drone / Spraying', icon: 'flight', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'borewell', label: 'Borewell Drilling', icon: 'water_drop', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'fencing_service', label: 'Fencing Service', icon: 'fence', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'soil_testing', label: 'Soil Testing', icon: 'science', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'transport', label: 'Agri Transport', icon: 'local_shipping', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'cctv_install', label: 'CCTV Installation', icon: 'videocam', color: 'text-gray-600', bg: 'bg-gray-50' },
        { id: 'consultation', label: 'Farm Consultation', icon: 'support_agent', color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: 'labor', label: 'Labor Supply', icon: 'group', color: 'text-rose-600', bg: 'bg-rose-50' },
    ],
    livestock_farmer: [
        { id: 'cattle', label: 'Cattle Rearing', icon: 'pets', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'poultry', label: 'Poultry Farming', icon: 'egg', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'dairy', label: 'Dairy Products', icon: 'water_drop', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'goat_sheep', label: 'Goat & Sheep', icon: 'pets', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'feed', label: 'Animal Feed', icon: 'grass', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'veterinary', label: 'Veterinary Care', icon: 'vaccines', color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'breeding', label: 'Breeding Services', icon: 'favorite', color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'fish', label: 'Fishery', icon: 'set_meal', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'marketplace', label: 'Sell Livestock', icon: 'store', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'insurance', label: 'Livestock Insurance', icon: 'shield', color: 'text-purple-600', bg: 'bg-purple-50' },
    ],
    buyer: [
        { id: 'grains', label: 'Grains & Cereals', icon: 'grass', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'vegetables', label: 'Fresh Vegetables', icon: 'spa', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'fruits', label: 'Fruits', icon: 'nutrition', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'dairy', label: 'Dairy Products', icon: 'water_drop', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'organic', label: 'Organic Products', icon: 'eco', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'spices', label: 'Spices & Herbs', icon: 'local_fire_department', color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'bulk_buying', label: 'Bulk Buying', icon: 'inventory_2', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'export', label: 'Export', icon: 'flight_takeoff', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'processing', label: 'Food Processing', icon: 'factory', color: 'text-gray-600', bg: 'bg-gray-50' },
        { id: 'livestock_buy', label: 'Buy Livestock', icon: 'pets', color: 'text-rose-600', bg: 'bg-rose-50' },
    ],
    student: [
        { id: 'crop_science', label: 'Crop Science', icon: 'biotech', color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'soil_science', label: 'Soil Science', icon: 'science', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'agri_tech', label: 'Agri Technology', icon: 'memory', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'horticulture', label: 'Horticulture', icon: 'local_florist', color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'animal_husbandry', label: 'Animal Husbandry', icon: 'pets', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'agri_economics', label: 'Agri Economics', icon: 'trending_up', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'organic_farming', label: 'Organic Farming', icon: 'eco', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'irrigation_eng', label: 'Irrigation Engg', icon: 'water_drop', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'internships', label: 'Internships', icon: 'work', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'research', label: 'Research Papers', icon: 'menu_book', color: 'text-teal-600', bg: 'bg-teal-50' },
    ],
};

// Fallback interests when no role is selected yet
const DEFAULT_INTERESTS: InterestOption[] = [
    { id: 'crops', label: 'Crop Farming', icon: 'grass', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'organic', label: 'Organic Farming', icon: 'eco', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'machinery', label: 'Farm Machinery', icon: 'precision_manufacturing', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'livestock', label: 'Livestock', icon: 'pets', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'irrigation', label: 'Irrigation & Water', icon: 'water_drop', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'marketplace', label: 'Buy / Sell', icon: 'store', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'community', label: 'Community', icon: 'groups', color: 'text-teal-600', bg: 'bg-teal-50' },
];

// ─── Indian States ────────────────────────────────────────────────

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ─── Role-Specific Step 4 Config ──────────────────────────────────

interface Step4Config {
    headerIcon: string;
    headerGradient: string;
    headerShadow: string;
    title: string;
    subtitle: string;
    scaleLabel: string;
    scaleOptions: { id: string; label: string; icon: string }[];
    experienceLabel: string;
    experienceOptions: { id: string; label: string; icon: string }[];
}

const STEP4_BY_ROLE: Record<string, Step4Config> = {
    farmer: {
        headerIcon: 'agriculture',
        headerGradient: 'from-amber-500 to-orange-600',
        headerShadow: 'shadow-orange-300/30',
        title: 'Farm Details',
        subtitle: 'Tell us about your farm to get tailored recommendations',
        scaleLabel: 'Farm Size',
        scaleOptions: [
            { id: 'less-1', label: 'Less than 1 acre', icon: 'crop_square' },
            { id: '1-5', label: '1 – 5 acres', icon: 'grid_view' },
            { id: '5-20', label: '5 – 20 acres', icon: 'view_module' },
            { id: '20-50', label: '20 – 50 acres', icon: 'dashboard' },
            { id: '50-plus', label: '50+ acres', icon: 'landscape' },
        ],
        experienceLabel: 'Farming Experience',
        experienceOptions: [
            { id: 'new', label: 'Just Starting', icon: '🌱' },
            { id: '1-3', label: '1 – 3 years', icon: '🌿' },
            { id: '3-10', label: '3 – 10 years', icon: '🌳' },
            { id: '10-plus', label: '10+ years', icon: '🏆' },
        ],
    },
    dealer: {
        headerIcon: 'storefront',
        headerGradient: 'from-blue-500 to-indigo-600',
        headerShadow: 'shadow-blue-300/30',
        title: 'Business Details',
        subtitle: 'Help us understand your dealership better',
        scaleLabel: 'Business Scale',
        scaleOptions: [
            { id: 'single-shop', label: 'Single Shop', icon: 'storefront' },
            { id: 'multi-branch', label: 'Multi-Branch', icon: 'store' },
            { id: 'wholesale', label: 'Wholesale', icon: 'warehouse' },
            { id: 'distributor', label: 'Distributor', icon: 'local_shipping' },
            { id: 'online', label: 'Online Only', icon: 'language' },
        ],
        experienceLabel: 'Years in Business',
        experienceOptions: [
            { id: 'new', label: 'Just Starting', icon: '🚀' },
            { id: '1-3', label: '1 – 3 years', icon: '📈' },
            { id: '3-10', label: '3 – 10 years', icon: '🏪' },
            { id: '10-plus', label: '10+ years', icon: '🏆' },
        ],
    },
    service_provider: {
        headerIcon: 'engineering',
        headerGradient: 'from-amber-500 to-orange-600',
        headerShadow: 'shadow-orange-300/30',
        title: 'Service Details',
        subtitle: 'Tell us about the services you offer',
        scaleLabel: 'Team Size',
        scaleOptions: [
            { id: 'solo', label: 'Solo / Individual', icon: 'person' },
            { id: '2-5', label: '2 – 5 people', icon: 'group' },
            { id: '5-20', label: '5 – 20 people', icon: 'groups' },
            { id: '20-plus', label: '20+ people', icon: 'corporate_fare' },
        ],
        experienceLabel: 'Service Experience',
        experienceOptions: [
            { id: 'new', label: 'Just Starting', icon: '🔧' },
            { id: '1-3', label: '1 – 3 years', icon: '⚙️' },
            { id: '3-10', label: '3 – 10 years', icon: '🛠️' },
            { id: '10-plus', label: '10+ years', icon: '🏆' },
        ],
    },
    livestock_farmer: {
        headerIcon: 'pets',
        headerGradient: 'from-rose-500 to-pink-600',
        headerShadow: 'shadow-rose-300/30',
        title: 'Livestock Details',
        subtitle: 'Tell us about your livestock farm',
        scaleLabel: 'Herd / Flock Size',
        scaleOptions: [
            { id: 'less-10', label: 'Less than 10', icon: 'pets' },
            { id: '10-50', label: '10 – 50', icon: 'group' },
            { id: '50-200', label: '50 – 200', icon: 'groups' },
            { id: '200-plus', label: '200+', icon: 'corporate_fare' },
        ],
        experienceLabel: 'Rearing Experience',
        experienceOptions: [
            { id: 'new', label: 'Just Starting', icon: '🐣' },
            { id: '1-3', label: '1 – 3 years', icon: '🐄' },
            { id: '3-10', label: '3 – 10 years', icon: '🐃' },
            { id: '10-plus', label: '10+ years', icon: '🏆' },
        ],
    },
    buyer: {
        headerIcon: 'shopping_cart',
        headerGradient: 'from-purple-500 to-violet-600',
        headerShadow: 'shadow-purple-300/30',
        title: 'Buying Preferences',
        subtitle: 'Help us match you with the right sellers',
        scaleLabel: 'Buying Volume',
        scaleOptions: [
            { id: 'personal', label: 'Personal / Home', icon: 'home' },
            { id: 'small-biz', label: 'Small Business', icon: 'store' },
            { id: 'wholesale', label: 'Wholesale', icon: 'warehouse' },
            { id: 'export', label: 'Export Quantity', icon: 'flight_takeoff' },
        ],
        experienceLabel: 'Trading Experience',
        experienceOptions: [
            { id: 'new', label: 'First Time', icon: '🛒' },
            { id: '1-3', label: '1 – 3 years', icon: '📦' },
            { id: '3-10', label: '3 – 10 years', icon: '🏪' },
            { id: '10-plus', label: '10+ years', icon: '🏆' },
        ],
    },
    student: {
        headerIcon: 'school',
        headerGradient: 'from-teal-500 to-cyan-600',
        headerShadow: 'shadow-teal-300/30',
        title: 'Academic Details',
        subtitle: 'Tell us about your agricultural studies',
        scaleLabel: 'Study Level',
        scaleOptions: [
            { id: 'high-school', label: 'High School', icon: 'school' },
            { id: 'diploma', label: 'Diploma / ITI', icon: 'menu_book' },
            { id: 'undergraduate', label: 'Undergraduate', icon: 'history_edu' },
            { id: 'postgraduate', label: 'Postgraduate', icon: 'workspace_premium' },
            { id: 'research', label: 'PhD / Research', icon: 'biotech' },
        ],
        experienceLabel: 'Current Year',
        experienceOptions: [
            { id: '1st', label: '1st Year', icon: '📗' },
            { id: '2nd', label: '2nd Year', icon: '📘' },
            { id: '3rd', label: '3rd Year', icon: '📙' },
            { id: 'final', label: 'Final Year / Alumni', icon: '🎓' },
        ],
    },
};

const DEFAULT_STEP4: Step4Config = STEP4_BY_ROLE.farmer;

// ─── Component ────────────────────────────────────────────────────

export default function OnboardingPage() {
    const { user, loading, updateProfile, deleteAccount, fetchProfile } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [animateIn, setAnimateIn] = useState(true);
    const [emailChecking, setEmailChecking] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [emailPassword, setEmailPassword] = useState('');
    const [confirmEmailPassword, setConfirmEmailPassword] = useState('');
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [isDiscarding, setIsDiscarding] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const isSubmittingRef = useRef(false);

    const [formData, setFormData] = useState<OnboardingData>({
        full_name: '',
        email: '',
        role: '',
        interests: [],
        farm_location: '',
        district: '',
        state: '',
        pincode: '',
        farm_size: '',
        experience_years: '',
        phone: '',
    });

    // Pre-fill name and phone from auth if available
    useEffect(() => {
        if (user) {
            // Strip country code (+91) from phone if present for the 10-digit input
            let phoneDigits = user.phone || '';
            phoneDigits = phoneDigits.replace(/[+\s-]/g, ''); // remove +, spaces, dashes
            if (phoneDigits.startsWith('91') && phoneDigits.length === 12) {
                phoneDigits = phoneDigits.slice(2); // strip '91' prefix
            }

            // Check sessionStorage for name saved during registration (most reliable for OTP users)
            let regName = '';
            try { regName = sessionStorage.getItem('miraitu_reg_name') || ''; } catch { /* ignore */ }

            const nameToUse = user.displayName || regName;

            setFormData(prev => ({
                ...prev,
                full_name: nameToUse || prev.full_name,
                phone: phoneDigits || prev.phone,
            }));

            // Also fetch profile from DB in case displayName isn't loaded yet
            if (!nameToUse) {
                fetchProfile().then(profile => {
                    if (profile?.full_name) {
                        setFormData(prev => ({
                            ...prev,
                            full_name: prev.full_name || profile.full_name || '',
                        }));
                    }
                });
            }
        }
    }, [user, fetchProfile]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/user-login');
        }
    }, [user, loading, router]);

    // ── Navigation Guard: prevent leaving onboarding without completing ──
    useEffect(() => {
        // Warn on browser tab close / refresh
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSubmittingRef.current) return; // Allow navigation after successful submit
            e.preventDefault();
        };

        // Intercept browser back button
        const handlePopState = () => {
            if (isSubmittingRef.current) return;
            // Push state back to prevent actual navigation
            window.history.pushState(null, '', window.location.href);
            setShowDiscardModal(true);
        };

        // Push an extra history entry so popstate fires on back button
        window.history.pushState(null, '', window.location.href);

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Handle discard: delete account and redirect
    const handleDiscard = async () => {
        setIsDiscarding(true);
        try {
            const result = await deleteAccount();
            if (result.error) {
                setError('Failed to discard account. Please try again.');
                setShowDiscardModal(false);
                setIsDiscarding(false);
                return;
            }
            // Clear registration name from sessionStorage
            try { sessionStorage.removeItem('miraitu_reg_name'); } catch { /* ignore */ }
            isSubmittingRef.current = true; // Allow navigation
            router.replace('/user-register');
        } catch {
            setError('Something went wrong. Please try again.');
            setShowDiscardModal(false);
            setIsDiscarding(false);
        }
    };

    // Step animation
    const animateStep = useCallback((direction: 'next' | 'prev') => {
        setAnimateIn(false);
        setTimeout(() => {
            setCurrentStep(prev => direction === 'next' ? prev + 1 : prev - 1);
            setAnimateIn(true);
        }, 200);
    }, []);

    // Check if email is already taken
    const checkEmailDuplicate = async (emailToCheck: string): Promise<boolean> => {
        if (!emailToCheck.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) return false;
        setEmailChecking(true);
        setEmailError(null);
        try {
            const { default: supabase } = await import('@/lib/supabase');
            // Check if any other profile has this email
            const { data, error: fetchErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', emailToCheck.trim().toLowerCase())
                .neq('id', user?.id || '')
                .limit(1);
            if (fetchErr) return false;
            if (data && data.length > 0) {
                setEmailError('This email is already registered by another user. Please use a different email.');
                return true; // duplicate found
            }
            return false;
        } catch {
            return false;
        } finally {
            setEmailChecking(false);
        }
    };

    const handleNext = async () => {
        setError(null);
        setEmailError(null);
        setPasswordError(null);
        // Validation for each step
        if (currentStep === 1 && !formData.full_name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (currentStep === 1 && !formData.phone) {
            setError('Please enter your phone number');
            return;
        }
        if (currentStep === 1 && formData.phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        if (currentStep === 1 && formData.email.trim()) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setEmailError('Please enter a valid email address');
                return;
            }
            if (!emailPassword || emailPassword.length < 6) {
                setPasswordError('Please create a password with at least 6 characters');
                return;
            }
            if (emailPassword !== confirmEmailPassword) {
                setPasswordError('Password and confirm password do not match');
                return;
            }
            const isDuplicate = await checkEmailDuplicate(formData.email.trim());
            if (isDuplicate) return;
        }
        if (currentStep === 1 && !formData.role) {
            setError('Please select your role');
            return;
        }
        if (currentStep === 2 && formData.interests.length === 0) {
            setError('Please select at least one interest');
            return;
        }
        if (currentStep === 3 && !formData.state) {
            setError('Please select your state');
            return;
        }
        if (currentStep === 3 && !formData.farm_location.trim() && !formData.district.trim()) {
            setError('Please enter your village/city or use detect location');
            return;
        }
        animateStep('next');
    };

    const handleBack = () => {
        setError(null);
        animateStep('prev');
    };

    const toggleInterest = (id: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter(i => i !== id)
                : [...prev.interests, id],
        }));
    };

    // Detect user location via browser API
    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setLocationLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Reverse geocode using free Nominatim API
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=en`
                    );
                    const data = await res.json();
                    const addr = data.address || {};
                    setFormData(prev => ({
                        ...prev,
                        farm_location: [addr.village, addr.town, addr.city].filter(Boolean).join(', ') || addr.county || data.display_name?.split(',')[0] || '',
                        district: addr.state_district || addr.county || '',
                        state: addr.state || '',
                        pincode: addr.postcode || '',
                    }));
                } catch {
                    setError('Could not detect location. Please enter manually.');
                } finally {
                    setLocationLoading(false);
                }
            },
            () => {
                setError('Location access denied. Please enter manually.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Submit the onboarding form
    const handleSubmit = async () => {
        setPasswordError(null);
        if (!formData.state) {
            setError('Please select your state');
            return;
        }
        if (!formData.farm_location.trim() && !formData.district.trim()) {
            setError('Please enter your village/town or district');
            return;
        }
        if (!formData.phone || formData.phone.length !== 10) {
            setError('Please provide a valid 10-digit phone number in Step 1');
            return;
        }
        if (formData.email.trim()) {
            if (!emailPassword || emailPassword.length < 6) {
                setPasswordError('Please create a password with at least 6 characters');
                setCurrentStep(1);
                return;
            }
            if (emailPassword !== confirmEmailPassword) {
                setPasswordError('Password and confirm password do not match');
                setCurrentStep(1);
                return;
            }
        }
        setIsSubmitting(true);
        setError(null);

        try {
            // Wait briefly for auth state to stabilize after OTP sign-in
            await new Promise(r => setTimeout(r, 500));

            if (formData.email.trim()) {
                const { default: supabase } = await import('@/lib/supabase');
                const { error: authUpdateError } = await supabase.auth.updateUser({
                    email: formData.email.trim().toLowerCase(),
                    password: emailPassword,
                });

                if (authUpdateError) {
                    const msg = authUpdateError.message?.toLowerCase() || '';
                    if (msg.includes('already') || msg.includes('taken')) {
                        setEmailError('This email is already linked to another account. Please use a different email.');
                        setCurrentStep(1);
                        return;
                    }
                    setError(authUpdateError.message || 'Failed to set email/password. Please try again.');
                    setCurrentStep(1);
                    return;
                }
            }

            const profileData = {
                full_name: formData.full_name.trim(),
                role: formData.role,
                email: formData.email.trim().toLowerCase() || null,
                farm_location: [formData.farm_location, formData.district, formData.state].filter(Boolean).join(', '),
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone ? `+91${formData.phone}` : null,
                // These custom fields are stored as-is
                interests: formData.interests,
                farm_size: formData.farm_size,
                experience_years: formData.experience_years,
                onboarding_completed: true,
            } as Record<string, unknown>;

            const result = await updateProfile(profileData as never);
            if (result.error) {
                setError(result.error);
                return;
            }

            // Mark in sessionStorage so the app knows onboarding is done
            sessionStorage.setItem('miraitu_onboarding_done', 'true');
            // Clear registration name from sessionStorage
            try { sessionStorage.removeItem('miraitu_reg_name'); } catch { /* ignore */ }
            isSubmittingRef.current = true; // Allow navigation past the guard
            router.replace('/');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
                <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] animate-spin">progress_activity</span>
            </div>
        );
    }

    const progress = (currentStep / TOTAL_STEPS) * 100;

    return (
        <div className="relative min-h-screen bg-[var(--miraitu-background-light)] font-display overflow-hidden">
            {/* ── Discard Confirmation Modal ── */}
            {showDiscardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
                        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
                        </div>
                        <h3 className="text-lg font-black text-center text-gray-900 mb-2">Discard Setup?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Your profile setup is incomplete. If you leave now, your account will be deleted and you&apos;ll need to register again.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDiscard}
                                disabled={isDiscarding}
                                className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isDiscarding ? (
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                        Yes, Discard & Delete Account
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowDiscardModal(false)}
                                disabled={isDiscarding}
                                className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Cancel, Continue Setup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #e8f0e5 0%, #d4e5cf 50%, #c5dbbe 100%)' }} />
                {/* Floating circles */}
                <div className="absolute top-20 right-10 w-48 h-48 bg-[var(--miraitu-primary-green)]/5 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-32 left-10 w-64 h-64 bg-[var(--miraitu-lime-green)]/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200/10 rounded-full blur-3xl" />
                {/* Decorative leaves */}
                <svg className="absolute bottom-0 left-0 h-[40%] opacity-20" viewBox="0 0 200 400" fill="none">
                    <ellipse cx="30" cy="320" rx="80" ry="160" fill="rgba(83, 147, 93, 0.4)" transform="rotate(-20 30 320)" />
                    <ellipse cx="60" cy="350" rx="60" ry="120" fill="rgba(107, 171, 111, 0.45)" transform="rotate(-15 60 350)" />
                </svg>
                <svg className="absolute bottom-0 right-0 h-[35%] opacity-20" viewBox="0 0 150 400" fill="none">
                    <path d="M120,400 Q115,300 130,200" stroke="#6bab6f" strokeWidth="3" fill="none" />
                    <ellipse cx="132" cy="190" rx="8" ry="20" fill="#7cb880" transform="rotate(-10 132 190)" />
                    <ellipse cx="128" cy="160" rx="7" ry="18" fill="#7cb880" transform="rotate(-5 128 160)" />
                </svg>
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-green-200/50">
                <div className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                    <MiraituLogo size={36} />
                    <h2 className="text-[#0f1a11] text-lg font-extrabold tracking-tight">Miraitu</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--miraitu-primary-green)] bg-green-100 px-3 py-1 rounded-full">
                        Step {currentStep} of {TOTAL_STEPS}
                    </span>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="relative z-10 h-1.5 bg-green-100/50">
                <div
                    className="h-full bg-gradient-to-r from-[var(--miraitu-primary-green)] to-[var(--miraitu-lime-green)] rounded-r-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-80px)] py-8 px-4">
                <div className={`max-w-lg w-full transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* ═══ STEP 1: Name & Role ═══ */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Welcome Header */}
                            <div className="text-center mb-2">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--miraitu-primary-green)] to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-300/30">
                                    <span className="material-symbols-outlined text-white text-3xl">waving_hand</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-[#0f1a11] tracking-tight">Welcome to Miraitu!</h1>
                                <p className="text-[#53935d] mt-1 text-sm">Let&apos;s set up your profile in just a minute</p>
                            </div>

                            {/* Name Input */}
                            <div className="skeuo-card rounded-2xl p-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60 text-xl">person</span>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData(f => ({ ...f, full_name: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-base font-medium placeholder:text-gray-400"
                                        placeholder="Enter your full name"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Phone Number (mandatory for Google/email users, pre-filled for OTP users) */}
                            <div className="skeuo-card rounded-2xl p-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60 text-xl">call</span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData(f => ({ ...f, phone: digits }));
                                        }}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-base font-medium placeholder:text-gray-400"
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        readOnly={!!user?.phone}
                                    />
                                </div>
                                {user?.phone && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Verified via OTP
                                    </p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div className="skeuo-card rounded-2xl p-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Email Address <span className="text-gray-400">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60 text-xl">mail</span>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            const nextEmail = e.target.value;
                                            setFormData(f => ({ ...f, email: nextEmail }));
                                            setEmailError(null);
                                            if (!nextEmail.trim()) {
                                                setPasswordError(null);
                                                setEmailPassword('');
                                                setConfirmEmailPassword('');
                                            }
                                        }}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-base font-medium placeholder:text-gray-400 ${emailError ? 'border-red-300 bg-red-50/50' : 'border-green-200'
                                            }`}
                                        placeholder="you@example.com"
                                    />
                                    {emailChecking && (
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg animate-spin">progress_activity</span>
                                    )}
                                </div>
                                {emailError && (
                                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {emailError}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-1">Used for account recovery & notifications</p>

                                {formData.email.trim() && (
                                    <div className="mt-3 space-y-2.5">
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60 text-xl">lock</span>
                                            <input
                                                type="password"
                                                value={emailPassword}
                                                onChange={(e) => {
                                                    setEmailPassword(e.target.value);
                                                    setPasswordError(null);
                                                }}
                                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-base font-medium placeholder:text-gray-400 ${passwordError ? 'border-red-300 bg-red-50/50' : 'border-green-200'}`}
                                                placeholder="Create password (min 6 characters)"
                                            />
                                        </div>

                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--miraitu-primary-green)]/60 text-xl">lock_reset</span>
                                            <input
                                                type="password"
                                                value={confirmEmailPassword}
                                                onChange={(e) => {
                                                    setConfirmEmailPassword(e.target.value);
                                                    setPasswordError(null);
                                                }}
                                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-base font-medium placeholder:text-gray-400 ${passwordError ? 'border-red-300 bg-red-50/50' : 'border-green-200'}`}
                                                placeholder="Confirm password"
                                            />
                                        </div>

                                        {passwordError && (
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                {passwordError}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-gray-400">You can use this email + password for future login instead of OTP.</p>
                                    </div>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div className="skeuo-card rounded-2xl p-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">I am a...</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setFormData(f => ({ ...f, role: role.id, interests: [], farm_size: '', experience_years: '' }))}
                                            className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 group ${formData.role === role.id
                                                ? `${role.border} ${role.activeBg} scale-[1.02] shadow-md`
                                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                                                }`}
                                        >
                                            {formData.role === role.id && (
                                                <div className="absolute top-1.5 right-1.5">
                                                    <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-lg">check_circle</span>
                                                </div>
                                            )}
                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-sm ${formData.role === role.id ? 'shadow-md scale-110' : 'group-hover:scale-105'
                                                } transition-transform`}>
                                                <span className="material-symbols-outlined text-white text-xl">{role.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold ${formData.role === role.id ? 'text-gray-900' : 'text-gray-700'}`}>{role.label}</span>
                                            <span className="text-[10px] text-gray-400 text-center leading-tight">{role.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 2: Role-Specific Interests ═══ */}
                    {currentStep === 2 && (() => {
                        const roleInterests = INTERESTS_BY_ROLE[formData.role] || DEFAULT_INTERESTS;
                        const selectedRole = ROLES.find(r => r.id === formData.role);
                        return (
                            <div className="space-y-6">
                                <div className="text-center mb-2">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${selectedRole?.color || 'from-purple-500 to-indigo-600'} rounded-2xl mb-4 shadow-lg shadow-purple-300/30`}>
                                        <span className="material-symbols-outlined text-white text-3xl">{selectedRole?.icon || 'interests'}</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-[#0f1a11] tracking-tight">
                                        {selectedRole ? `What interests you as a ${selectedRole.label}?` : 'What interests you?'}
                                    </h1>
                                    <p className="text-[#53935d] mt-1 text-sm">Select all that apply — we&apos;ll personalize your experience</p>
                                </div>

                                <div className="skeuo-card rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Interests</label>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${formData.interests.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {formData.interests.length} selected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {roleInterests.map(interest => {
                                            const isSelected = formData.interests.includes(interest.id);
                                            return (
                                                <button
                                                    key={interest.id}
                                                    onClick={() => toggleInterest(interest.id)}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                        ? `border-[var(--miraitu-primary-green)] bg-green-50 shadow-sm`
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg ${interest.bg} flex items-center justify-center flex-shrink-0 ${isSelected ? 'scale-110' : ''
                                                        } transition-transform`}>
                                                        <span className={`material-symbols-outlined ${interest.color} text-lg`}>{interest.icon}</span>
                                                    </div>
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'} text-left leading-tight`}>{interest.label}</span>
                                                    {isSelected && (
                                                        <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-sm ml-auto flex-shrink-0">check</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ═══ STEP 3: Location ═══ */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-2">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-300/30">
                                    <span className="material-symbols-outlined text-white text-3xl">location_on</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-[#0f1a11] tracking-tight">Where are you located?</h1>
                                <p className="text-[#53935d] mt-1 text-sm">Help us connect you with nearby services & farmers</p>
                            </div>

                            {/* Auto-detect Location Button */}
                            <button
                                onClick={detectLocation}
                                disabled={locationLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-300/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
                            >
                                {locationLoading ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                        Detecting your location...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">my_location</span>
                                        Auto-detect My Location
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">or enter manually</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="skeuo-card rounded-2xl p-5 space-y-4">
                                {/* Village/Town/City */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Village / Town / City <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500/60 text-lg">home</span>
                                        <input
                                            type="text"
                                            value={formData.farm_location}
                                            onChange={(e) => setFormData(f => ({ ...f, farm_location: e.target.value }))}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                                            placeholder="e.g. Nashik, Karjat"
                                        />
                                    </div>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">District</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500/60 text-lg">map</span>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData(f => ({ ...f, district: e.target.value }))}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                                            placeholder="e.g. Nashik, Pune"
                                        />
                                    </div>
                                </div>

                                {/* State Dropdown */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">State *</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500/60 text-lg">flag</span>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => setFormData(f => ({ ...f, state: e.target.value }))}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="">Select your state</option>
                                            {INDIAN_STATES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Pincode <span className="text-gray-400">(optional)</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500/60 text-lg">pin_drop</span>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={formData.pincode}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setFormData(f => ({ ...f, pincode: digits }));
                                            }}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-green-200 bg-white focus:border-[var(--miraitu-primary-green)] outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                                            placeholder="e.g. 422001"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 4: Role-Specific Details & Summary ═══ */}
                    {currentStep === 4 && (() => {
                        const step4 = STEP4_BY_ROLE[formData.role] || DEFAULT_STEP4;
                        return (
                            <div className="space-y-6">
                                <div className="text-center mb-2">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step4.headerGradient} rounded-2xl mb-4 shadow-lg ${step4.headerShadow}`}>
                                        <span className="material-symbols-outlined text-white text-3xl">{step4.headerIcon}</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-[#0f1a11] tracking-tight">{step4.title}</h1>
                                    <p className="text-[#53935d] mt-1 text-sm">{step4.subtitle}</p>
                                </div>

                                {/* Scale / Size */}
                                <div className="skeuo-card rounded-2xl p-5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">{step4.scaleLabel} <span className="text-gray-400">(optional)</span></label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {step4.scaleOptions.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => setFormData(f => ({ ...f, farm_size: f.farm_size === size.id ? '' : size.id }))}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 ${formData.farm_size === size.id
                                                    ? 'border-[var(--miraitu-primary-green)] bg-green-50 shadow-sm'
                                                    : 'border-gray-100 bg-white hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${formData.farm_size === size.id ? 'text-[var(--miraitu-primary-green)]' : 'text-gray-400'}`}>{size.icon}</span>
                                                <span className={`text-xs font-bold ${formData.farm_size === size.id ? 'text-gray-900' : 'text-gray-600'}`}>{size.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="skeuo-card rounded-2xl p-5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">{step4.experienceLabel} <span className="text-gray-400">(optional)</span></label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {step4.experienceOptions.map(exp => (
                                            <button
                                                key={exp.id}
                                                onClick={() => setFormData(f => ({ ...f, experience_years: f.experience_years === exp.id ? '' : exp.id }))}
                                                className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 ${formData.experience_years === exp.id
                                                    ? 'border-[var(--miraitu-primary-green)] bg-green-50 shadow-sm'
                                                    : 'border-gray-100 bg-white hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-xl">{exp.icon}</span>
                                                <span className={`text-xs font-bold ${formData.experience_years === exp.id ? 'text-gray-900' : 'text-gray-600'}`}>{exp.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="skeuo-card rounded-2xl p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-[var(--miraitu-primary-green)] text-lg">preview</span>
                                        <label className="text-[10px] font-bold text-[var(--miraitu-primary-green)] uppercase tracking-wider">Your Profile Summary</label>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-base">person</span>
                                            <span className="font-bold text-gray-800">{formData.full_name || '—'}</span>
                                        </div>
                                        {formData.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-base">mail</span>
                                                <span className="text-gray-600">{formData.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-base">badge</span>
                                            <span className="text-gray-600 capitalize">{ROLES.find(r => r.id === formData.role)?.label || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-base">location_on</span>
                                            <span className="text-gray-600">
                                                {[formData.farm_location, formData.district, formData.state].filter(Boolean).join(', ') || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-base">interests</span>
                                            <span className="text-gray-600">{formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''} selected</span>
                                        </div>
                                        {formData.farm_size && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-base">{step4.headerIcon}</span>
                                                <span className="text-gray-600">{step4.scaleLabel}: {step4.scaleOptions.find(s => s.id === formData.farm_size)?.label || formData.farm_size}</span>
                                            </div>
                                        )}
                                        {formData.experience_years && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-base">timeline</span>
                                                <span className="text-gray-600">{step4.experienceLabel}: {step4.experienceOptions.find(e => e.id === formData.experience_years)?.label || formData.experience_years}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8 mb-12">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back
                            </button>
                        )}
                        {currentStep < TOTAL_STEPS ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[var(--miraitu-primary-green)] to-emerald-600 text-white text-sm font-bold shadow-lg shadow-green-300/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        ) : (
                            <>
                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !agreedToTerms}
                                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[var(--miraitu-primary-green)] to-emerald-600 text-white text-sm font-bold shadow-lg shadow-green-300/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            Complete Setup
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 pb-6">
                        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
                            <div
                                key={step}
                                className={`h-2 rounded-full transition-all duration-300 ${step === currentStep
                                    ? 'w-8 bg-[var(--miraitu-primary-green)]'
                                    : step < currentStep
                                        ? 'w-2 bg-[var(--miraitu-primary-green)]/60'
                                        : 'w-2 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
