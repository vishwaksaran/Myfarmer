# New Specialized Categories - Complete Implementation Guide

## 📋 Overview

Comprehensive V2 expansion with 3 new specialized category pages, expanded Quick Services, and updated Footer structure.

---

## 🏗️ New Category Pages

### 1. **Fencing & Infrastructure** (`/v2/fencing`)

**Features:**

#### Fencing Solutions (2 Types)
- **Rough/Chain-Link Fencing**
  - Price: ₹45/ft
  - Galvanized steel wire
  - Weather resistant
  - 10-year lifespan

- **Electrical/Power Fencing** ⚡ SHOCK-SAFE CERTIFIED
  - Price: ₹120/ft
  - Solar powered option
  - Anti-theft alarm
  - Wild animal deterrent
  - Remote monitoring

#### Construction Materials Marketplace
- **River Sand**: ₹800/tonne (Eco-friendly)
- **Hollow Blocks (6")**: ₹35/piece (Eco-friendly)
  - **Red Clay Bricks**: ₹6,500/1000 pieces

#### Quote Request Form
- Conditional display based on fencing selection
- Inputs: Name, phone, location, fencing length, timeline
- Dynamic selection display

**Design:**
- Amber/orange gradient hero
- Construction icon theme
- Eco-friendly badges
- Product cards with images

---

### 2. **Miraitu Organic Store** (`/v2/organic-store`)

**Features:**

#### Pure Fats & Ghee
- **A2 Cow Ghee** - ₹1,200/liter
  - 100% Pure A2
  - Hand-churned
  - No preservatives
  - Vedic method

- **Buffalo Ghee** - ₹900/liter
  - Rich & creamy
  - High fat content
  - Traditional method

#### Cold-Pressed Oils (4 Varieties)
- **Sunflower Oil**: ₹450/liter (Wood-pressed)
- **Coconut Oil**: ₹380/liter (Cold-pressed)
- **Palm Oil**: ₹320/liter (Organic)
- **Groundnut Oil**: ₹420/liter (Wood-pressed)

#### Features:
- Shopping cart functionality
- "FARMER-DIRECT" certification labels
- Glass bottle packaging
- Eco-friendly containers
- 3 certification badges (100% Organic, Eco Packaging, Farmer-Direct)

#### Packaging Promise Section
- Reusable glass bottles
- ₹50 refund per returned bottle
- Free delivery on ₹1000+
- Quality guaranteed
- Direct from farms

**Design:**
- Green/emerald gradient background
- Eco icon theme
- Product cards with gradient headers
- Shopping cart counter in header

---

### 3. **Protection & Specialized Services** (`/v2/protection`)

**Features:**

#### Tharpai (Tarpaulin) Sheets (3 Types)
- **Light Duty** - 120 GSM - ₹45/sqm
  - Crop cover, temporary shade

- **Heavy Duty** - 200 GSM - ₹75/sqm ⭐ MOST POPULAR
  - Warehouse cover, equipment protection

- **Virgin HDPE** - 250 GSM - ₹95/sqm
  - Premium protection, UV resistant

#### Ponding Sheets for Fish Farming (2 Types)
- **Fish Pond Liner 400 GSM** - ₹180/sqm
  - 400 microns thickness
  - BIS Certified
  - UV Stabilized
  - 10-year lifespan

- **Fish Pond Liner 600 GSM** - ₹250/sqm 💎 PREMIUM
  - 600 microns thickness
  - Ultra UV resistant
  - Chemical resistant
  - 15-year lifespan

#### Quote Request Form (Conditional)
- Shows after pond liner selection
- Pond area and depth calculator
- Dynamic product selection display

**Design:**
- Teal/cyan gradient hero
- Shield icon theme
- Premium badges
- Application pills

---

## 🚀 Expanded Quick Services

**New Total: 7 Service Cards**

### Existing (4):
1. Farm Services
2. Book Labour
3. Buy & Sell
4. Agri-Calculators

### New Additions (3):
5. **Borewell Booking** 💧
   - Icon: water_drop
   - Links to: `/v2/borewell`
   - Description: "One-click request for geological surveys"

6. **Pond Layout** 🌊
   - Icon: water
   - Links to: `/v2/protection`
   - Description: "Instant quotes for fish farm sizing"

7. **Solar Setup** ☀️
   - Icon: solar_power
   - Links to: `/v2/cctv`
   - Description: "Estimation tool for solar-powered systems"

**Updates:**
- Changed from 4-column to responsive grid
- Added link functionality
- Wrapped cards in anchor tags
- Added cursor pointer
- Updated description text

---

## 📍 Updated Footer Structure

**Removed:**
- Regional language selector (moved to Header modal)

**New 4-Column Structure:**

### Column 1: Brand
- Miraitu logo
- Brief description
- Social media icons (WhatsApp, Instagram, YouTube)

### Column 2: Marketplace
- Livestock Trading
- Fencing & Infrastructure
- Organic Store
- Protection Services

### Column 3: Support & Community
- Help Center
- Farmer Forum
- Success Stories
- Training Videos

### Column 4: Connect With Us
- **Farmer Helpline**: 1800-XXX-XXXX (Toll-Free 24x7)
- **Head Office**: Agricultural Innovation Hub, Bangalore

**Bottom Section:**
- Legal & Safety links (Terms, Privacy, FAQs, Refund)
- Copyright notice
- Security badge ("Secure & Encrypted Transactions")

---

## 🎨 Design Consistency

### Color Themes by Category:
- **Fencing**: Amber/Orange (#FFA500-#FF6347)
- **Organic Store**: Green/Emerald (#10B981-#059669)
- **Protection**: Teal/Cyan (#14B8A6-#0891B2)
- **Borewell**: Blue/Cyan (#3B82F6-#06B6D4)
- **CCTV**: Orange/Red (#FB923C-#DC2626)

### Common Elements:
- Skeuomorphic cards (`skeuo-card`)
- Glossy buttons (`glossy-button`)
- Tactile icons (`tactile-icon`)
- Gradient backgrounds
- Material Symbols icons
- Consistent padding (px-6 py-12)
- Max-width containers (1280px)

### Typography:
- Headings: `font-black` (900 weight)
- Body: `font-medium` (500 weight)
- Buttons: `font-bold` (700 weight)
- Space Grotesk font family

---

## 📁 File Structure

```
src/
├── app/
│   └── v2/
│       ├── borewell/
│       │   └── page.tsx
│       ├── cctv/
│       │   └── page.tsx
│       ├── fencing/
│       │   └── page.tsx ✅ NEW
│       ├── organic-store/
│       │   └── page.tsx ✅ NEW
│       └── protection/
│           └── page.tsx ✅ NEW
│
└── components/
    └── v2/
        ├── QuickServices.tsx ✅ UPDATED
        ├── Footer.tsx ✅ UPDATED
        ├── Header.tsx (with language modal)
        └── WaterEnergySection.tsx
```

---

## 🔗 Access URLs

**Main Pages:**
- Landing: `http://localhost:3000/v2`
- Borewell: `http://localhost:3000/v2/borewell`
- CCTV: `http://localhost:3000/v2/cctv`
- **Fencing**: `http://localhost:3000/v2/fencing` ✅
- **Organic Store**: `http://localhost:3000/v2/organic-store` ✅
- **Protection**: `http://localhost:3000/v2/protection` ✅

---

## ✅ Implementation Checklist

**Pages:**
- [x] Fencing & Infrastructure page
- [x] Organic Store page
- [x] Protection Services page

**Components:**
- [x] Expanded Quick Services (7 cards)
- [x] Updated Footer (4-column structure)
- [x] Removed language selector from Footer
- [x] Added working navigation links

**Features:**
- [x] Shopping cart (Organic Store)
- [x] Quote request forms (all pages)
- [x] Conditional form display
- [x] Certification badges
- [x] Eco-friendly tags
- [x] Premium/Popular badges
- [x] Dynamic pricing
- [x] Social media icons
- [x] Helpline information

**Design:**
- [x] Consistent color schemes
- [x] Skeuomorphic elements
- [x] Responsive layouts
- [x] Dark mode compatible
- [x] Hover effects
- [x] Gradient backgrounds
- [x] Material icons

---

## 🎯 Key Features by Page

### Fencing Page:
- ⚡ Shock-Safe certification tag
- 🏗️ Eco-friendly construction materials
- 📏 Length-based calculator
- 📋 Quote request form

### Organic Store:
- 🛒 Shopping cart functionality
- 🌿 Farmer-Direct certification
- ♻️ Eco-packaging promise
- 💰 Bottle refund program

### Protection Page:
- 📦 GSM-based product categorization
- 🐟 Fish farming specialization
- 💎 Premium quality badges
- 📐 Area/depth calculator

---

## 🔄 Navigation Flow

```
V2 Landing Page
    ↓
Quick Services (7 cards)
    ├→ Borewell Booking → /v2/borewell
    ├→ Pond Layout → /v2/protection
    ├→ Solar Setup → /v2/cctv
    ├→ Other services (internal)
    │
Footer Links
    ├→ Fencing & Infrastructure → /v2/fencing
    ├→ Organic Store → /v2/organic-store
    └→ Protection Services → /v2/protection
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 1 column grid
- **Tablet** (md): 2 columns
- **Desktop** (lg): 3-4 columns
- **Large** (xl): 4 columns

All layouts tested and optimized for all screen sizes.

---

## 🚀 Status: Production Ready ✅

All components are fully functional, accessible, and ready for deployment!

**Created**: 2026-02-01  
**Version**: 2.0  
**Last Updated**: 2026-02-01
