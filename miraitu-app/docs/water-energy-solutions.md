# Water & Energy Solutions - Documentation

## 📋 Overview

New specialized category pages for farm infrastructure services: **Borewell Services** and **CCTV Surveillance**.

## 🌊 Borewell Services Page

**URL**: `/v2/borewell`

### Features:

#### 1. **Service Cards** (2 Primary Services)
- **Borewell Drilling**
  - Depths up to 1000ft
  - Modern equipment
  - 24/7 support
  - Water quality testing
  - Price: ₹150/ft

- **Submersible Pump Installation**
  - HP selection guide
  - Complete electrical setup
  - 2-year warranty
  - Free maintenance
  - Price: From ₹25,000

#### 2. **Depth Calculator** (Interactive Tool)
- **Inputs**:
  - Required depth (feet)
  - Borewell diameter (6", 8", 10")
  - Soil type (Clay, Sandy, Rocky, Mixed)

- **Output**:
  - Real-time cost estimation
  - Base rate: ₹150/ft
  - Dynamic calculation display

#### 3. **Expert Consultation Booking Form**
- Full name input
- Phone number
- Farm location
- Preferred visit date
- Instant booking submission

### Design Elements:
- Blue gradient hero section (blue-50 to cyan-50)
- Water drop icon theme
- Skeuomorphic cards with depth effects
- Responsive grid layout

---

## 📹 CCTV Surveillance Page

**URL**: `/v2/cctv`

### Features:

#### 1. **Why Farm Surveillance** (4 Feature Cards)
- **Remote Mobile Monitoring**
  - iOS/Android app access
  - Instant notifications
  - Live feed from anywhere

- **Theft Prevention**
  - AI-powered motion detection
  - Instant alerts
  - Crop/equipment protection

- **Livestock Monitoring**
  - Health monitoring
  - Feeding patterns
  - Distress detection

- **Day & Night Coverage**
  - Advanced infrared
  - 24/7 operation
  - Weather-resistant

#### 2. **Package Selection** (3 Packages)

**Basic Solar Kit - ₹35,000**
- 4 HD Cameras (1080p)
- 100W Solar Panel
- 12V Battery Backup
- 500GB Storage DVR
- Mobile App Access
- Night Vision 30m

**Premium Solar Kit - ₹65,000** ⭐ MOST POPULAR
- 8 Full HD Cameras (2MP)
- 300W Solar Panel Array
- 24V Deep Cycle Battery
- 2TB Storage NVR
- Cloud Backup (1 Year)
- Night Vision 50m
- PTZ Camera Included
- Motion Detection Alerts

**Night Vision Specialist - ₹28,000**
- 4 Infrared Cameras
- Color Night Vision
- 1TB Storage
- True WDR Technology
- Smart IR Range 40m
- Weather Resistant IP67

#### 3. **Installation Request Form** (Conditional)
- Appears after package selection
- **Fields**:
  - Full name
  - Phone number
  - Farm address
  - Farm area (acres)
  - Preferred installation date
  - Special requirements
  - Shows selected package summary

### Design Elements:
- Dark hero section (slate-800 to slate-900)
- Orange/red gradient accents
- Interactive package cards
- Popular badge on premium package
- Scale effect on popular package

---

## 🏠 Water & Energy Section (Landing Page)

**Location**: V2 Homepage (between ServicesSection and ToolboxSection)

### Display Cards:

#### Borewell Services Card
- Blue gradient icon (blue-500 to cyan-600)
- Blue-50 background
- Features: Depth Calculator, Expert Consultation, Quality Testing
- Links to `/v2/borewell`

#### CCTV Surveillance Card
- Orange gradient icon (orange-500 to red-600)
- Orange-50 background
- Features: Solar Powered, Night Vision, Mobile Monitoring
- Links to `/v2/cctv`

### Section Design:
- 2-column grid (responsive)
- Category badge with accent color
- Centered heading and description
- Feature pills with checkmarks
- Glossy CTA buttons

---

## 📁 File Structure

```
src/
├── app/
│   └── v2/
│       ├── borewell/
│       │   └── page.tsx ✅ (Borewell Services Page)
│       └── cctv/
│           └── page.tsx ✅ (CCTV Surveillance Page)
│
└── components/
    └── v2/
        └── WaterEnergySection.tsx ✅ (Landing Page Section)
```

---

## 🎨 Design Patterns

### Color Schemes:
- **Borewell**: Blue/Cyan palette (water theme)
- **CCTV**: Orange/Red palette (alert/security theme)

### Common Elements:
- Skeuomorphic cards with raised shadows
- Glossy buttons for primary actions
- Gradient icon containers
- Material Symbols icons
- Responsive layouts
- Dark mode compatible

### Typography:
- Space Grotesk font family
- Bold headings (font-black)
- Clear hierarchy

---

## 🚀 Access URLs

- **Main Landing**: `http://localhost:3000/v2`
- **Borewell Services**: `http://localhost:3000/v2/borewell`
- **CCTV Surveillance**: `http://localhost:3000/v2/cctv`

---

## ✅ Status

**All components created and integrated!**

- [x] Borewell Services page with calculator
- [x] CCTV Surveillance page with packages
- [x] Water & Energy section on landing page
- [x] Integration with V2 navigation
- [x] Responsive design
- [x] Form validation ready

---

## 🔮 Future Enhancements

- [ ] Backend API integration for form submissions
- [ ] Real-time availability checking
- [ ] Customer reviews and ratings
- [ ] Photo gallery of installations
- [ ] Video tutorials
- [ ] Live chat support
- [ ] Payment gateway integration
- [ ] Appointment scheduling system

---

**Created**: 2026-02-01  
**Version**: 1.0  
**Status**: Production Ready ✅
