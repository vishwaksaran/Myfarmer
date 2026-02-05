'use client';

export default function WaterEnergySection() {
    const categories = [
        {
            id: 'borewell',
            icon: 'water_drop',
            title: 'Borewell Services',
            description: 'Professional drilling and pump installation with depth calculator and expert consultation.',
            features: ['Depth Calculator', 'Expert Consultation', 'Quality Testing'],
            link: '/v2/borewell',
            gradient: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
        },
        {
            id: 'cctv',
            icon: 'videocam',
            title: 'CCTV Surveillance',
            description: 'Solar-powered security systems for theft prevention and livestock monitoring.',
            features: ['Solar Powered', 'Night Vision', 'Mobile Monitoring'],
            link: '/v2/cctv',
            gradient: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <section className="px-6 py-16">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 text-center">
                    <span className="inline-block mb-4 rounded-full bg-accent/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                        Water & Energy Solutions
                    </span>
                    <h2 className="text-4xl font-black tracking-tight text-[#121811] dark:text-white mb-4">
                        Essential Infrastructure for Modern Farms
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                        Invest in sustainable water supply and security systems to protect your assets and ensure productivity.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="skeuo-card rounded-[2rem] overflow-hidden border border-white/50 dark:border-white/5 group hover:shadow-2xl transition-all duration-300"
                        >
                            <div className={`${category.bgColor} p-8 pb-6`}>
                                <div className={`inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br ${category.gradient} text-white mb-4 shadow-lg`}>
                                    <span className="material-symbols-outlined text-3xl">{category.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-2">{category.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{category.description}</p>
                            </div>

                            <div className="p-8 pt-6">
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {category.features.map((feature, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                                        >
                                            <span className="material-symbols-outlined text-xs">check</span>
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <a href={category.link}>
                                    <button className="glossy-button w-full rounded-xl py-4 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 group-hover:brightness-110 transition-all">
                                        Explore Services
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
