'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppLocation } from '@/context/LocationContext';

interface NearbyLocationProps {
    onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
}

export default function NearbyLocation({ onLocationChange }: NearbyLocationProps) {
    const { t } = useLanguage();
    // Global, shared location — set once on app load, reused on every page.
    const { location: appLocation, loading: appLoading, requestLocation } = useAppLocation();
    const [showDropdown, setShowDropdown] = useState(false);

    const nearbyAreas = [
        { tKey: 'nearby.currentLocation', icon: 'my_location', isGps: true },
        { tKey: 'nearby.within5km', distance: 5 },
        { tKey: 'nearby.within10km', distance: 10 },
        { tKey: 'nearby.within25km', distance: 25 },
        { tKey: 'nearby.within50km', distance: 50 },
        { tKey: 'nearby.allIndia', distance: -1 },
    ];

    const [selectedRange, setSelectedRange] = useState(nearbyAreas[2]); // Default 10km

    // Notify consumers whenever the shared location changes.
    useEffect(() => {
        if (appLocation) {
            onLocationChange?.({ lat: appLocation.lat, lng: appLocation.lng, address: appLocation.address });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appLocation]);

    const detectLocation = () => { void requestLocation(); };

    const isLoading = appLoading;

    const handleRangeSelect = (area: typeof nearbyAreas[0]) => {
        setSelectedRange(area);
        setShowDropdown(false);
        if (area.isGps) {
            detectLocation();
        }
    };

    const displayLocation = appLocation?.address || t('nearby.enableAccess');

    return (
        <div className="relative min-w-0" data-no-auth>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow-sm"
            >
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                    {isLoading ? 'sync' : 'location_on'}
                </span>
                <div className="text-left min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('nearby.label')}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {isLoading ? t('nearby.detecting') : displayLocation}
                    </p>
                </div>
                <span className="material-symbols-outlined text-gray-400 text-lg shrink-0">
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
                                <p className="text-xs text-gray-500">{t('nearby.yourLocation')}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayLocation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Range Options */}
                    <div className="py-2">
                        <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">{t('nearby.searchRadius')}</p>
                        {nearbyAreas.map((area) => (
                            <button
                                key={area.tKey}
                                onClick={() => handleRangeSelect(area)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRange.tKey === area.tKey ? 'bg-primary/5 text-primary' : 'text-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {area.isGps ? 'my_location' : area.distance === -1 ? 'public' : 'radar'}
                                </span>
                                <span className="font-medium">{t(area.tKey)}</span>
                                {selectedRange.tKey === area.tKey && (
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
                            {t('nearby.refresh')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
