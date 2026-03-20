import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Weather Alerts – Farm Weather Forecast & Warnings',
    description: 'Get real-time weather alerts, 7-day forecasts, and rain predictions for your farm location. Plan farming activities with accurate weather data on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/weather-alerts' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Farm Weather Alerts & Forecasts',
        description: 'Real-time weather alerts and forecasts for farmers.',
        url: 'https://www.miraitu.in/home/toolbox/weather-alerts',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function WeatherAlertsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
