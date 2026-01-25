export default function WeatherCard() {
    return (
        <div className="col-span-1 lg:col-span-8 group relative overflow-hidden rounded-2xl bg-harvest-loam p-1 shadow-soft-raised border border-[#e0e5df]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative flex flex-col h-full bg-[#fbfbf7] rounded-xl p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                        {/* 3D Icon Representation - Sun */}
                        <div className="size-24 lg:size-32 rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#F57F17] shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-500 border-4 border-white/50">
                            <span className="material-symbols-outlined text-white text-[64px] lg:text-[80px]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>sunny</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-soil-dark mb-1">Today's Weather</h3>
                            <div className="text-5xl lg:text-6xl font-black text-primary-dark tracking-tighter">28°C</div>
                            <div className="text-lg font-medium text-primary mt-1">Sunny &amp; Clear</div>
                        </div>
                    </div>

                    {/* Weather Details Box */}
                    <div className="w-full lg:w-auto bg-[#e8eede] rounded-xl p-4 lg:p-6 border border-primary/10 shadow-inner">
                        <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">water_drop</span> Humidity: 45%
                        </h4>
                        <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">air</span> Wind: 12 km/h NW
                        </h4>
                        <div className="mt-4 pt-4 border-t border-primary/10">
                            <p className="text-sm font-semibold text-soil-dark leading-relaxed max-w-xs italic">
                                "Perfect conditions for checking irrigation systems. No rain expected for 3 days."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
