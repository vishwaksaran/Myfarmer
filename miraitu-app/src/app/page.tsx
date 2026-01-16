import Link from "next/link";

/**
 * MiraituSplashScreenPage - The main landing page for Miraitu application
 * Features a beautiful glassmorphism design with the brand logo and call-to-action
 */
export default function MiraituSplashScreenPage() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[var(--miraitu-background-light)]">
      {/* Responsive Hero Background - Desktop and Mobile */}
      <ResponsiveHeroBackground />

      {/* Main Content Glass Panel */}
      <MainContentGlassPanel />

      {/* Copyright Footer */}
      <CopyrightFooterText />
    </div>
  );
}

/**
 * ResponsiveHeroBackground - Shows different backgrounds for mobile and desktop
 */
function ResponsiveHeroBackground() {
  return (
    <>
      {/* Mobile Background - visible on small screens */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:hidden animate-background-entrance"
        style={{ backgroundImage: 'url("/miraitu-hero-mobile.png")' }}
        aria-hidden="true"
      />
      {/* Desktop Background - visible on medium screens and up */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat hidden md:block animate-background-entrance"
        style={{ backgroundImage: 'url("/miraitu-hero-desktop.png")' }}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * MainContentGlassPanel - The central glass-morphism panel containing logo and CTA
 */
function MainContentGlassPanel() {
  return (
    <div className="relative z-10 flex flex-col items-center p-8 md:p-12 rounded-2xl miraitu-glass-panel max-w-md w-full mx-4 transform transition-all hover:scale-[1.01] duration-500 animate-panel-entrance">
      {/* Miraitu Logo with Tagline Image */}
      <MiraituBrandLogoImage />

      {/* Get Started Call-to-Action Button */}
      <GetStartedCallToActionButton />

      {/* Sign In Link for Existing Users */}
      <SignInLinkForExistingUsers />

      {/* Decorative Floating Orbs */}
      <DecorativeFloatingOrbs />
    </div>
  );
}

/**
 * MiraituBrandLogoImage - The official Miraitu logo with "One App for Farmers" tagline
 */
function MiraituBrandLogoImage() {
  return (
    <div className="relative mb-8 w-full flex justify-center">
      {/* Subtle glow effect behind the logo */}
      <div
        className="absolute inset-0 bg-white/30 blur-2xl rounded-full transform scale-75 animate-pulse-glow"
        aria-hidden="true"
      />
      <img
        src="/miraitu-logo-with-tagline.png"
        alt="Miraitu - One App for Farmers"
        className="relative z-10 w-64 md:w-72 lg:w-80 h-auto object-contain drop-shadow-lg animate-logo-entrance"
      />
    </div>
  );
}

/**
 * ApplicationLogoWithGlowEffect - The Miraitu eco leaf logo with orange glow effect
 */
function ApplicationLogoWithGlowEffect() {
  return (
    <div className="relative mb-6 group miraitu-icon-container-glow">
      <div className="relative w-32 h-32 bg-gradient-to-br from-[#4ade80] to-[#14532d] rounded-[2rem] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_8px_16px_rgba(0,0,0,0.2)] border border-white/20">
        <span
          className="material-symbols-outlined text-white text-[80px] drop-shadow-md"
          style={{
            fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 48",
          }}
        >
          eco
        </span>
        {/* Glossy Highlight Overlay */}
        <div className="absolute top-0 left-0 w-full h-full rounded-[2rem] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-80 pointer-events-none" />
      </div>
    </div>
  );
}

/**
 * BrandNameAndTaglineSection - Displays the Miraitu brand name and tagline
 */
function BrandNameAndTaglineSection() {
  return (
    <div className="text-center mb-10 space-y-2">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg miraitu-text-shadow-large">
        Miraitu
      </h1>
      <p className="text-lg md:text-xl text-[var(--miraitu-background-light)] font-medium opacity-90 drop-shadow-md">
        Cultivating the future together.
      </p>
    </div>
  );
}

/**
 * GetStartedCallToActionButton - Primary action button to navigate to login/registration
 */
function GetStartedCallToActionButton() {
  return (
    <Link
      href="/user-login"
      className="group relative w-full max-w-xs miraitu-button-tactile h-16 bg-gradient-to-b from-[#417a3a] to-[var(--miraitu-primary-green)] text-white rounded-xl font-bold text-lg tracking-wide border-t border-[var(--miraitu-warm-yellow)]/50 transition-all flex items-center justify-center gap-3 overflow-hidden hover:brightness-110 animate-button-entrance"
    >
      {/* Button Glossy Highlight */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

      <span className="relative z-10">Get Started</span>
      <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">
        arrow_forward
      </span>
    </Link>
  );
}

/**
 * SignInLinkForExistingUsers - Link for users who already have an account
 */
function SignInLinkForExistingUsers() {
  return (
    <div className="mt-6 text-center animate-button-entrance">
      <p className="text-white/70 text-sm mb-2">Already have an account?</p>
      <Link
        href="/user-login"
        className="inline-flex items-center gap-2 text-[var(--miraitu-warm-yellow)] hover:text-[var(--miraitu-warm-yellow)]/80 font-semibold text-base transition-all hover:gap-3 group"
      >
        Sign In
        <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
          login
        </span>
      </Link>
    </div>
  );
}

/**
 * DecorativeFloatingOrbs - Ambient decorative elements for visual interest
 */
function DecorativeFloatingOrbs() {
  return (
    <>
      <div
        className="absolute top-4 right-4 w-12 h-12 bg-[var(--miraitu-warm-yellow)]/20 rounded-full blur-md animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-6 left-6 w-20 h-20 bg-[var(--miraitu-primary-green)]/20 rounded-full blur-xl animate-float"
        aria-hidden="true"
      />
    </>
  );
}

/**
 * CopyrightFooterText - Copyright notice at the bottom of the splash screen
 */
function CopyrightFooterText() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="absolute bottom-4 text-[var(--miraitu-primary-dark-green)]/70 text-xs font-medium z-10 animate-footer-entrance">
      © {currentYear} Miraitu Agriculture Tech
    </div>
  );
}
