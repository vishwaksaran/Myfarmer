import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPromptProvider } from "@/context/LoginPromptContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import LoginPromptOverlay from "@/components/auth/LoginPromptOverlay";
import GlobalLoginInterceptor from "@/components/auth/GlobalLoginInterceptor";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://miraitu.in"),
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
      { url: "/logo-icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://miraitu.in",
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
  alternates: {
    canonical: "https://miraitu.in",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Miraitu",
              alternateName: "Miraitu Agriculture Tech",
              url: "https://miraitu.in",
              logo: "https://miraitu.in/logo-icon.png",
              description:
                "India's agriculture super app empowering farmers with machinery, crop marketplace, livestock, finance, veterinary services, and government schemes.",
              sameAs: [
                "https://www.instagram.com/miraitu",
                "https://x.com/Miraitu",
                "https://www.facebook.com/share/17xh4f5AUZ/",
                "https://www.youtube.com/@Miraitu",
                "https://www.linkedin.com/company/miraitu",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Miraitu",
              url: "https://miraitu.in",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "All-in-one agriculture super app for Indian farmers — rent machinery, trade crops & livestock, access farm finance, veterinary services, and government schemes.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
            }),
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
              {children}
              <LoginPromptOverlay />
              <GlobalLoginInterceptor />
              <ServiceWorkerRegistration />
            </LanguageProvider>
          </LoginPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

