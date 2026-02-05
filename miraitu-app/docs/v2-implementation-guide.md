# Miraitu V2 - Complete Implementation Guide

## ✅ Completed Components

1. **Header.tsx** - ✅ Created
2. **HeroSection.tsx** - ✅ Created  
3. **QuickServices.tsx** - ✅ Created
4. **LivestockMarketplace.tsx** - ✅ Created

## 📝 Remaining Components to Create

### 1. Footer.tsx
```typescript
// Location: src/components/v2/Footer.tsx
'use client';

export default function Footer() {
    return (
        <footer className="bg-background-dark text-white/80 px-6 py-20">
            {/* Multi-column layout with links, social, language selector */}
            {/* See HTML mockup for complete structure */}
        </footer>
    );
}
```

### 2. MachinerySection.tsx  
```typescript
// Location: src/components/v2/MachinerySection.tsx
'use client';

export default function MachinerySection() {
    return (
        <section className="bg-[#ebf0ea]/50 dark:bg-background-dark/30 px-6 py-16">
            {/* Sidebar filters + Product grid with comparison checkboxes */}
        </section>
    );
}
```

### 3. ServicesSection.tsx
```typescript
// Location: src/components/v2/ServicesSection.tsx
'use client';

export default function ServicesSection() {
    return (
        <section className="px-6 py-16">
            {/* Labor provider cards, mechanic services, cold storage */}
        </section>
    );
}
```

### 4. ToolboxSection.tsx
```typescript
// Location: src/components/v2/ToolboxSection.tsx
'use client';

export default function ToolboxSection() {
    return (
        <section className="px-6 py-16 bg-primary/5">
            {/* Calculator form + Consultation info */}
        </section>
    );
}
```

## 🎨 V2 Global Styles

### Location: src/app/v2/globals-v2.css  

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Space Grotesk', sans-serif;
}

.skeuo-card {
    background: linear-gradient(145deg, #ffffff, #f0f2f0);
    box-shadow: 6px 6px 12px #e1e3e1, -6px -6px 12px #ffffff;
}

.dark .skeuo-card {
    background: linear-gradient(145deg, #1c251b, #121811);
    box-shadow: 6px 6px 12px #0a0d0a, -2px -2px 12px #222d21;
}

.skeuo-inset {
    box-shadow: inset 2px 2px 5px #d1d3d1, inset -2px -2px 5px #ffffff;
}

.dark .skeuo-inset {
    box-shadow: inset 2px 2px 5px #0a0d0a, inset -2px -2px 5px #222d21;
}

.vibrant-gradient {
    background: linear-gradient(135deg, #2c5926 0%, #4a8c42 100%);
}

.skeuo-button-3d {
    background: linear-gradient(145deg, #ffffff, #e6e9e6);
    box-shadow: 4px 4px 8px #d1d4d1, -4px -4px 8px #ffffff;
    transition: all 0.2s ease;
}

.skeuo-button-3d:active {
    box-shadow: inset 2px 2px 5px #d1d4d1, inset -2px -2px 5px #ffffff;
    transform: translateY(1px);
}

.glossy-button {
    background: linear-gradient(180deg, #3d7936 0%, #2D5A27 100%);
    box-shadow: 0 4px 0 #1b3817, 0 8px 15px rgba(0,0,0,0.2);
}

.glossy-button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #1b3817, 0 4px 10px rgba(0,0,0,0.2);
}

.tactile-icon {
    background: linear-gradient(145deg, #f0f0f0, #ffffff);
    box-shadow: 4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff;
}

.service-card-hover:hover {
    box-shadow: 0 0 25px rgba(218, 165, 32, 0.3);
    border-color: rgba(218, 165, 32, 0.4);
}
```

## 🚀 Main V2 Page Assembly

### Location: src/app/v2/page.tsx

```typescript
import Header from '@/components/v2/Header';
import HeroSection from '@/components/v2/HeroSection';
import QuickServices from '@/components/v2/QuickServices';
import LivestockMarketplace from '@/components/v2/LivestockMarketplace';
import MachinerySection from '@/components/v2/MachinerySection';
import ServicesSection from '@/components/v2/ServicesSection';
import ToolboxSection from '@/components/v2/ToolboxSection';
import Footer from '@/components/v2/Footer';
import './globals-v2.css';

export default function V2Page() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            <Header />
            <HeroSection />
            <QuickServices />
            <LivestockMarketplace />
            <MachinerySection />
            <ServicesSection />
            <ToolboxSection />
            <Footer />
        </div>
    );
}
```

## 🎯 Tailwind Config Updates

Add to `tailwind.config.ts`:

```typescript
colors: {
    "lush-green": "#2D5A27",
    "accent": "#DAA520",
    "background-light": "#f6f7f6",
    "background-dark": "#161d15",
}

fontFamily: {
    "display": ["Space Grotesk", "sans-serif"]
}
```

## 📦 Implementation Steps

1. ✅ Create Header, Hero, QuickServices, Livestock (DONE)
2. ⏳ Create remaining components (Footer, Machinery, Services, Toolbox)
3. ⏳ Create V2 global styles CSS file
4. ⏳ Assemble main v2/page.tsx
5. ⏳ Update Tailwind config
6. ⏳ Test responsive behavior
7. ⏳ Add dark mode support

## 🔗 Access

Once complete, visit: `http://localhost:3000/v2`

---

**STATUS**: 4/8 components created. Ready to continue with remaining components.
