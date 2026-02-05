# Miraitu V2 - Desktop-First Implementation Plan

## 📋 Overview
Complete redesign of Miraitu with desktop-first approach, Space Grotesk typography, and comprehensive marketplace ecosystem.

## 🎨 Design System

### Colors
- Primary: `#2c5926` (Lush Green)
- Accent: `#DAA520` (Harvest Gold)
- Background Light: `#f6f7f6`
- Background Dark: `#161d15`

### Typography
- Font Family: `Space Grotesk`
- Weight Range: 300-700

### Design Pattern
- Skeuomorphic cards with raised/inset shadows
- Glossy buttons with 3D effect
- Tactile icons with depth

## 📁 Component Structure

### /src/components/v2/
1. ✅ **Header.tsx** - Navigation, search, language selector, auth
2. ✅ **HeroSection.tsx** - Hero banner with sell product form
3. ✅ **QuickServices.tsx** - 4 service cards grid
4. **LivestockMarketplace.tsx** - Livestock products with category tabs
5. **MachinerySection.tsx** - Machinery grid with filters and comparison
6. **ServicesSection.tsx** - Labor, mechanics, cold storage cards
7. **ToolboxSection.tsx** - Calculator form with consultation info
8. **Footer.tsx** - Multi-column footer with links

### /src/app/v2/
- **page.tsx** - Main landing page composing all sections
- **globals-v2.css** - V2-specific styles

## 🔧 Implementation Status

### Completed ✅
- [x] Header component
- [x] Hero section with form
- [x] Quick Services grid

### Pending ⏳
- [ ] Livestock Marketplace (with tabs)
- [ ] Machinery Section (with filters + comparison)
- [ ] Services Section (labor cards)
- [ ] Toolbox/Calculator Section
- [ ] Footer
- [ ] Main page assembly
- [ ] V2 global styles

## 📦 Next Steps

1. Create LivestockMarketplace with category filtering
2. Create MachinerySection with checkbox comparison
3. Create ServicesSection with featured providers
4. Create ToolboxSection with calculator form
5. Create Footer with multi-column layout
6. Assemble main v2/page.tsx
7. Add V2-specific CSS classes

## 🎯 Key Features

- Desktop-optimized layouts (max-width: 1280px)
- Grid-based responsive design
- Category filtering for livestock
- Product comparison for machinery
- Service provider cards
- Agricultural calculator tools
- Multi-language support UI
- Light/dark mode compatible

## 📝 Notes

- All components use 'use client' directive
- Material Symbols Outlined icons throughout
- Skeuo-morphic design patterns
- Hover states with service-card-hover class
- Glossy buttons for primary actions
