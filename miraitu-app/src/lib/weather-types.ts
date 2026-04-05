export type WeatherAlertType = 'rain' | 'heat' | 'frost' | 'storm' | 'flood' | 'wind';
export type WeatherAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface WeatherAlertData {
    id: number;
    type: WeatherAlertType;
    severity: WeatherAlertSeverity;
    title: string;
    description: string;
    date: string;
    advice: string;
}

export interface WeatherCurrentData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
    condition: string;
    icon: string;
    isDay: boolean;
}

export interface WeatherDailyData {
    date: string;
    dayLabel: string;
    weatherCode: number;
    condition: string;
    icon: string;
    tempMax: number;
    tempMin: number;
    rainChance: number;
    rainMm: number;
    windMax: number;
}

export interface WeatherPayload {
    location: {
        name: string;
        latitude: number;
        longitude: number;
        timezone: string;
    };
    updatedAt: string;
    current: WeatherCurrentData;
    daily: WeatherDailyData[];
    alerts: WeatherAlertData[];
}

export interface WeatherLocationSuggestion {
    label: string;
    district: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
}
