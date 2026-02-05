'use client';

const services = [
    {
        icon: 'psychiatry',
        title: 'Farm Services',
        description: 'Professional consultation, automated spraying, and precision irrigation setup.',
        buttonText: 'BOOK NOW',
        link: '#',
    },
    {
        icon: 'groups',
        title: 'Book Labour',
        description: 'Reliable help for general tasks, skilled operations, and bulk harvesting.',
        buttonText: 'FIND LABOUR',
        link: '#',
    },
    {
        icon: 'storefront',
        title: 'Buy & Sell',
        description: 'Direct shortcut to our national marketplace for livestock and machinery.',
        buttonText: 'GO TO MARKET',
        link: '#',
    },
    {
        icon: 'calculate',
        title: 'Agri-Calculators',
        description: 'Quick access to our toolbox for yield prediction and input calculation.',
        buttonText: 'OPEN TOOLS',
        link: '#',
    },
    {
        icon: 'water_drop',
        title: 'Borewell Booking',
        description: 'One-click request for geological surveys and depth estimation services.',
        buttonText: 'REQUEST SURVEY',
        link: '/v2/borewell',
    },
    {
        icon: 'water',
        title: 'Pond Layout',
        description: 'Instant quotes for fish farm sizing and pond liner calculations.',
        buttonText: 'GET QUOTE',
        link: '/v2/protection',
    },
    {
        icon: 'solar_power',
        title: 'Solar Setup',
        description: 'Estimation tool for solar-powered fencing and CCTV camera systems.',
        buttonText: 'CALCULATE',
        link: '/v2/cctv',
    },
];

export default function QuickServices() {
    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tight text-[#121811] dark:text-white mb-2">
                        Quick Services
                    </h2>
                    <p className="text-gray-500 font-medium">
                        Instant access to our most requested agricultural support tools and services.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <a key={index} href={service.link}>
                            <div className="skeuo-card service-card-hover rounded-3xl p-8 border border-white/50 dark:border-white/5 transition-all duration-300 flex flex-col items-center text-center h-full cursor-pointer">
                                <div className="tactile-icon w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl text-lush-green font-bold">
                                        {service.icon}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black mb-3">{service.title}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-grow">{service.description}</p>
                                <button className="glossy-button w-full rounded-xl py-3 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                                    {service.buttonText}
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
