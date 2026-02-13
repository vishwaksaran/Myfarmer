'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const serviceData: Record<string, any> = {
    'harvester': {
        title: 'Harvester Services',
        icon: 'agriculture',
        description: 'Book modern harvesting machines for efficient crop harvesting.',
        features: ['Wheat & Rice Harvesters', 'Sugarcane Harvesters', 'Experienced Operators', 'Hourly/Acre Rates'],
        color: 'green',
        price: 'From ₹1200/acre',
        stats: [{ label: 'Machines', value: '45+' }, { label: 'Bookings', value: '1.2k+' }],
    },
    'drone-spray': {
        title: 'Drone Spraying',
        icon: 'flight',
        description: 'Precision aerial spraying for pesticides and liquid fertilizers.',
        features: ['10L - 25L Capacity', '10 Acres/Hour', 'Uniform Spraying', 'Reduced Chemical Use'],
        color: 'green',
        price: 'From ₹400/acre',
        stats: [{ label: 'Pilots', value: '28+' }, { label: 'Acres Covered', value: '5k+' }],
    },
    'farm-labours': {
        title: 'Skilled Farm Labour',
        icon: 'group',
        description: 'Hire experienced workers for planting, weeding, and harvesting.',
        features: ['Verified Workers', 'Groups Available', 'Daily/Contract Basis', 'Skill Matched'],
        color: 'green',
        price: 'From ₹400/day',
        stats: [{ label: 'Workers', value: '120+' }, { label: 'Happy Farmers', value: '500+' }],
    },
    'transportation': {
        title: 'Agri-Logistics',
        icon: 'local_shipping',
        description: 'Reliable transport vehicles for moving your produce to market.',
        features: ['Pickup Trucks', 'Tractor Trolleys', 'Cold Storage Vans', 'Live Tracking'],
        color: 'green',
        price: 'From ₹25/km',
        stats: [{ label: 'Vehicles', value: '80+' }, { label: 'Trips', value: '3k+' }],
    },
    'technician': {
        title: 'Farm Technician',
        icon: 'engineering',
        description: 'Expert technicians for farm equipment and systems.',
        features: ['System Installation', 'Regular Maintenance', 'Emergency Repairs', 'Tech Support'],
        color: 'amber',
        price: 'From ₹500/visit',
        stats: [{ label: 'Technicians', value: '50+' }, { label: 'Repairs', value: '2k+' }],
    },
    'plumber': {
        title: 'Farm Plumber',
        icon: 'plumbing',
        description: 'Expert plumbing services for irrigation and water systems.',
        features: ['Irrigation Setup', 'Pump Repair', 'Pipeline Installation', 'Leak Fixes'],
        color: 'green',
        price: 'From ₹400/visit',
        stats: [{ label: 'Plumbers', value: '40+' }, { label: 'Projects', value: '1.5k+' }],
    },
    'electrician': {
        title: 'Agri-Electrician',
        icon: 'electrical_services',
        description: 'Certified electricians for farm motors and wiring.',
        features: ['Motor Winding', 'Panel Board Setup', 'Wiring Faults', 'Solar Connect'],
        color: 'green',
        price: 'From ₹400/visit',
        stats: [{ label: 'Electricians', value: '35+' }, { label: 'Jobs', value: '3k+' }],
    },
    'mechanic': {
        title: 'Tractor Mechanic',
        icon: 'build_circle',
        description: 'Specialized mechanics for tractors and farm machinery.',
        features: ['Engine Overhaul', 'Hydraulic Repair', 'On-site Service', 'Genuine Parts'],
        color: 'green',
        price: 'From ₹600/visit',
        stats: [{ label: 'Mechanics', value: '60+' }, { label: 'Serviced', value: '5k+' }],
    },
    'milk-vendors': {
        title: 'Milk Vendors',
        icon: 'water_drop',
        description: 'Connect with local milk vendors for fresh dairy supply.',
        features: ['Fresh Cow/Buffalo Milk', 'Morning/Evening Delivery', 'Bulk Supply', 'Dairy Products'],
        color: 'green',
        price: 'From ₹60/L',
        stats: [{ label: 'Vendors', value: '80+' }, { label: 'Daily Liters', value: '2.5k+' }],
    },
    'storage-godown': {
        title: 'Storage & Godowns',
        icon: 'warehouse',
        description: 'Secure storage facilities and godowns for your agricultural produce.',
        features: ['Climate Control', 'Pest Management', '24/7 Security', 'Insurance Coverage'],
        color: 'green',
        price: 'From ₹1.5/kg/mo',
        stats: [{ label: 'Facilities', value: '20+' }, { label: 'Capacity', value: '10k Tons' }],
    },
};

export default function GenericServicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = serviceData[slug];

    if (!service) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">error</span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Not Found</h1>
                    <p className="text-gray-500 mb-6">The service you are looking for is not available or coming soon.</p>
                    <Link href="/home/services" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                        Browse Services
                    </Link>
                </div>
            </div>
        );
    }

    const colorClasses: Record<string, any> = {
        'green': { bg: 'bg-green-500', bgLight: 'bg-green-50', hover: 'hover:bg-green-600', text: 'text-green-600', icon: 'text-green-500' },
        'cyan': { bg: 'bg-cyan-500', bgLight: 'bg-cyan-50', hover: 'hover:bg-cyan-600', text: 'text-cyan-600', icon: 'text-cyan-500' },
        'teal': { bg: 'bg-teal-500', bgLight: 'bg-teal-50', hover: 'hover:bg-teal-600', text: 'text-teal-600', icon: 'text-teal-500' },
        'indigo': { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', hover: 'hover:bg-indigo-600', text: 'text-indigo-600', icon: 'text-indigo-500' },
        'amber': { bg: 'bg-amber-500', bgLight: 'bg-amber-50', hover: 'hover:bg-amber-600', text: 'text-amber-600', icon: 'text-amber-500' },
        'blue': { bg: 'bg-blue-500', bgLight: 'bg-blue-50', hover: 'hover:bg-blue-600', text: 'text-blue-600', icon: 'text-blue-500' },
        'yellow': { bg: 'bg-yellow-500', bgLight: 'bg-yellow-50', hover: 'hover:bg-yellow-600', text: 'text-yellow-600', icon: 'text-yellow-500' },
        'red': { bg: 'bg-red-500', bgLight: 'bg-red-50', hover: 'hover:bg-red-600', text: 'text-red-600', icon: 'text-red-500' },
        'rose': { bg: 'bg-rose-500', bgLight: 'bg-rose-50', hover: 'hover:bg-rose-600', text: 'text-rose-600', icon: 'text-rose-500' },
    };
    const colors = colorClasses[service.color] || colorClasses['green'];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero */}
            <section className={`relative px-6 py-12 ${colors.bgLight} dark:bg-opacity-10`}>
                <div className="mx-auto max-w-[1280px]">
                    <div className="absolute top-6 left-6 md:left-12">
                        <Link
                            href="/home/services"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-sm font-bold hover:bg-white/80 dark:hover:bg-black/40 transition-all text-gray-700 dark:text-gray-200"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Services
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 pt-10">
                        <div className={`size-24 rounded-[2rem] ${colors.bg} flex items-center justify-center text-white shadow-2xl`}>
                            <span className="material-symbols-outlined text-5xl">{service.icon}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{service.title}</h1>
                            <p className="text-xl text-gray-500 max-w-2xl">{service.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {service.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${colors.icon}`}>check_circle</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-4">Availability & Pricing</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                                    <span className="text-gray-500">Base Price</span>
                                    <span className={`text-2xl font-black ${colors.text}`}>{service.price}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {service.stats.map((stat: any, idx: number) => (
                                        <div key={idx} className="text-center p-4">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Booking Form Side Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Book Service</h3>
                                <p className="text-sm text-gray-500 mb-6">Fill details to get callbacks from providers</p>

                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <input type="text" placeholder="Your Name" className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none" />
                                    <input type="tel" placeholder="Phone Number" className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none" />
                                    <input type="text" placeholder="Location/Village" className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none" />
                                    <input type="date" className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none" />

                                    <button className={`w-full py-4 rounded-xl ${colors.bg} ${colors.hover} text-white font-bold text-lg transition-all shadow-lg mt-2`}>
                                        FIND PROVIDERS
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
