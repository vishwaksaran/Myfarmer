'use client';

import { useEffect, useState } from 'react';

const NAME = 'MIRAITU';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Show in installed-PWA (standalone) mode, or when previewing with ?splash
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari standalone flag
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isPreview = window.location.search.includes('splash');

    if (!isStandalone && !isPreview) return;

    setShowSplash(true);
    const timer = setTimeout(() => setShowSplash(false), 4600);
    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div className="miraitu-splash" role="status" aria-label="Loading Miraitu">
      {/* Center content */}
      <div className="ms-center">
        {/* Pulsing glow behind the logo */}
        <div className="ms-glow" aria-hidden="true" />

        {/* Logo card (white squircle) with a moving light sheen */}
        <div className="ms-logo-card">
          <img src="/miraitu-logo-icon.png" alt="Miraitu" className="ms-logo-img" />
          <span className="ms-sheen" aria-hidden="true" />
        </div>

        {/* App name — letters reveal one by one */}
        <h1 className="ms-name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span
              key={i}
              className="ms-letter"
              style={{ animationDelay: `${0.55 + i * 0.07}s` }}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="ms-tagline">Where Farming Meets the Future</p>

        {/* Loading progress bar */}
        <div className="ms-bar" aria-hidden="true">
          <span className="ms-bar-fill" />
        </div>
      </div>

      {/* Version pinned to bottom */}
      <p className="ms-version">Version 1.0</p>

      <style>{`
        .miraitu-splash {
          position: fixed; inset: 0; width: 100%; height: 100%;
          z-index: 999999; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, #2f7d31 0%, #3f9c3f 52%, #5bb659 100%);
          background-size: 100% 200%;
          animation: msBgShift 6s ease-in-out infinite, msFadeOut 0.6s ease 4.0s forwards;
          -webkit-font-smoothing: antialiased;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }

        /* Soft vignette + top highlight for depth */
        .miraitu-splash::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(120% 60% at 50% 18%, rgba(255,255,255,0.16), transparent 60%),
            radial-gradient(140% 90% at 50% 120%, rgba(0,0,0,0.28), transparent 55%);
        }

        .ms-center {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
        }

        .ms-glow {
          position: absolute; top: -28px; width: 260px; height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 68%);
          animation: msGlow 2.6s ease-in-out infinite;
        }

        .ms-logo-card {
          position: relative; width: 132px; height: 132px; border-radius: 34px;
          background: #ffffff; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15);
          margin-bottom: 26px; overflow: hidden;
          animation: msPopIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards,
                     msBob 3.4s ease-in-out 0.9s infinite;
        }
        .ms-logo-img {
          width: 74%; height: 74%; object-fit: contain;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.12));
        }
        /* Diagonal light sweep across the card */
        .ms-sheen {
          position: absolute; top: 0; left: -60%; width: 45%; height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: msSheen 3.2s ease-in-out 1.1s infinite;
        }

        .ms-name {
          margin: 0 0 10px; display: flex; gap: 2px;
          color: #fff; font-size: 40px; font-weight: 800; letter-spacing: 5px;
          text-shadow: 0 3px 12px rgba(0,0,0,0.22);
        }
        .ms-letter {
          display: inline-block;
          animation: msLetterUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .ms-tagline {
          margin: 0; color: rgba(255,255,255,0.92);
          font-size: 15px; font-weight: 600; letter-spacing: 0.4px; text-align: center;
          padding: 0 24px;
          animation: msFadeUp 0.6s ease-out 1.25s backwards;
        }

        .ms-bar {
          margin-top: 34px; width: 168px; height: 5px; border-radius: 999px;
          background: rgba(255,255,255,0.28); overflow: hidden;
          animation: msFadeUp 0.6s ease-out 1.5s backwards;
        }
        .ms-bar-fill {
          display: block; height: 100%; width: 0%; border-radius: 999px;
          background: linear-gradient(90deg, #eafce6, #ffffff);
          box-shadow: 0 0 10px rgba(255,255,255,0.6);
          animation: msBar 3.1s cubic-bezier(0.65, 0, 0.35, 1) 0.7s forwards;
        }

        .ms-version {
          position: absolute; bottom: 26px; left: 0; right: 0; z-index: 2;
          margin: 0; text-align: center;
          color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 0.5px;
          animation: msFadeUp 0.6s ease-out 1.7s backwards;
        }

        @keyframes msBgShift {
          0%, 100% { background-position: 50% 0%; }
          50% { background-position: 50% 100%; }
        }
        @keyframes msFadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes msGlow {
          0%, 100% { transform: scale(0.9); opacity: 0.55; }
          50% { transform: scale(1.15); opacity: 0.95; }
        }
        @keyframes msPopIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes msBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        @keyframes msSheen {
          0% { left: -60%; }
          55%, 100% { left: 130%; }
        }
        @keyframes msLetterUp {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes msFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes msBar {
          0% { width: 0%; }
          70% { width: 82%; }
          100% { width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .miraitu-splash, .ms-glow, .ms-logo-card, .ms-sheen,
          .ms-letter, .ms-tagline, .ms-bar, .ms-bar-fill, .ms-version {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .ms-bar-fill { width: 100% !important; }
          .miraitu-splash { animation: msFadeOut 0.6s ease 4.0s forwards; }
        }
      `}</style>
    </div>
  );
}
