'use client';



const teamMembers = [
    {
        name: 'M. Raju',
        role: 'Founder & CEO',
        image: '/team/raju.jpeg',
        linkedin: 'https://www.linkedin.com/in/raju-m07',
        description: 'Visionary leader with a deep passion for transforming Indian agriculture. Raju founded Miraitu with the mission to empower every farmer with technology and fair market access.',
    },
    {
        name: 'R.S. VishwakSaran',
        role: 'Co-Founder & CTO',
        image: '/team/vishwaksaran.jpeg',
        linkedin: 'https://www.linkedin.com/in/vishwaksaran',
        description: 'Tech innovator driving Miraitu\'s platform architecture. VishwakSaran brings cutting-edge technology to simplify farming operations and create seamless digital experiences.',
    },
    {
        name: 'CA Manpreet Singh',
        role: 'Director & CFO',
        image: '/team/manpreeth.jpeg',
        linkedin: 'https://www.linkedin.com/in/camanpreethsingh',
        description: 'Financial strategist ensuring sustainable growth. Manpreet oversees financial operations, investor relations, and strategic planning to fuel Miraitu\'s expansion.',
    },
];

const pillars = [
    {
        icon: 'visibility',
        title: 'Our Vision',
        description: 'To become India\'s most trusted agricultural super-app — connecting every farmer with the tools, markets, and knowledge they need to thrive in the modern economy.',
        gradient: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50 dark:bg-blue-950/20',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        icon: 'rocket_launch',
        title: 'Our Mission',
        description: 'To empower 10 million farmers by 2030 with a unified platform for machinery, livestock, finance, services, and community — removing middlemen and increasing farmer incomes.',
        gradient: 'from-green-500 to-emerald-600',
        bgLight: 'bg-green-50 dark:bg-green-950/20',
        iconBg: 'bg-green-100 dark:bg-green-900/40',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    {
        icon: 'flag',
        title: 'Our Goals',
        description: 'Expand to all 700+ districts across India, onboard 50,000+ verified sellers, and create a self-sustaining ecosystem where farmers buy, sell, and grow — all from one app.',
        gradient: 'from-orange-500 to-amber-600',
        bgLight: 'bg-orange-50 dark:bg-orange-950/20',
        iconBg: 'bg-orange-100 dark:bg-orange-900/40',
        iconColor: 'text-orange-600 dark:text-orange-400',
    },
];

const impactStats = [
    { value: '200+', label: 'Districts Covered', icon: 'location_on' },
    { value: '50K+', label: 'Farmers Connected', icon: 'groups' },
    { value: '10K+', label: 'Products Listed', icon: 'inventory' },
    { value: '4.8★', label: 'App Rating', icon: 'star' },
];

export default function AboutPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">

            {/* ═══════════════════════════════════════════════════════ */}
            {/* Hero Banner — "Bringing Nature & Innovation"          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden">
                {/* Background Image + Overlay */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')`,
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a14]/95 via-[#1a3a14]/80 to-[#1a3a14]/60"></div>
                    {/* Animated Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-[10%] w-3 h-3 bg-[#B0EA3C]/30 rounded-full animate-pulse"></div>
                        <div className="absolute top-40 right-[20%] w-2 h-2 bg-[#B0EA3C]/20 rounded-full animate-ping"></div>
                        <div className="absolute bottom-32 left-[30%] w-4 h-4 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-60 right-[40%] w-2 h-2 bg-[#B0EA3C]/25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                    </div>
                </div>

                <div className="relative z-10 px-6 py-28 lg:py-40">
                    <div className="mx-auto max-w-[1280px] text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-sm font-bold text-white/90 mb-8 border border-white/20">
                            <span className="material-symbols-outlined text-[#B0EA3C] text-lg">eco</span>
                            About Miraitu
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-[1.05]">
                            Bringing{' '}
                            <span className="relative inline-block">
                                <span className="text-[#B0EA3C]">Nature</span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="#B0EA3C" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                                </svg>
                            </span>
                            <br />
                            <span className="text-white/90">&</span>{' '}
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-r from-white to-[#B0EA3C] bg-clip-text text-transparent">Innovation</span>
                            </span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                            Bridging the gap between traditional farming wisdom and modern technology — empowering millions of Indian farmers with one unified platform.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            {impactStats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-[#B0EA3C] text-xl">{stat.icon}</span>
                                        <span className="text-3xl font-black text-white">{stat.value}</span>
                                    </div>
                                    <p className="text-sm text-white/60 font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 64C1200 64 1320 48 1380 40L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f8f9f7" className="dark:fill-[#161d15]" />
                    </svg>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* Our Core Pillars                                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
                            Foundation
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Our Core <span className="text-primary">Pillars</span>
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            The three guiding principles that shape everything we do at Miraitu
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className={`group relative p-8 lg:p-10 rounded-[2.5rem] ${pillar.bgLight} border border-black/5 dark:border-white/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
                            >
                                {/* Glow */}
                                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${pillar.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 ${pillar.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className={`material-symbols-outlined text-4xl ${pillar.iconColor}`}>{pillar.icon}</span>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]">
                                        {pillar.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* What We Offer                                         */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="px-6 py-20 bg-white dark:bg-[#0e150d]">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            What Makes <span className="text-primary">Miraitu</span> Different
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            One app that covers the entire farming lifecycle — from seed to sale
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: 'agriculture', title: 'Machinery', desc: 'Buy, sell & rent farming equipment' },
                            { icon: 'pets', title: 'Livestock', desc: 'Trade cattle, goats, buffaloes & more' },
                            { icon: 'account_balance', title: 'Finance', desc: 'Loans, insurance & credit solutions' },
                            { icon: 'storefront', title: 'Marketplace', desc: 'Organic products & farm supplies' },
                            { icon: 'vaccines', title: 'Veterinary', desc: 'Expert animal healthcare on demand' },
                            { icon: 'handyman', title: 'Farm Tools', desc: 'Smart tools for soil, weather & crops' },
                            { icon: 'landscape', title: 'Land', desc: 'Buy, sell or lease agricultural land' },
                            { icon: 'groups', title: 'Community', desc: 'Connect with fellow farmers' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-2xl bg-[#f8f9f7] dark:bg-[#121811] border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all text-center"
                            >
                                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl transition-colors">{item.icon}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* The Minds Behind Miraitu                               */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="px-4 md:px-6 py-10 md:py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
                            Leadership
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            The Minds Behind <span className="text-primary">Miraitu</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                            A passionate team driven by the mission to revolutionize agriculture in India through technology and innovation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                        {teamMembers.map((member) => (
                            <a
                                key={member.name}
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#121811] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer"
                            >
                                {/* Image Container */}
                                <div className="relative h-[320px] md:h-[420px] overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Gradient Overlay at bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* LinkedIn Badge — always visible, blue on hover */}
                                    <div className="absolute top-5 right-5 w-12 h-12 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/40 shadow-lg group-hover:bg-[#0A66C2] group-hover:border-[#0A66C2] group-hover:scale-110 transition-all duration-300">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </div>

                                    {/* Name + Role on image bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{member.name}</h3>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm text-sm font-bold text-white">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            {member.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="p-4 md:p-6 lg:p-8">
                                    <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
                                        {member.description}
                                    </p>
                                    <div className="mt-3 md:mt-4 flex items-center gap-2 text-primary font-bold text-sm">
                                        <span>View LinkedIn Profile</span>
                                        <span className="material-symbols-outlined text-base group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* CTA Section — with Miraitu Logo                       */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="px-4 md:px-6 py-8 md:py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-[#1a3a14] to-[#2d5a24] p-6 md:p-12 lg:p-16 text-center text-white relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B0EA3C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            {/* Miraitu App Icon */}
                            <div className="flex justify-center mb-5 md:mb-8">
                                <img
                                    src="/miraitu-app-icon.jpeg"
                                    alt="Miraitu - One App for Farmers"
                                    className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[1.75rem] shadow-2xl shadow-black/30 ring-4 ring-white/20"
                                />
                            </div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-6">
                                Join the <span className="text-[#B0EA3C]">Miraitu</span> Revolution
                            </h2>
                            <p className="text-sm md:text-xl text-white/80 max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
                                Whether you&apos;re a farmer, dealer, or service provider — Miraitu is your gateway to a smarter agricultural future.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                                <a href="#" className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-8 py-3 md:py-4 bg-[#B0EA3C] text-[#1a3a14] rounded-xl md:rounded-2xl shadow-2xl shadow-[#B0EA3C]/20 hover:-translate-y-1 active:scale-95 transition-all">
                                    <svg className="size-7 md:size-8 fill-current shrink-0" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.608-2.302 2.608-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                                    <div className="text-left">
                                        <p className="text-[10px] md:text-xs text-[#1a3a14]/60 leading-tight font-medium">Download on</p>
                                        <p className="text-sm md:text-lg font-black leading-tight">Play Store</p>
                                    </div>
                                </a>
                                <a href="#" className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl md:rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                                    <svg className="size-7 md:size-8 fill-current shrink-0" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                    <div className="text-left">
                                        <p className="text-[10px] md:text-xs text-white/60 leading-tight font-medium">Download on</p>
                                        <p className="text-sm md:text-lg font-black leading-tight">App Store</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
