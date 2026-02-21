<p align="center">
  <img src="miraitu-app/public/logo-icon.png" alt="Miraitu Logo" width="120" />
</p>

<h1 align="center">Miraitu – Cultivating the Future Together 🌾</h1>

<p align="center">
  <strong>India's #1 Agriculture Super App</strong><br/>
  Empowering farmers with technology — from machinery rental to crop marketplace, livestock trading, veterinary services, and smart farming tools.
</p>

<p align="center">
  <a href="https://miraitu.in">🌐 Live App</a> •
  <a href="https://www.instagram.com/miraitu">📸 Instagram</a> •
  <a href="https://x.com/Miraitu">𝕏 Twitter</a> •
  <a href="https://www.youtube.com/@Miraitu">▶️ YouTube</a> •
  <a href="https://www.linkedin.com/company/miraitu">💼 LinkedIn</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.2-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=googlechrome" alt="PWA" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel" alt="Vercel" />
</p>

---

## 📖 About

**Miraitu** is an all-in-one agricultural super app built for Indian farmers. It bridges the gap between traditional farming and modern technology, providing a unified platform for:

- 🚜 **Machinery Rental & Purchase** — Tractors, JCB, Harvesters, Drones, Implements
- 🌾 **Crop Marketplace** — Buy & sell crops directly, check mandi prices
- 🐄 **Livestock Trading** — Cattle, poultry, goats, sheep, fish marketplace
- 💊 **Veterinary Services** — Connect with vets, semen finder, animal healthcare
- 🏦 **Farm Finance** — Kisan Credit Card, crop insurance, PM-KISAN, NABARD schemes
- 🛒 **Agri Shop** — Seeds, fertilizers, pesticides, organic products
- 🔧 **Smart Toolbox** — Crop costing, fertilizer guide, weather alerts, land area calculator
- 🏡 **Land Services** — Buy, sell, rent, and lease agricultural land
- 💧 **Borewell & Fencing** — Drilling services, farm fencing solutions
- 📹 **CCTV & Security** — Farm surveillance and protection
- 👥 **Farmer Community** — Connect, share knowledge, and grow together

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🌐 **Multi-language** | English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Gujarati |
| 📱 **PWA** | Installable progressive web app with offline support & splash screen |
| 🔐 **Authentication** | Google OAuth + Email/Password via Supabase |
| 🛒 **Cart & Checkout** | Full e-commerce flow with Stripe integration |
| 📊 **Agri Calculators** | Crop costing, profit estimator, irrigation calc, unit converter |
| ☁️ **Weather Alerts** | Real-time weather data for farm planning |
| 📈 **Mandi Prices** | Live market rates for crops across India |
| 🎯 **Smart Search** | Unified search across all services, machinery, and products |
| 🤝 **Become a Seller** | Register as farmer, dealer, or service provider |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Frontend** | [React 19](https://react.dev/), TypeScript |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Authentication** | [Supabase Auth](https://supabase.com/) (Google OAuth) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Payments** | [Stripe](https://stripe.com/) |
| **Analytics** | [Firebase](https://firebase.google.com/) |
| **PWA** | Custom Service Worker with caching strategies |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Images** | Pexels, Unsplash, Google AI |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/vishwaksaran/Myfarmer.git
cd Myfarmer/miraitu-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase, Stripe, and Firebase credentials
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
miraitu-app/
├── public/               # Static assets, PWA files, icons
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── offline.html     # Offline fallback page
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── home/        # Main app pages
│   │   │   ├── machinery/    # Tractors, JCB, implements
│   │   │   ├── livestock/    # Cattle, poultry, fish
│   │   │   ├── crops/        # Crop marketplace
│   │   │   ├── shop/         # Agri e-commerce
│   │   │   ├── finance/      # Farm loans & insurance
│   │   │   ├── veterinary/   # Vet services
│   │   │   ├── toolbox/      # Agri calculators
│   │   │   ├── land/         # Land marketplace
│   │   │   └── community/    # Farmer forum
│   │   ├── marketplace/      # Public marketplace
│   │   └── auth/             # Authentication
│   ├── components/
│   │   ├── v2/              # V2 UI components
│   │   ├── auth/            # Auth components
│   │   ├── marketplace/     # Marketplace components
│   │   └── settings/        # Settings components
│   ├── context/             # React contexts (Auth, Cart, LoginPrompt)
│   ├── i18n/                # Internationalization (8 languages)
│   └── lib/                 # Supabase, Firebase, Prisma clients
├── supabase/
│   └── migrations/          # Database migrations
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 📱 PWA Features

Miraitu is a fully installable Progressive Web App:

- ✅ **Installable** — Add to home screen on Android & iOS
- ✅ **Offline Support** — Previously visited pages load offline
- ✅ **Splash Screen** — Branded launch screen for installed app
- ✅ **Smart Caching** — Cache-first for assets, network-first for pages
- ✅ **Light Mode Only** — Consistent light theme across all devices

---

## 🌍 Supported Languages

| Language | Code |
|----------|------|
| English | `en` |
| हिंदी (Hindi) | `hi` |
| తెలుగు (Telugu) | `te` |
| தமிழ் (Tamil) | `ta` |
| ಕನ್ನಡ (Kannada) | `kn` |
| मराठी (Marathi) | `mr` |
| বাংলা (Bengali) | `bn` |
| ગુજરાતી (Gujarati) | `gu` |

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by **Miraitu Agriculture Tech**.

---

## 📬 Contact

- **Website**: [miraitu.in](https://miraitu.in)
- **Instagram**: [@miraitu](https://www.instagram.com/miraitu)
- **Twitter**: [@Miraitu](https://x.com/Miraitu)
- **YouTube**: [@Miraitu](https://www.youtube.com/@Miraitu)
- **LinkedIn**: [Miraitu](https://www.linkedin.com/company/miraitu)
- **Facebook**: [Miraitu](https://www.facebook.com/share/17xh4f5AUZ/)

---

<p align="center">
  Made with ❤️ in India for Indian Farmers<br/>
  <strong>Miraitu Agriculture Tech</strong> © 2026
</p>
