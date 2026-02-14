import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPromptProvider } from "@/context/LoginPromptContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import LoginPromptOverlay from "@/components/auth/LoginPromptOverlay";
import GlobalLoginInterceptor from "@/components/auth/GlobalLoginInterceptor";
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
  title: "Miraitu - Cultivating the Future Together",
  description: "Miraitu Agriculture Tech - Empowering farmers with modern technology for sustainable farming and better yields.",
  keywords: ["agriculture", "farming", "technology", "sustainable", "Miraitu"],
  authors: [{ name: "Miraitu Agriculture Tech" }],
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
    <html lang="en" className="light">
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
      </head>
      <body
        className={`${plusJakartaSans.variable} ${notoSans.variable} font-display antialiased`}
      >
        <AuthProvider>
          <LoginPromptProvider>
            <LanguageProvider>
              {children}
              <LoginPromptOverlay />
              <GlobalLoginInterceptor />
            </LanguageProvider>
          </LoginPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

