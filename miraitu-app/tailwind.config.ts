import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "primary": "#2c5926", // Updated to match user request
                "primary-dark": "#1F3A1D", // Updated
                "lush-leaf": "#28a745",
                "lush-green": "#2D5A27", // V2 color
                "lime-green": "#8CDA4F",
                "lime-accent": "#B0EA3C", // New
                "accent": "#DAA520", // V2 Harvest Gold
                "background-light": "#f6f7f6", // V2 updated
                "background-dark": "#161d15", // V2 updated
                "harvest-loam": "#f5f3ed", // New
                "harvest-gold": "#E0C040",
                "fresh-cream": "#FBFAF5",
                "loam": "#F5F3ED",
                "forest": "#1F3A1D",
                "forest-charcoal": "#1F3A1D", // New alias
                "soil-dark": "#4a453e", // New
            },
            fontFamily: {
                "display": ["var(--font-jakarta)", "sans-serif"],
                "body": ["var(--font-noto)", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "full": "9999px"
            },
            boxShadow: {
                'soft-lift': '0 20px 40px -10px rgba(44, 89, 38, 0.15)',
                'card-idle': '0 4px 0 0 #e2e8e0, 0 8px 16px rgba(0,0,0,0.05)',
                'card-hover': '0 6px 0 0 #e2e8e0, 0 12px 20px rgba(0,0,0,0.08)',
                'card-active': '0 0 0 0 #e2e8e0, inset 0 2px 6px rgba(0,0,0,0.05)',
                'card-selected': '0 0 0 4px #2c5926',
                'soft-raised': '6px 6px 12px rgba(166, 164, 156, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.8)',
                'soft-inset': 'inset 4px 4px 8px rgba(166, 164, 156, 0.25), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
                'button-pressed': 'inset 2px 2px 5px rgba(0, 0, 0, 0.2)',
                'floating': '0 20px 25px -5px rgba(44, 89, 38, 0.3), 0 8px 10px -6px rgba(44, 89, 38, 0.3)',
            }
        },
    },
    plugins: [],
};

export default config;
