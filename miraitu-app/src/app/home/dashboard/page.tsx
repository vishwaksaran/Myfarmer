'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import supabase from '@/lib/supabase';
import type { WeatherPayload } from '@/lib/weather-types';
import {
    buildWeatherApiQuery,
    clearWeatherLocationConsent,
    clearSavedWeatherCoords,
    clearSavedWeatherLocation,
    getSavedWeatherLocation,
    getWeatherLocationConsent,
    isGeoPermissionDenied,
    isLikelyWaterLocation,
    markGeoPermissionDenied,
    parseDistrictStateInput,
    requestBrowserCoords,
    setWeatherLocationConsent,
    saveWeatherCoords,
    saveWeatherLocation,
    type WeatherLocationConsent,
} from '@/lib/weather-location';

interface Booking {
    id: string;
    module: string;
    category: string;
    full_name: string;
    phone: string;
    location: string;
    preferred_date: string | null;
    status: string;
    created_at: string;
    extra_data: Record<string, unknown>;
    provider_id: string | null;
    assigned_at: string | null;
    accepted_at: string | null;
    amount: number | null;
    provider_profile?: { full_name: string | null }[] | { full_name: string | null } | null;
}

interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    recentBookings: Booking[];
}

export default function UserDashboardPage() {
    const { user, loading, fetchProfile } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        recentBookings: [],
    });
    const [profileData, setProfileData] = useState<{ full_name: string | null; farm_location: string | null; role: string; phone?: string | null } | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [locationConsent, setLocationConsent] = useState<WeatherLocationConsent | null>(null);
    const [showLocationEditor, setShowLocationEditor] = useState(false);
    const [manualLocationInput, setManualLocationInput] = useState('');
    const [locationUpdateLoading, setLocationUpdateLoading] = useState(false);

    const loadWeather = useCallback(async (locationHint?: string | null, options?: { preferCurrent?: boolean }): Promise<boolean> => {
        const fallbackLocation = 'Hyderabad';
        const cleanedHint = (locationHint || '').replace(/^[^a-zA-Z0-9]+/, '').trim();
        const preferCurrent = Boolean(options?.preferCurrent);

        setWeatherLoading(true);
        setWeatherError(null);

        try {
            let queryString = '';
            let currentErrorCode: string | null = null;

            if (preferCurrent) {
                if (!isGeoPermissionDenied()) {
                    try {
                        const coords = await requestBrowserCoords();
                        markGeoPermissionDenied(false);
                        saveWeatherCoords(coords);
                        queryString = buildWeatherApiQuery({ coords });
                    } catch (err) {
                        if (err instanceof Error) {
                            currentErrorCode = err.message;
                            if (err.message === 'PERMISSION_DENIED') {
                                markGeoPermissionDenied(true);
                            }
                        }
                    }
                }

                if (!queryString) {
                    if (currentErrorCode === 'INSECURE_CONTEXT') {
                        throw new Error('Current location needs HTTPS or localhost. Please select manual location.');
                    }
                    if (currentErrorCode === 'PERMISSION_DENIED') {
                        throw new Error('Location permission denied. Please allow permission or use manual location.');
                    }
                    throw new Error('Unable to detect current location. Please choose manual location.');
                }
            } else {
                clearSavedWeatherCoords();
            }

            if (!queryString) {
                const savedLocation = getSavedWeatherLocation();
                const targetLocation = cleanedHint || savedLocation || fallbackLocation;
                const parsed = parseDistrictStateInput(targetLocation);
                queryString = parsed
                    ? buildWeatherApiQuery({ district: parsed.district, state: parsed.state })
                    : buildWeatherApiQuery({ location: targetLocation });
            }

            const response = await fetch(`/api/weather/forecast?${queryString}`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Unable to load live weather.');
            }

            const data = (await response.json()) as WeatherPayload;
            const resolvedLocation = String(data.location.name || '').trim();
            const lowered = resolvedLocation.toLowerCase();
            if (preferCurrent && (isLikelyWaterLocation(resolvedLocation) || lowered === 'india' || lowered === 'bharat')) {
                clearSavedWeatherCoords();
                clearSavedWeatherLocation();
                throw new Error('Current location could not be detected accurately. Choose manual location first.');
            }

            setWeatherData(data);
            saveWeatherLocation(data.location.name || cleanedHint || fallbackLocation);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to load live weather.';
            setWeatherError(message);
            setWeatherData(null);
            return false;
        } finally {
            setWeatherLoading(false);
        }
    }, []);

    const loadDashboard = useCallback(async () => {
        if (!user || user.isGuest) { setLoadingData(false); return; }

        // Fetch profile
        const profile = await fetchProfile();
        if (profile) setProfileData(profile);

        const savedConsent = getWeatherLocationConsent();
        setLocationConsent(savedConsent);
        if (savedConsent === 'granted') {
            const ok = await loadWeather(profile?.farm_location || null, { preferCurrent: true });
            if (!ok) {
                clearWeatherLocationConsent();
                setLocationConsent(null);
            }
        } else if (savedConsent === 'manual') {
            await loadWeather(profile?.farm_location || null, { preferCurrent: false });
        } else {
            setWeatherLoading(false);
            setWeatherData(null);
            setWeatherError(null);
        }

        // Fetch bookings for this user; include phone fallback for older/guest-created rows.
        const authPhoneDigits = (user.phone || '').replace(/\D/g, '');
        const profilePhoneDigits = (profile?.phone || '').replace(/\D/g, '');
        const filters = [`user_id.eq.${user.id}`];
        if (authPhoneDigits.length === 10) filters.push(`phone.eq.${authPhoneDigits}`);
        if (profilePhoneDigits.length === 10 && profilePhoneDigits !== authPhoneDigits) filters.push(`phone.eq.${profilePhoneDigits}`);

        const { data: bookings, error } = await supabase
            .from('service_bookings')
            .select('id, module, category, full_name, phone, location, preferred_date, status, created_at, extra_data, provider_id, assigned_at, accepted_at, amount')
            .or(filters.join(','))
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[dashboard] Failed to load bookings:', error);
        }

        if (!error && bookings) {
            const all = bookings as Booking[];
            setStats({
                totalBookings: all.length,
                pendingBookings: all.filter(b => ['pending', 'assigned', 'accepted', 'in_progress', 'contacted', 'confirmed'].includes(b.status)).length,
                completedBookings: all.filter(b => b.status === 'completed').length,
                recentBookings: all.slice(0, 5),
            });
        }
        setLoadingData(false);
    }, [user, fetchProfile, loadWeather]);

    useEffect(() => {
        if (user) loadDashboard();
    }, [user, loadDashboard]);

    useEffect(() => {
        if (!loading && !user) router.push('/user-login');
    }, [loading, user, router]);

    const handleEnableCurrentWeather = useCallback(async () => {
        setLocationUpdateLoading(true);
        const ok = await loadWeather(profileData?.farm_location || null, { preferCurrent: true });
        if (ok) {
            setWeatherLocationConsent('granted');
            setLocationConsent('granted');
            setShowLocationEditor(false);
            setLocationUpdateLoading(false);
            return;
        }

        clearWeatherLocationConsent();
        setLocationConsent(null);
        setLocationUpdateLoading(false);
    }, [loadWeather, profileData]);

    const handleEnableManualWeather = useCallback(() => {
        setWeatherLocationConsent('manual');
        setLocationConsent('manual');
        clearSavedWeatherCoords();
        void loadWeather(profileData?.farm_location || null, { preferCurrent: false });
    }, [loadWeather, profileData]);

    const handleSaveManualLocation = useCallback(async () => {
        const raw = manualLocationInput.trim();
        if (!raw) {
            setWeatherError('Please enter district and state to continue.');
            return;
        }

        setLocationUpdateLoading(true);
        setWeatherError(null);
        setWeatherLocationConsent('manual');
        setLocationConsent('manual');
        clearSavedWeatherCoords();
        saveWeatherLocation(raw);

        const ok = await loadWeather(raw, { preferCurrent: false });
        if (ok) {
            setShowLocationEditor(false);
        }
        setLocationUpdateLoading(false);
    }, [loadWeather, manualLocationInput]);

    useEffect(() => {
        if (manualLocationInput.trim()) return;

        const fromStorage = getSavedWeatherLocation();
        if (fromStorage) {
            setManualLocationInput(fromStorage);
            return;
        }

        if (profileData?.farm_location) {
            setManualLocationInput(profileData.farm_location);
        }
    }, [manualLocationInput, profileData]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const statusColor: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        accepted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusLabel: Record<string, string> = {
        pending: 'Pending',
        assigned: 'Provider Assigned',
        accepted: 'Accepted',
        in_progress: 'In Progress',
        contacted: 'Contacted',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    const weatherUpdatedAt = weatherData
        ? new Date(weatherData.updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
        : null;

    const todayRainChance = weatherData?.daily[0]?.rainChance;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-8">
                <div className="mx-auto max-w-[1100px] px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span>&gt;</span>
                        <span className="text-primary font-semibold">Dashboard</span>
                    </nav>

                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Welcome, {user.displayName?.split(' ')[0] || 'Farmer'}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {profileData?.farm_location ? `📍 ${profileData.farm_location}` : 'Your farming dashboard'}
                        </p>
                    </div>

                    {/* Live Weather */}
                    {!locationConsent ? (
                        <div className="mb-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 via-sky-50 to-white dark:from-blue-950/20 dark:via-[#132018] dark:to-[#1a231a] p-5 md:p-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Enable Live Farm Weather</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Choose location mode first. Weather will be shown only after your selection.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleEnableCurrentWeather}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                    Use Current Location
                                </button>
                                <button
                                    onClick={handleEnableManualWeather}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Use Saved/Manual Location
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Current location requires HTTPS or localhost. You can always set district/state in Weather Alerts.
                            </p>
                        </div>
                    ) : (
                        <div className="mb-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 via-sky-50 to-white dark:from-blue-950/20 dark:via-[#132018] dark:to-[#1a231a] p-5 md:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">Live Farm Weather</p>
                                    {weatherLoading ? (
                                        <p className="mt-2 text-sm text-gray-500">Fetching latest forecast...</p>
                                    ) : weatherData ? (
                                        <>
                                            <div className="mt-1 flex items-center gap-3">
                                                <span className="material-symbols-outlined text-3xl text-blue-600">{weatherData.current.icon}</span>
                                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{weatherData.current.temperature}°C</p>
                                                <span className="text-sm md:text-base font-semibold text-gray-600 dark:text-gray-300">{weatherData.current.condition}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{weatherData.location.name}</p>
                                            {weatherUpdatedAt && (
                                                <p className="mt-1 text-xs text-gray-500">Updated {weatherUpdatedAt}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{weatherError || 'Weather data is currently unavailable.'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-white/80 dark:bg-black/20 px-4 py-3 border border-white/70 dark:border-white/10 min-w-[98px]">
                                        <p className="text-[11px] text-gray-500">Humidity</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{weatherData ? `${weatherData.current.humidity}%` : '--'}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 dark:bg-black/20 px-4 py-3 border border-white/70 dark:border-white/10 min-w-[98px]">
                                        <p className="text-[11px] text-gray-500">Wind</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{weatherData ? `${weatherData.current.windSpeed} km/h` : '--'}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 dark:bg-black/20 px-4 py-3 border border-white/70 dark:border-white/10 min-w-[98px]">
                                        <p className="text-[11px] text-gray-500">Rain Chance</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{typeof todayRainChance === 'number' ? `${todayRainChance}%` : '--'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/30 flex items-center justify-between gap-3">
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Plan spray, irrigation, and harvest windows based on live weather updates.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowLocationEditor(prev => !prev)}
                                        className="text-sm font-bold text-blue-700 hover:underline whitespace-nowrap"
                                    >
                                        {showLocationEditor ? 'Close Location Editor' : 'Change Location'}
                                    </button>
                                    <Link href="/home/toolbox/weather-alerts" className="text-sm font-bold text-primary hover:underline whitespace-nowrap">
                                        Open Weather Alerts →
                                    </Link>
                                </div>
                            </div>

                            {showLocationEditor && (
                                <div className="mt-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-white/70 dark:bg-black/20 p-4 md:p-5">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Update Weather Location</p>
                                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                                        <button
                                            onClick={handleEnableCurrentWeather}
                                            disabled={locationUpdateLoading}
                                            className="px-4 py-2.5 rounded-xl bg-blue-100 text-blue-700 text-sm font-bold hover:bg-blue-200 transition-colors disabled:opacity-60"
                                        >
                                            {locationUpdateLoading ? 'Detecting...' : 'Use Current'}
                                        </button>
                                        <input
                                            value={manualLocationInput}
                                            onChange={(e) => setManualLocationInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    void handleSaveManualLocation();
                                                }
                                            }}
                                            placeholder="District, State (e.g., Bengaluru, Karnataka)"
                                            className="skeuo-inset rounded-xl px-4 py-2.5 text-sm flex-1"
                                        />
                                        <button
                                            onClick={() => void handleSaveManualLocation()}
                                            disabled={locationUpdateLoading || !manualLocationInput.trim()}
                                            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60"
                                        >
                                            Save
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        For LAN HTTP URLs, use manual district/state. Current location works best on HTTPS or localhost.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {loadingData ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalBookings}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-yellow-600 text-2xl">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Pending</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pendingBookings}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Completed</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.completedBookings}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { icon: 'agriculture', label: 'Services', href: '/home/services', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' },
                                        { icon: 'storefront', label: 'Shop', href: '/home/shop', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' },
                                        { icon: 'landscape', label: 'Land', href: '/home/land', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20' },
                                        { icon: 'pets', label: 'Livestock', href: '/home/livestock', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20' },
                                    ].map(a => (
                                        <Link key={a.label} href={a.href}
                                            className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all group">
                                            <div className={`size-12 rounded-xl ${a.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                                            </div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">{a.label}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Bookings */}
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Recent Bookings
                                    </h2>
                                    <Link href="/home/orders" className="text-sm text-primary font-semibold hover:underline">View All →</Link>
                                </div>
                                {stats.recentBookings.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inbox</span>
                                        <p className="text-gray-500 font-medium">No bookings yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Book a service to see it here</p>
                                        <Link href="/home/services" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                                            Browse Services
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {stats.recentBookings.map(b => (
                                            <div key={b.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-primary text-lg">
                                                                {b.module === 'services' ? 'handyman' : b.module === 'land' ? 'landscape' : b.module === 'borewell' ? 'water_pump' : 'build'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm capitalize">{b.category.replace(/-/g, ' ')}</p>
                                                            <p className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {statusLabel[b.status] || b.status}
                                                    </span>
                                                </div>
                                                {/* Provider assignment info */}
                                                {b.provider_id && (
                                                    <div className="mt-2 ml-14 flex items-center gap-2 text-xs">
                                                        <span className="material-symbols-outlined text-green-500 text-sm">engineering</span>
                                                        <span className="text-gray-500">
                                                            Provider: <span className="font-bold text-gray-700 dark:text-gray-300">
                                                                {Array.isArray(b.provider_profile) ? b.provider_profile[0]?.full_name : b.provider_profile?.full_name || 'Assigned'}
                                                            </span>
                                                        </span>
                                                        {b.amount && (
                                                            <span className="text-gray-400">• ₹{b.amount.toLocaleString('en-IN')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
