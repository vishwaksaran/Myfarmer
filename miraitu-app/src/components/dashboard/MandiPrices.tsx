'use client';

import { useMandiPrices } from '@/lib/useMandiPrices';
import { getCropEmoji, spreadPercent } from '@/lib/mandi-api';

/* ── Fallback rows when API is unavailable ─── */
const fallbackRows = [
    { icon: '🌾', name: 'Wheat', price: '₹2,125', change: '+₹25', changeColor: 'text-primary', trend: 'UP', trendColor: 'bg-green-100 text-green-800', trendIcon: 'north_east' },
    { icon: '🍚', name: 'Basmati Rice', price: '₹3,850', change: '-₹15', changeColor: 'text-orange-600', trend: 'DOWN', trendColor: 'bg-orange-100 text-orange-800', trendIcon: 'south_east' },
    { icon: '☁️', name: 'Cotton', price: '₹5,400', change: '0', changeColor: 'text-gray-500', trend: 'STABLE', trendColor: 'bg-gray-100 text-gray-800', trendIcon: 'remove' },
];

export default function MandiPrices() {
    const { data, loading, error, refetch, updated } = useMandiPrices({ limit: 10 });

    // Group by commodity, take top 3
    const grouped: Record<string, typeof data> = {};
    for (const r of data) {
        if (!grouped[r.commodity]) grouped[r.commodity] = [];
        grouped[r.commodity].push(r);
    }

    const liveRows = Object.entries(grouped).slice(0, 3).map(([commodity, records]) => {
        const latest = records[0];
        const pct = spreadPercent(latest.minPrice, latest.maxPrice);
        const changeAmt = Math.round(latest.maxPrice - latest.minPrice);
        const isUp = pct > 0;
        const isDown = pct < 0;
        return {
            icon: getCropEmoji(commodity),
            name: commodity,
            price: `₹${latest.modalPrice.toLocaleString('en-IN')}`,
            change: isUp ? `+₹${changeAmt}` : isDown ? `-₹${Math.abs(changeAmt)}` : '0',
            changeColor: isUp ? 'text-primary' : isDown ? 'text-orange-600' : 'text-gray-500',
            trend: isUp ? 'UP' : isDown ? 'DOWN' : 'STABLE',
            trendColor: isUp ? 'bg-green-100 text-green-800' : isDown ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800',
            trendIcon: isUp ? 'north_east' : isDown ? 'south_east' : 'remove',
        };
    });

    const useFallback = (error || liveRows.length === 0) && !loading;
    const rows = useFallback ? fallbackRows : liveRows;

    const updatedText = updated
        ? `Updated: ${new Date(updated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        : 'Updated: 10 mins ago';

    return (
        <div className="col-span-1 rounded-2xl bg-harvest-loam p-1 shadow-soft-raised border border-[#e0e5df]">
            <div className="bg-[#fbfbf7] rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl font-bold text-primary-dark flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">trending_up</span>
                        Local Mandi Prices
                        {!useFallback && !loading && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold ml-1">
                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-sm font-medium text-soil-dark">{updatedText}</span>
                        <button onClick={refetch} className="text-primary hover:text-primary-dark transition-colors"><span className="material-symbols-outlined text-sm">refresh</span></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                            <tr className="text-left border-b border-[#e0e5df]">
                                <th className="pb-4 pl-4 font-extrabold text-soil-dark uppercase text-xs tracking-wider">Crop</th>
                                <th className="pb-4 font-extrabold text-soil-dark uppercase text-xs tracking-wider">Price (₹/qt)</th>
                                <th className="pb-4 font-extrabold text-soil-dark uppercase text-xs tracking-wider">Change</th>
                                <th className="pb-4 pr-4 font-extrabold text-soil-dark uppercase text-xs tracking-wider text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="text-forest-charcoal">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b border-[#e0e5df] last:border-0 animate-pulse">
                                        <td className="py-4 pl-4"><div className="h-5 w-24 bg-gray-200 rounded" /></td>
                                        <td className="py-4"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                                        <td className="py-4"><div className="h-5 w-12 bg-gray-200 rounded" /></td>
                                        <td className="py-4 pr-4 text-right"><div className="h-5 w-16 bg-gray-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                rows.map((row) => (
                                    <PriceRow key={row.name} {...row} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function PriceRow({ icon, name, price, change, changeColor, trend, trendColor, trendIcon }: {
    icon: string;
    name: string;
    price: string;
    change: string;
    changeColor: string;
    trend: string;
    trendColor: string;
    trendIcon: string;
}) {
    return (
        <tr className="group border-b border-[#e0e5df] hover:bg-[#f2f4f0] transition-colors last:border-0">
            <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#f5e6d3] flex items-center justify-center text-xl shadow-sm border border-stone-200">{icon}</div>
                    <span className="font-bold text-lg">{name}</span>
                </div>
            </td>
            <td className="py-4 font-mono font-bold text-lg">{price}</td>
            <td className={`py-4 font-bold ${changeColor}`}>{change}</td>
            <td className="py-4 pr-4 text-right">
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${trendColor}`}>
                    <span className="material-symbols-outlined text-sm">{trendIcon}</span> {trend}
                </span>
            </td>
        </tr>
    );
}
