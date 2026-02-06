'use client';

import Link from 'next/link';

const tools = [
    {
        id: 'interest-calculator',
        name: 'Interest Calculator',
        description: 'Estimate KCC loans, farm credit interests, and repayment schedules instantly.',
        icon: 'calculate',
        color: 'primary',
        bgColor: 'bg-primary/10',
        textColor: 'text-primary',
        hoverBg: 'group-hover:bg-primary',
        buttonBg: 'bg-primary/5',
        buttonText: 'Open Tool',
        path: '/v2/toolbox/interest-calculator',
    },
    {
        id: 'land-area',
        name: 'Land Area Tool',
        description: 'Map-based perimeter and area measurement. Supports Acres, Bigha, and Hectares.',
        icon: 'map',
        color: 'blue',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600',
        hoverBg: 'group-hover:bg-blue-600',
        buttonBg: 'bg-blue-500/5',
        buttonText: 'Start Mapping',
        path: '/v2/toolbox/land-area',
    },
    {
        id: 'crop-costing',
        name: 'Crop Costing',
        description: 'Track input costs: Seeds, Fertilizers, Labor, and Irrigation to calculate ROI.',
        icon: 'inventory_2',
        color: 'amber',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600',
        hoverBg: 'group-hover:bg-amber-600',
        buttonBg: 'bg-amber-500/5',
        buttonText: 'Calculate ROI',
        path: '/v2/toolbox/crop-costing',
    },
    {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert weight, volume, and local land units across different regions seamlessly.',
        icon: 'swap_horiz',
        color: 'orange',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-600',
        hoverBg: 'group-hover:bg-orange-600',
        buttonBg: 'bg-orange-500/5',
        buttonText: 'Convert Units',
        path: '/v2/toolbox/unit-converter',
    },
];

export default function ToolboxPage() {
    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-6 pt-12 pb-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary dark:text-[#f9fbf9] mb-4">
                                Smart Agri-Toolbox
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl">
                                Precision instruments for the modern farm. Calculate, estimate, and plan your operations with data-driven accuracy.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="skeuo-card rounded-2xl p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                                    <span className="material-symbols-outlined font-bold">wb_sunny</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Local Weather</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">32°C • Sunny</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {tools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={tool.path}
                                className="skeuo-card group rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 border border-white/40 dark:border-gray-700/40"
                            >
                                <div className={`mb-6 h-24 w-24 rounded-full ${tool.bgColor} flex items-center justify-center ${tool.textColor} group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-5xl">{tool.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{tool.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{tool.description}</p>
                                <div className={`mt-auto w-full py-3 ${tool.buttonBg} rounded-xl font-bold ${tool.textColor} ${tool.hoverBg} group-hover:text-white transition-colors`}>
                                    {tool.buttonText}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Yield Prediction Pro Section */}
                    <section className="mb-20">
                        <div className="skeuo-card rounded-[3rem] overflow-hidden border-4 border-white/50 dark:border-gray-700/50">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 w-fit">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        Pro Services Available
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
                                        Advanced <span className="text-primary">Yield Prediction</span> <br />AI for Your Fields
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                        Combine satellite data with historic soil records to forecast your harvest volume. Plan logistics and market entries with confidence.
                                    </p>
                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">satellite_alt</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">Multispectral Satellite Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">query_stats</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">Climate Pattern Correlation</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">eco</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">Soil Health Integration</span>
                                        </div>
                                    </div>
                                    <button className="vibrant-gradient px-10 py-5 rounded-2xl text-white font-black text-xl shadow-2xl shadow-primary/40 hover:brightness-110 active:scale-95 transition-all w-fit">
                                        UPGRADE TO PRO
                                    </button>
                                </div>
                                <div className="lg:w-1/2 relative min-h-[400px]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop')" }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#161d15] lg:from-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 right-8 skeuo-card p-6 rounded-2xl border border-white/20 backdrop-blur-md bg-white/60 dark:bg-black/60">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Confidence Level</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-primary">94.2%</span>
                                            <span className="text-sm font-bold text-green-600 mb-1">+2.4% vs last season</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Access Tools */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary text-2xl">apps</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">More Tools</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { name: 'Weather Alerts', icon: 'thunderstorm', color: 'text-blue-500' },
                                { name: 'Soil Testing', icon: 'science', color: 'text-amber-600' },
                                { name: 'Market Rates', icon: 'trending_up', color: 'text-green-600' },
                                { name: 'Profit Estimator', icon: 'payments', color: 'text-purple-600' },
                                { name: 'Irrigation Calc', icon: 'water_drop', color: 'text-cyan-600' },
                                { name: 'Fertilizer Guide', icon: 'compost', color: 'text-orange-600' },
                            ].map((item) => (
                                <button
                                    key={item.name}
                                    className="skeuo-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all group"
                                >
                                    <div className={`h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}
