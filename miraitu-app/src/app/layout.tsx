import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPromptProvider } from "@/context/LoginPromptContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import LanguageFirstRunGate from "@/components/language/LanguageFirstRunGate";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

// Fonts are self-hosted from ./fonts rather than fetched via next/font/google.
//
// `next/font/google` downloads the woff2 files at BUILD time, which made every
// build depend on reaching fonts.googleapis.com and fonts.gstatic.com. That broke
// twice, in two different ways: locally the TLS handshake was rejected by an
// intercepting proxy, and on Vercel a restored build cache still pointed at
// gstatic URLs that Google had since rotated (they returned 404). Committing the
// files removes the network from the build path entirely.
//
// These are the same latin-subset files Google served, one per weight the app
// actually uses — re-download from the same CSS endpoint if a weight is added.
const plusJakartaSans = localFont({
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: true,
  adjustFontFallback: "Arial",
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-800.woff2", weight: "800", style: "normal" },
  ],
});

const notoSans = localFont({
  variable: "--font-noto",
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: false,
  adjustFontFallback: "Arial",
  src: [
    { path: "./fonts/noto-sans-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/noto-sans-latin-700.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.miraitu.in"),
  title: {
    default:
      "Miraitu – India's #1 Agriculture Super App | Tractor Rental, Crop & Livestock Marketplace",
    template: "%s | Miraitu",
  },
  description:
    "Miraitu is India's leading agriculture super app for farmers. Rent tractors & JCB, sell crops & livestock, access veterinary doctors, farm finance, government schemes, borewell, fencing, CCTV & more. Smart farming starts here.",
  keywords: [
    // Core Brand
    "Miraitu",
    "Miraitu app",
    "miraitu.in",
    "Miraitu agriculture super app",

    // High Search AgriTech Keywords
    "best farming app in India",
    "agriculture super app India",
    "digital farming India",
    "agri tech startup India",
    "smart farming solutions",
    "precision farming India",

    // Machinery & Rentals
    "tractor rental near me",
    "JCB rental India",
    "farm equipment rental app",
    "harvester rental India",
    "agricultural machinery booking app",

    // Marketplace
    "crop selling app India",
    "livestock marketplace India",
    "cattle trading app",
    "direct farmer to buyer",
    "agriculture marketplace India",

    // Government & Finance
    "PM Kisan update",
    "agriculture subsidy India",
    "KCC loan apply online",
    "NABARD schemes",
    "farm loan India",

    // Sustainable Farming
    "organic farming India",
    "natural farming India",
    "drip irrigation subsidy",
    "climate smart agriculture",
  ],
  authors: [{ name: "Miraitu Agriculture Tech" }],
  creator: "Miraitu Agriculture Tech",
  publisher: "Miraitu Agriculture Tech",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-48x48.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.miraitu.in",
    siteName: "Miraitu",
    title: "Miraitu – India's Agriculture Super App for Farmers",
    description:
      "Rent machinery, sell crops & livestock, access veterinary services, farm finance & government schemes — all in one powerful farming app.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Miraitu Agriculture Super App India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miraitu – Smart Farming Made Simple",
    description:
      "India's all-in-one farming app for machinery rental, crop marketplace, livestock & finance.",
    images: ["/icon-512.png"],
    creator: "@Miraitu",
  },
  // Remove global canonical — each page sets its own via metadata
  // alternates: { canonical: "..." } should NOT be set here
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Agriculture Technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2c5926",
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <meta name="color-scheme" content="light" />
        {/* Brand identity meta tags — help Google recognise 'Miraitu' as a brand name */}
        <meta name="application-name" content="Miraitu" />
        <meta name="apple-mobile-web-app-title" content="Miraitu" />
        <meta name="DC.title" content="Miraitu – India's Agriculture Super App" />
        <meta name="DC.creator" content="Miraitu Agriculture Tech" />
        <meta name="DC.subject" content="Miraitu, agriculture app India, farming super app" />
        <meta name="DC.language" content="en-IN" />
        {/* OpenSearch — signals Miraitu is a searchable brand site to Google */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="Miraitu"
          href="https://www.miraitu.in/opensearch.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.miraitu.in/#organization",
              name: "Miraitu",
              legalName: "Miraitu Agriculture Tech",
              alternateName: ["Miraitu App", "Miraitu Agriculture", "miraitu.in"],
              url: "https://www.miraitu.in",
              logo: {
                "@type": "ImageObject",
                url: "https://www.miraitu.in/logo-icon.png",
                width: 512,
                height: 512,
              },
              image: "https://www.miraitu.in/logo-icon.png",
              description:
                "Miraitu is India's agriculture super app empowering farmers with machinery rental, crop marketplace, livestock trading, finance, veterinary services, and government schemes.",
              foundingDate: "2023",
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              brand: {
                "@type": "Brand",
                name: "Miraitu",
              },
              telephone: "+91-9380306475",
              email: "support@miraitu.in",
              address: {
                "@type": "PostalAddress",
                streetAddress: "No 4A, Vinayaka Layout, Parappana Agrahara",
                addressLocality: "Bengaluru",
                addressRegion: "Karnataka",
                postalCode: "560100",
                addressCountry: "IN",
              },
              sameAs: [
                "https://www.instagram.com/miraituapp?igsh=MWRnMGV2OG9pYWljaw==",
                "https://x.com/Miraitu",
                "https://www.facebook.com/share/17xh4f5AUZ/",
                "https://www.youtube.com/@Miraitu",
                "https://www.linkedin.com/company/miraitu",
                "https://play.google.com/store/apps/details?id=in.miraitu",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+91-9380306475",
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi", "Telugu", "Kannada"],
                },
              ],
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://www.miraitu.in/home/crops?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* WebSite schema — enables Google Sitelinks Search Box and brand recognition */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://www.miraitu.in/#website",
              name: "Miraitu",
              alternateName: "Miraitu Agriculture Super App",
              url: "https://www.miraitu.in",
              description:
                "India's #1 agriculture super app — tractor rental, crop marketplace, livestock trading, veterinary services, farm finance, and government schemes.",
              inLanguage: ["en-IN", "hi-IN", "te-IN"],
              publisher: {
                "@id": "https://www.miraitu.in/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://www.miraitu.in/home/crops?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* SoftwareApplication schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Miraitu",
              applicationCategory: "BusinessApplication",
              applicationSubCategory: "Agriculture",
              operatingSystem: "Web, Android, iOS",
              url: "https://www.miraitu.in",
              brand: {
                "@type": "Brand",
                name: "Miraitu",
              },
              author: {
                "@id": "https://www.miraitu.in/#organization",
              },
              description:
                "Miraitu — India's agriculture super app. Rent farm machinery, sell crops and livestock, consult veterinary doctors, access government schemes and farm finance.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "10000",
                bestRating: "5",
              },
            }),
          }}
        />

        {/* Runs before first paint: flags installed-PWA (standalone) mode so the
            branded splash can cover the page from the very first frame — before
            the home page shows — instead of popping in after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true||location.search.indexOf('splash')>-1;if(s)document.documentElement.classList.add('pwa-standalone');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${notoSans.variable} font-display antialiased`}
        suppressHydrationWarning
      >
        <SplashScreen />
        <AuthProvider>
          <LoginPromptProvider>
            <LanguageProvider>
              <LocationProvider>
                {children}
                {/* Mobile-only, once per device: pick a language before the app. */}
                <LanguageFirstRunGate />
                <ServiceWorkerRegistration />
              </LocationProvider>
            </LanguageProvider>
          </LoginPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

