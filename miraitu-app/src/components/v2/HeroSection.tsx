'use client';

export default function HeroSection() {
    return (
        <section className="px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                <div className="relative overflow-hidden rounded-[2.5rem] skeuo-card min-h-[620px] flex items-center px-12">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/40 z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSBSarPJ_9uXmRvF0oViNMT9n8Kpr6mE6sYtDfNqvZQy4KY7B11aZ7EQFFb4Fo-NoH4961IGbY1cktD3WJ-2djyiUCg5pSHK2BGZ8Jo-nXEV7m8gAxbLSnjHIFHIHFBNq8-qmBTxQQHabiJPvPN32sY4HhOwim9zHPLDZ0OXM1clp10QoE2vwQMKbvE2vzMP0LPfSDeyvgc-A6YJ_pu8mfrqnXThxayo-7JD4F4lyjozHfZVytK_TXUoltcPQsPJ9qeip5VAPPrvY2')" }}
                        ></div>
                    </div>
                    <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
                        <div className="text-white">
                            <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/50">
                                Innovation in Agriculture
                            </span>
                            <h1 className="mb-6 text-6xl font-black leading-[1.1] tracking-tight">
                                The Future of <br />
                                <span className="text-accent">Smart Farming</span>
                            </h1>
                            <p className="mb-8 text-lg font-medium leading-relaxed opacity-90 max-w-lg">
                                Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers.
                            </p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-xl hover:bg-gray-100 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined">explore</span>
                                    Explore Hub
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="skeuo-card w-full max-w-md rounded-3xl p-8 border border-white/20">
                                <h3 className="text-2xl font-black text-primary mb-2">Sell Your Product</h3>
                                <p className="text-sm text-gray-500 mb-6 font-medium">List your items on the national marketplace</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Product Name</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                                placeholder="e.g. Sahiwal Cow"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <select className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0">
                                                <option>Cows</option>
                                                <option>Buffaloes</option>
                                                <option>Goats</option>
                                                <option>Tractors</option>
                                                <option>Tools</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Price (₹)</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                                placeholder="Enter amount"
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Product Description</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <textarea
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300 resize-none"
                                                placeholder="Tell buyers more about your product..."
                                                rows={3}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button className="glossy-button w-full rounded-2xl py-4 mt-2 text-white font-black text-lg tracking-wide flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">publish</span>
                                        SUBMIT LISTING
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
