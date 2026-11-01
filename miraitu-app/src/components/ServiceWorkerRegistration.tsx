'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Android users get the Play Store app instead of the PWA; the PWA install
// stays the fallback for devices without Play Store (iOS, desktop).
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.miraitu';

export default function ServiceWorkerRegistration() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Skip service worker in development to prevent stale JS bundle caching
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Register service worker (production only)
    if ('serviceWorker' in navigator && !isDev) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (registration) {
          console.log('SW registered:', registration.scope);
          // Check for updates every hour
          setInterval(function () {
            registration.update();
          }, 3600000);
        })
        .catch(function (error) {
          console.log('SW registration failed:', error);
        });
    }

    // In development, unregister any existing service worker
    if ('serviceWorker' in navigator && isDev) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (const registration of registrations) {
          registration.unregister();
          console.log('SW unregistered (dev mode)');
        }
      });
      // Also clear all caches left by previous SW
      if ('caches' in window) {
        caches.keys().then(function (names) {
          for (const name of names) {
            caches.delete(name);
            console.log('Cache cleared (dev mode):', name);
          }
        });
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const scheduleBanner = () => {
      // Check if user recently dismissed the banner (10-minute cooldown)
      const dismissedAt = localStorage.getItem('pwa-install-dismissed-at');
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        const TEN_MINUTES = 10 * 60 * 1000;
        if (elapsed < TEN_MINUTES) {
          // Still within cooldown, schedule banner for remaining time
          setTimeout(() => {
            setShowInstallBanner(true);
          }, TEN_MINUTES - elapsed);
          return;
        }
      }

      // Show banner after a short delay (don't interrupt user immediately)
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000); // Show after 30 seconds
    };

    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);

    // On Android the banner points to the Play Store, so it doesn't depend on
    // the browser offering a PWA install prompt.
    if (android) {
      scheduleBanner();
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Always suppress the browser's own PWA mini-infobar
      e.preventDefault();
      if (android) return;
      setInstallPrompt(e as BeforeInstallPromptEvent);
      scheduleBanner();
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isAndroid) {
      setShowInstallBanner(false);
      localStorage.setItem('pwa-install-dismissed-at', Date.now().toString());
      window.location.href = PLAY_STORE_URL;
      return;
    }

    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed-at', Date.now().toString());
  };

  if (isInstalled || !showInstallBanner || (!installPrompt && !isAndroid)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 9999,
        background: 'white',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideUp 0.3s ease-out',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <img
          src="/miraitu-logo-icon.png"
          alt="Miraitu Logo"
          width={44}
          height={44}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
          Install Miraitu
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          {isAndroid ? 'Get the app on Google Play' : 'Add to home screen for faster access'}
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: '#2c5926',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 18,
          color: '#999',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
