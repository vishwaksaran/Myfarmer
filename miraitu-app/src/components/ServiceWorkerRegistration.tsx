'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ServiceWorkerRegistration() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
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

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Show banner after a short delay (don't interrupt user immediately)
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000); // Show after 30 seconds
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
  };

  if (isInstalled || !showInstallBanner || !installPrompt) {
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
          background: '#f0f9f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        🌾
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
          Install Miraitu
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          Add to home screen for faster access
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
