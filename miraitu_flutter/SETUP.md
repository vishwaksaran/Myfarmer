# Miraitu Flutter App - Setup Guide

## Prerequisites
1. Install Flutter SDK: https://flutter.dev/docs/get-started/install
2. Install Android Studio or VS Code with Flutter extension
3. Set up an Android device or emulator

## Installation

```bash
cd miraitu_flutter
flutter pub get
flutter run
```

## Project Structure

```
lib/
├── main.dart                 # Entry point
├── app.dart                  # App root with router
├── theme/
│   ├── app_colors.dart       # Color constants (matches Miraitu web)
│   └── app_theme.dart        # MaterialTheme configuration
├── providers/
│   ├── auth_provider.dart    # Authentication state
│   └── cart_provider.dart    # Shopping cart state
├── widgets/
│   ├── app_header.dart       # Top navigation bar
│   ├── miraitu_logo.dart     # Logo widget
│   ├── search_bar_widget.dart
│   └── location_bar_widget.dart
└── screens/
    ├── main_scaffold.dart    # Bottom nav + tab shell
    ├── home/                 # Home screen (hero, services, stats)
    ├── services/             # Farm services screen
    ├── shop/                 # E-commerce shop
    ├── dashboard/            # User dashboard
    ├── sell/                 # Create listing
    ├── auth/                 # Login + OTP screens
    ├── livestock/            # Livestock marketplace
    ├── machinery/            # Farm machinery
    ├── crops/                # Crop marketplace + mandi prices
    ├── finance/              # Govt schemes & loans
    ├── community/            # Farmer social feed
    └── toolbox/              # Farm calculators & tools
```

## Key Features Implemented

### Bottom Navigation (5 tabs)
- Home | Services | + Sell | Shop | Dashboard

### Home Screen
- Hero carousel "The Future of Smart Farming"
- Stats: 50,000+ farmers, ₹2Cr+ trade, 500+ villages, 4.8★
- Quick services grid (8 items)
- Browse categories (Machinery, Crops, Livestock, Land)
- Farm Machinery cards
- Livestock market cards
- Mandi prices list
- Finance/KCC banner
- Farmer testimonials
- App download banner

### Services Screen (matches miraitu.in/home/services)
- Stats: 500+ Providers, 12,450 Booked, 4.8★, 200+ Areas
- 14 service categories with provider counts
- Filter chips by category
- How it works section
- Provider registration CTA

### Shop Screen
- Sale banner
- Category filter chips (Seeds, Fertilizers, Pesticides, Organic, Tools, Irrigation)
- Product grid with ratings, discounts, add to cart

### Dashboard Screen
- Login prompt for guests
- Stats: Listings, Orders, Rating, Earnings
- Recent activity
- My listings with view counts
- My orders

### Sell Screen
- 6 category selector (Livestock, Machinery, Crops, Land, Services, Products)
- Photo upload
- Dynamic form fields based on category
- Location input
- Contact preference

### Auth Screens
- Phone number input with India country code (+91)
- OTP 6-box input
- Terms agreement checkbox
- Google sign-in option
- Resend OTP timer

### Feature Screens
- Livestock: Buy/Sell tabs, category filters, listings
- Machinery: Type filter, listing cards with rental prices
- Crops: Mandi prices with % change, buy/sell tabs
- Finance: Govt schemes (KCC, PM Kisan, PMFBY, Solar, etc.)
- Community: Social feed with likes/comments
- Toolbox: Calculators (crop costing, land area converter, weather)

## Colors (matches miraitu.in exactly)
- Primary: #2C5926
- Accent: #28A745
- Gold: #DAA520
- Background: #F6F7F6

## OTP Login (Demo)
Use OTP: **123456** to log in during development
