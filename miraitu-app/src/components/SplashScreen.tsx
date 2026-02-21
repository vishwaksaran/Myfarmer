'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show splash screen in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isStandalone) {
      return; // Don't show splash on mobile website
    }

    setShowSplash(true);

    // Hide splash after branding displays (2-3 seconds)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 999999,
        background: 'linear-gradient(135deg, #2c5926 0%, #1e3d1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeOut 0.5s ease-in-out 2s forwards',
      }}
    >
      {/* Logo Container */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards',
          overflow: 'hidden',
        }}
      >
        <img
          src="/logo-icon.png"
          alt="Miraitu Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* App Name */}
      <h1
        style={{
          color: 'white',
          fontSize: 32,
          fontWeight: 800,
          margin: '0 0 12px 0',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          animation: 'fadeInUp 0.6s ease-out 0.4s backwards',
        }}
      >
        Miraitu
      </h1>

      {/* Tagline */}
      <p
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: 14,
          margin: 0,
          textAlign: 'center',
          letterSpacing: '0.3px',
          animation: 'fadeInUp 0.6s ease-out 0.6s backwards',
        }}
      >
        Cultivating the Future Together
      </p>

      {/* Loading Indicator */}
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          gap: 6,
          animation: 'fadeIn 0.6s ease-out 0.8s backwards',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            animation: 'pulse 1.5s ease-in-out 0s infinite',
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            animation: 'pulse 1.5s ease-in-out 0.3s infinite',
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            animation: 'pulse 1.5s ease-in-out 0.6s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
