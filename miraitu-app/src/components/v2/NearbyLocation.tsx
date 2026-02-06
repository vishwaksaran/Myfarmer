'use client';

import { useState, useEffect } from 'react';

interface NearbyLocationProps {
    onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
}

export default function NearbyLocation({ onLocationChange }: NearbyLocationProps) {
    const [location, setLocation] = useState<string>('Detecting location...');
    const [isLoading, setIsLoading] = useState(true);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const nearbyAreas = [
        { name: 'Current Location', icon: 'my_location', isGps: true },
        { name: 'Within 5 km', distance: 5 },
        { name: 'Within 10 km', distance: 10 },
        { name: 'Within 25 km', distance: 25 },
        { name: 'Within 50 km', distance: 50 },
        { name: 'All India', distance: -1 },
    ];

    const [selectedRange, setSelectedRange] = useState(nearbyAreas[2]); // Default 10km

    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        setIsLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ lat: latitude, lng: longitude });

                    // Reverse geocode to get address (using a simple approximation)
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                        );
                        const data = await response.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown';
                        const state = data.address?.state || '';
                        const address = state ? `${city}, ${state}` : city;
                        setLocation(address);
                        onLocationChange?.({ lat: latitude, lng: longitude, address });
                    } catch {
                        setLocation('Location detected');
                        onLocationChange?.({ lat: latitude, lng: longitude, address: 'Location detected' });
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocation('Enable location access');
                    setIsLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        } else {
            setLocation('Location not supported');
            setIsLoading(false);
        }
    };

    const handleRangeSelect = (area: typeof nearbyAreas[0]) => {
        setSelectedRange(area);
        setShowDropdown(false);
        if (area.isGps) {
            detectLocation();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow-sm"
            >
                <span className="material-symbols-outlined text-primary text-xl">
                    {isLoading ? 'sync' : 'location_on'}
                </span>
                <div className="text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nearby</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                        {isLoading ? 'Detecting...' : location}
                    </p>
                </div>
                <span className="material-symbols-outlined text-gray-400 text-lg">
                    {showDropdown ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Current Location Display */}
                    <div className="px-4 py-3 bg-primary/5 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            <div>
                                <p className="text-xs text-gray-500">Your Location</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Range Options */}
                    <div className="py-2">
                        <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Search Radius</p>
                        {nearbyAreas.map((area) => (
                            <button
                                key={area.name}
                                onClick={() => handleRangeSelect(area)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRange.name === area.name ? 'bg-primary/5 text-primary' : 'text-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {area.isGps ? 'my_location' : area.distance === -1 ? 'public' : 'radar'}
                                </span>
                                <span className="font-medium">{area.name}</span>
                                {selectedRange.name === area.name && (
                                    <span className="material-symbols-outlined ml-auto text-primary">check</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={detectLocation}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">refresh</span>
                            Refresh Location
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
