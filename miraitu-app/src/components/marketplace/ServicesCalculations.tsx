'use client';

import { useState } from 'react';

export default function ServicesCalculations() {
    const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);

    const farmWorkers = [
        {
            id: 1,
            name: 'Rajesh Kumar',
            gender: 'Male',
            skill: 'General Labor',
            experience: '5 years',
            rate: '₹500/day',
            photo: '👨‍🌾',
        },
        {
            id: 2,
            name: 'Sunita Devi',
            gender: 'Female',
            skill: 'Harvesting',
            experience: '3 years',
            rate: '₹450/day',
            photo: '👩‍🌾',
        },
        {
            id: 3,
            name: 'Amit Patil',
            gender: 'Male',
            skill: 'Tractor Operator',
            experience: '8 years',
            rate: '₹800/day',
            photo: '👨‍🌾',
        },
    ];

    const skilledServices = [
        { id: 1, service: 'Mechanic', icon: '🔧', available: 12, rate: '₹600/hr' },
        { id: 2, service: 'Electrician', icon: '⚡', available: 8, rate: '₹550/hr' },
        { id: 3, service: 'Plumber', icon: '🚰', available: 6, rate: '₹500/hr' },
    ];

    const logisticsServices = [
        { id: 1, title: 'Truck Transport', icon: '🚚', action: 'Upload Request' },
        { id: 2, title: 'Tractor Rental', icon: '🚜', action: 'Upload Request' },
        { id: 3, title: 'Cold Storage', icon: '❄️', action: 'Call Now' },
        { id: 4, title: 'Godowns', icon: '🏭', action: 'Call Now' },
    ];

    const calculators = [
        { id: 'interest', name: 'Interest Calculator', icon: '💰', description: 'Calculate loan interest' },
        { id: 'land', name: 'Land Area Calculator', icon: '🗺️', description: 'Measure farm area' },
        { id: 'crop', name: 'Crop Cost Calculator', icon: '🌾', description: 'Estimate cultivation cost' },
    ];

    return (
        <div>
            {/* Farm Workers Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Farm Workers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farmWorkers.map((worker) => (
                        <div
                            key={worker.id}
                            className="p-5 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all"
                        >
                            {/* Profile */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8eede] to-[#d4e0c8] flex items-center justify-center text-4xl shadow-md">
                                    {worker.photo}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-primary-dark">{worker.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${worker.gender === 'Male'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-pink-100 text-pink-800'
                                            }`}>
                                            {worker.gender}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-soil-dark font-medium">Skill:</span>
                                    <span className="font-bold text-primary-dark">{worker.skill}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-soil-dark font-medium">Experience:</span>
                                    <span className="font-bold text-primary-dark">{worker.experience}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-soil-dark font-medium">Rate:</span>
                                    <span className="font-bold text-primary">{worker.rate}</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">call</span>
                                Call Worker
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skilled Services Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">build</span>
                    Skilled Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {skilledServices.map((service) => (
                        <div
                            key={service.id}
                            className="p-6 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all text-center"
                        >
                            <div className="text-6xl mb-3">{service.icon}</div>
                            <h4 className="text-lg font-bold text-primary-dark mb-2">{service.service}</h4>
                            <p className="text-sm text-soil-dark mb-2">{service.available} Available</p>
                            <p className="text-xl font-black text-primary mb-4">{service.rate}</p>
                            <button className="w-full px-4 py-2 rounded-xl bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] font-bold text-sm text-primary-dark transition-all">
                                View Listings
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logistics & Storage Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    Logistics & Storage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {logisticsServices.map((service) => (
                        <div
                            key={service.id}
                            className="p-5 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all text-center"
                        >
                            <div className="text-5xl mb-3">{service.icon}</div>
                            <h4 className="text-md font-bold text-primary-dark mb-3">{service.title}</h4>
                            <button className="w-full px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                {service.action.includes('Call') ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        {service.action}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">upload</span>
                                        {service.action}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Soil Testing Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">science</span>
                    Soil Testing
                </h3>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e8eede] to-[#d4e0c8] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff]">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/80 flex items-center justify-center text-6xl shadow-lg">
                            🧪
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-bold text-primary-dark mb-2">Professional Soil Analysis</h4>
                            <p className="text-soil-dark mb-4">Get detailed soil health reports and fertilizer recommendations</p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <button className="px-6 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_4px_0_0_#1a3617] hover:shadow-[0_2px_0_0_#1a3617] active:translate-y-1 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                    Online Booking
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] font-bold text-primary-dark transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined">info</span>
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agri-Toolbox - Calculators Section */}
            <div>
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calculate</span>
                    Agri-Toolbox
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {calculators.map((calc) => (
                        <button
                            key={calc.id}
                            onClick={() => setSelectedCalculator(calc.id)}
                            className="group p-6 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform">
                                <span className="text-5xl">{calc.icon}</span>
                            </div>
                            <h4 className="text-lg font-bold text-primary-dark mb-2">{calc.name}</h4>
                            <p className="text-sm text-soil-dark mb-3">{calc.description}</p>
                            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                                <span>Open Calculator</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Calculator Modal/Widget */}
                {selectedCalculator && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#fbfaf9] rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-primary-dark">
                                    {calculators.find(c => c.id === selectedCalculator)?.name}
                                </h3>
                                <button
                                    onClick={() => setSelectedCalculator(null)}
                                    className="w-10 h-10 rounded-full bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] flex items-center justify-center transition-all"
                                >
                                    <span className="material-symbols-outlined text-soil-dark">close</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-soil-dark">Calculator interface will be implemented here.</p>
                                <div className="p-8 rounded-xl bg-[#e8eede] text-center">
                                    <span className="text-6xl">
                                        {calculators.find(c => c.id === selectedCalculator)?.icon}
                                    </span>
                                    <p className="mt-4 text-sm text-soil-dark">
                                        {calculators.find(c => c.id === selectedCalculator)?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
