'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Alert {
    id: number;
    type: 'rain' | 'heat' | 'frost' | 'storm' | 'flood' | 'wind';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    date: string;
    advice: string;
}

const alertMeta: Record<string, { icon: string; color: string; bg: string }> = {
    rain: { icon: 'rainy', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    heat: { icon: 'wb_sunny', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    frost: { icon: 'ac_unit', color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
    storm: { icon: 'thunderstorm', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    flood: { icon: 'flood', color: 'text-blue-700', bg: 'bg-blue-700/10' },
    wind: { icon: 'air', color: 'text-teal-600', bg: 'bg-teal-500/10' },
};

const severityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const sampleAlerts: Alert[] = [
    { id: 1, type: 'rain', severity: 'high', title: 'Heavy Rainfall Expected', description: 'Heavy rainfall of 60-80mm expected in the next 48 hours across the region.', date: 'Today – Tomorrow', advice: 'Delay sowing. Ensure proper drainage in fields. Harvest ready crops immediately.' },
    { id: 2, type: 'heat', severity: 'medium', title: 'Heat Wave Warning', description: 'Temperature expected to rise above 42°C for the next 3 days.', date: 'Feb 21 – Feb 23', advice: 'Increase irrigation frequency. Apply mulching to conserve soil moisture. Avoid mid-day field work.' },
    { id: 3, type: 'storm', severity: 'critical', title: 'Thunderstorm Alert', description: 'Severe thunderstorm with hail likely in the evening hours.', date: 'Today Evening', advice: 'Secure livestock. Cover harvested produce. Avoid open fields. Protect nursery beds.' },
    { id: 4, type: 'frost', severity: 'low', title: 'Frost Advisory', description: 'Light frost possible in low-lying areas during early morning hours.', date: 'Feb 22 – Feb 24', advice: 'Cover sensitive crops with plastic sheets. Light irrigation in evening can help prevent frost damage.' },
    { id: 5, type: 'wind', severity: 'medium', title: 'Strong Wind Advisory', description: 'Wind speeds of 40-50 km/h expected. May affect standing crops.', date: 'Tomorrow', advice: 'Stake tall crops like sugarcane and banana. Postpone spraying operations.' },
    { id: 6, type: 'flood', severity: 'high', title: 'River Level Rising', description: 'Water levels in nearby rivers rising due to upstream rainfall.', date: 'Next 3 Days', advice: 'Move equipment to higher ground. Strengthen field bunds. Keep emergency supplies ready.' },
];

export default function WeatherAlertsPage() {
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [locationInput, setLocationInput] = useState('');
    const [location, setLocation] = useState('Your Region');

    const filteredAlerts = selectedSeverity === 'all'
        ? sampleAlerts
        : sampleAlerts.filter(a => a.severity === selectedSeverity);

    const criticalCount = sampleAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

    const handleSetLocation = () => {
        if (locationInput.trim()) {
            setLocation(locationInput.trim());
            setLocationInput('');
        }
    };

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">Agri Calculators</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Weather Alerts</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined text-2xl">thunderstorm</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Weather Alerts</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Stay informed about weather changes that may affect your farming activities.</p>
                    </div>

                    {/* Summary Banner */}
                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="material-symbols-outlined text-blue-500 text-xl">location_on</span>
                                <span className="font-bold text-gray-900 dark:text-white">{location}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {criticalCount > 0
                                    ? `⚠️ ${criticalCount} high/critical alert(s) active`
                                    : '✅ No critical alerts right now'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter village / district..."
                                value={locationInput}
                                onChange={e => setLocationInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSetLocation()}
                                className="skeuo-inset rounded-xl px-4 py-2.5 text-sm flex-1 md:w-56"
                            />
                            <button onClick={handleSetLocation} className="vibrant-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm">
                                Set
                            </button>
                        </div>
                    </div>

                    {/* 5-Day Forecast Bar */}
                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">5-Day Outlook</h3>
                        <div className="grid grid-cols-5 gap-2 md:gap-4">
                            {[
                                { day: 'Today', icon: 'thunderstorm', temp: '34°/26°', rain: '80%' },
                                { day: 'Fri', icon: 'rainy', temp: '30°/24°', rain: '60%' },
                                { day: 'Sat', icon: 'partly_cloudy_day', temp: '32°/25°', rain: '20%' },
                                { day: 'Sun', icon: 'wb_sunny', temp: '35°/27°', rain: '5%' },
                                { day: 'Mon', icon: 'wb_sunny', temp: '36°/27°', rain: '0%' },
                            ].map(d => (
                                <div key={d.day} className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <span className="text-xs font-bold text-gray-600">{d.day}</span>
                                    <span className="material-symbols-outlined text-xl md:text-2xl text-blue-500">{d.icon}</span>
                                    <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{d.temp}</span>
                                    <span className="text-[10px] md:text-xs text-blue-500 font-bold">🌧 {d.rain}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Severity Filter */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                            <button
                                key={s}
                                onClick={() => setSelectedSeverity(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${selectedSeverity === s
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {s === 'all' ? `All Alerts (${sampleAlerts.length})` : s}
                            </button>
                        ))}
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-4">
                        {filteredAlerts.map(alert => {
                            const meta = alertMeta[alert.type];
                            return (
                                <div key={alert.id} className="skeuo-card rounded-2xl p-5 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className={`h-12 w-12 shrink-0 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                                            <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{alert.title}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${severityColors[alert.severity]}`}>
                                                    {alert.severity}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium ml-auto">{alert.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{alert.description}</p>
                                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm mt-0.5">agriculture</span>
                                                    <span><strong>Farming Advice:</strong> {alert.advice}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredAlerts.length === 0 && (
                            <div className="skeuo-card rounded-2xl p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">check_circle</span>
                                <p className="font-bold text-gray-500">No alerts for the selected severity level.</p>
                            </div>
                        )}
                    </div>

                    {/* Tip Card */}
                    <div className="mt-8 skeuo-card rounded-2xl p-5 md:p-6 border-l-4 border-primary">
                        <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">tips_and_updates</span>
                            Pro Tip
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Set up your location to receive hyper-local weather alerts. Alerts are updated every 3 hours using IMD (Indian Meteorological Department) data and regional weather stations. Enable notifications to never miss a critical alert during sowing or harvesting season.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
