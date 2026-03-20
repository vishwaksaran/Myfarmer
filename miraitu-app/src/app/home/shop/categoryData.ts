export interface Product {
    id: number;
    name: string;
    price: string;
    originalPrice: string;
    rating: number;
    reviews: number;
    image: string;
    badge: string | null;
    description: string;
    weight?: string;
    imageFit?: 'cover' | 'contain';
}

export const categoryProducts: Record<string, Product[]> = {
    'agriculture-drone': [
        { id: 101, name: 'DJI Agras T40 Spraying Drone', price: '₹12,50,000', originalPrice: '₹14,00,000', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop', badge: 'Best Seller', description: '40L tank, 50-acre/hour coverage, RTK precision spraying' },
        { id: 102, name: 'DJI Agras T20P Agriculture Drone', price: '₹8,50,000', originalPrice: '₹9,80,000', rating: 4.7, reviews: 89, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop', badge: 'Popular', description: '20L tank, dual atomized spraying, terrain-follow mode' },
        { id: 103, name: 'AgriBot X1 Mapping Drone', price: '₹3,20,000', originalPrice: '₹3,80,000', rating: 4.5, reviews: 56, image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=400&fit=crop', badge: null, description: 'Multispectral imaging, NDVI mapping, crop health analysis' },
        { id: 104, name: 'SkySpray 10L Entry Drone', price: '₹1,85,000', originalPrice: '₹2,20,000', rating: 4.3, reviews: 201, image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=400&fit=crop', badge: 'Budget', description: '10L tank, ideal for small farms, easy to operate' },
        { id: 105, name: 'FarmEagle Surveillance Drone', price: '₹95,000', originalPrice: '₹1,20,000', rating: 4.6, reviews: 78, image: 'https://images.unsplash.com/photo-1506947411487-a56738571d67?w=400&h=400&fit=crop', badge: null, description: '4K camera, 45-min flight, real-time crop monitoring' },
        { id: 106, name: 'Drone Spray Nozzle Set (6 pcs)', price: '₹4,500', originalPrice: '₹5,200', rating: 4.4, reviews: 312, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop', badge: 'Accessory', description: 'Anti-drip, adjustable flow rate, fits DJI Agras series' },
        { id: 107, name: 'Drone Battery Pack (2 units)', price: '₹28,000', originalPrice: '₹32,000', rating: 4.7, reviews: 145, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop', badge: null, description: 'Fast-charge Li-Po, 18 min flight time per battery' },
        { id: 108, name: 'Drone Pilot Training Course', price: '₹15,000', originalPrice: '₹20,000', rating: 4.9, reviews: 67, image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=400&fit=crop', badge: 'New', description: '5-day hands-on training, DGCA certification assistance' },
    ],
    'seeds': [
        { id: 201, name: 'Hybrid Tomato Seeds - 500g', price: '₹1,250', originalPrice: '₹1,500', rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'High-yield hybrid, disease resistant, 90-day harvest' },
        { id: 202, name: 'Wheat HD-3226 Seeds 40kg', price: '₹2,800', originalPrice: '₹3,200', rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Top Rated', description: 'High-yielding, heat tolerant, suitable for late sowing' },
        { id: 203, name: 'Organic Paddy Seeds (Basmati 1121)', price: '₹3,500', originalPrice: '₹4,000', rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop', badge: 'Organic', description: 'Premium basmati, long grain, aromatic variety' },
        { id: 204, name: 'Cotton BG-II Bt Seeds 450g', price: '₹850', originalPrice: '₹950', rating: 4.5, reviews: 178, image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=400&h=400&fit=crop', badge: null, description: 'Bollworm resistant, high lint percentage' },
        { id: 205, name: 'Mustard Pusa Bold Seeds 5kg', price: '₹600', originalPrice: '₹750', rating: 4.4, reviews: 112, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: null, description: 'Bold grain, high oil content (40-42%)' },
        { id: 206, name: 'Vegetable Seeds Combo (12 types)', price: '₹499', originalPrice: '₹799', rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Tomato, chili, okra, brinjal, gourd & 7 more' },
        { id: 207, name: 'Maize Pioneer P3396 Hybrid', price: '₹1,100', originalPrice: '₹1,300', rating: 4.5, reviews: 98, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: null, description: 'High starch, dual purpose (grain + fodder)' },
        { id: 208, name: 'Onion Seeds Nasik Red 1kg', price: '₹1,800', originalPrice: '₹2,200', rating: 4.3, reviews: 67, image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=400&fit=crop', badge: 'Popular', description: 'Deep red color, pungent, good shelf life' },
    ],
    'garden-products': [
        { id: 301, name: 'Organic Neem Pesticide 5L', price: '₹850', originalPrice: '₹1,000', rating: 4.7, reviews: 256, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Eco-Friendly', description: 'Cold-pressed neem oil, controls 200+ pests naturally' },
        { id: 302, name: 'Vermicompost 50kg Bag', price: '₹450', originalPrice: '₹550', rating: 4.8, reviews: 312, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Premium earthworm compost, rich in NPK & micronutrients' },
        { id: 303, name: 'Garden Sprayer Pump 16L', price: '₹1,200', originalPrice: '₹1,500', rating: 4.5, reviews: 189, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Manual pressure pump, adjustable nozzle, back-mounted' },
        { id: 304, name: 'Cocopeat Block 5kg (Expands to 75L)', price: '₹350', originalPrice: '₹450', rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Popular', description: 'Excellent water retention, pH balanced, seedling-safe' },
        { id: 305, name: 'Humic Acid Granules 25kg', price: '₹1,600', originalPrice: '₹1,900', rating: 4.4, reviews: 145, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Improves soil structure, nutrient uptake & root growth' },
        { id: 306, name: 'Mulching Film Roll (400m)', price: '₹2,800', originalPrice: '₹3,200', rating: 4.3, reviews: 78, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'UV stabilized, weed control, moisture conservation' },
    ],
    'crop-special-kit': [
        { id: 401, name: 'Complete Rice Farming Kit', price: '₹4,500', originalPrice: '₹5,200', rating: 4.5, reviews: 67, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Seeds + DAP + Urea + Pesticide + Zinc for 1 acre rice' },
        { id: 402, name: 'Wheat Season Complete Kit', price: '₹3,800', originalPrice: '₹4,500', rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Best Value', description: 'HD-3226 seeds + all fertilizers + weedicide for 1 acre' },
        { id: 403, name: 'Cotton Growth Booster Kit', price: '₹5,200', originalPrice: '₹6,000', rating: 4.4, reviews: 56, image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=400&h=400&fit=crop', badge: null, description: 'Bt seeds + NPK + micro-nutrients + pest management' },
        { id: 404, name: 'Kitchen Garden Starter Kit', price: '₹1,200', originalPrice: '₹1,800', rating: 4.7, reviews: 345, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Popular', description: '10 veggie seeds + cocopeat + pots + organic fertilizer' },
        { id: 405, name: 'Sugarcane Planting Kit', price: '₹6,500', originalPrice: '₹7,800', rating: 4.3, reviews: 34, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'Sets + basal fertilizer + fungicide for 1 acre' },
        { id: 406, name: 'Organic Farming Starter Kit', price: '₹3,200', originalPrice: '₹4,000', rating: 4.8, reviews: 198, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Eco-Friendly', description: 'Vermicompost + neem cake + bio-fertilizers + panchagavya' },
    ],
    'agri-inputs': [
        { id: 501, name: 'NPK 12-32-16 Fertilizer 50kg', price: '₹1,800', originalPrice: '₹2,100', rating: 4.4, reviews: 312, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'Complex fertilizer for balanced crop nutrition' },
        { id: 502, name: 'Urea 46% N (45kg bag)', price: '₹267', originalPrice: '₹300', rating: 4.5, reviews: 567, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Essentials', description: 'Government-rate neem coated urea for top dressing' },
        { id: 503, name: 'DAP 18-46-0 (50kg)', price: '₹1,350', originalPrice: '₹1,500', rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Diammonium phosphate, ideal basal application' },
        { id: 504, name: 'Imidacloprid 17.8% SL 250ml', price: '₹320', originalPrice: '₹400', rating: 4.3, reviews: 234, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Systemic insecticide for sucking pests – jassids, aphids' },
        { id: 505, name: 'Mancozeb 75% WP 1kg', price: '₹450', originalPrice: '₹520', rating: 4.4, reviews: 189, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Contact fungicide for blight, rust & leaf spot' },
        { id: 506, name: 'Zinc Sulphate 21% (25kg)', price: '₹850', originalPrice: '₹1,000', rating: 4.5, reviews: 156, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'Micronutrient for zinc-deficient soils' },
        { id: 507, name: 'Glyphosate 41% SL 1L', price: '₹380', originalPrice: '₹450', rating: 4.2, reviews: 278, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Non-selective herbicide for pre-sowing weed control' },
        { id: 508, name: 'Sulphur 80% WDG 5kg', price: '₹600', originalPrice: '₹720', rating: 4.3, reviews: 112, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'Fungicide + sulphur nutrition, controls powdery mildew' },
    ],
    'agriculture-tools': [
        { id: 601, name: 'Professional Pruning Shears', price: '₹650', originalPrice: '₹800', rating: 4.9, reviews: 445, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Top Rated', description: 'Bypass type, carbon steel blade, 8-inch, ergonomic grip' },
        { id: 602, name: 'Soil pH & Moisture Meter', price: '₹1,200', originalPrice: '₹1,500', rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Popular', description: '3-in-1: pH, moisture & light meter, no battery needed' },
        { id: 603, name: 'Hand Weeder Set (3 pcs)', price: '₹450', originalPrice: '₹550', rating: 4.5, reviews: 189, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Khurpi + hand fork + trowel, rust-proof coated steel' },
        { id: 604, name: 'Battery Sprayer 12V 16L', price: '₹2,800', originalPrice: '₹3,500', rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Rechargeable, 4-5 hour runtime, 4 nozzle types' },
        { id: 605, name: 'Garden Hose Pipe 30m', price: '₹1,100', originalPrice: '₹1,400', rating: 4.4, reviews: 167, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: '3-layer PVC, kink-resistant, with spray gun attachment' },
        { id: 606, name: 'Sickle (Datri) Premium Steel', price: '₹180', originalPrice: '₹220', rating: 4.8, reviews: 567, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: null, description: 'Serrated edge, hardwood handle, harvest-ready' },
        { id: 607, name: 'Seed Drill Hand Planter', price: '₹3,500', originalPrice: '₹4,200', rating: 4.5, reviews: 98, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'New', description: 'Adjustable spacing, suitable for wheat/mustard/moong' },
        { id: 608, name: 'Drip Irrigation Starter Kit', price: '₹2,499', originalPrice: '₹3,200', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Popular', description: 'Covers 1000 sqft, emitters + filters + connectors' },
    ],
    'cold-press-oil': [
        { id: 701, name: 'Cold Press Groundnut Oil 1L', price: '₹350', originalPrice: '₹420', rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Wood-pressed, unfiltered, retains natural aroma & nutrients' },
        { id: 702, name: 'Cold Press Coconut Oil 500ml', price: '₹280', originalPrice: '₹350', rating: 4.7, reviews: 189, image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop', badge: 'Organic', description: 'Virgin coconut oil, Chekku pressed, no chemicals' },
        { id: 703, name: 'Cold Press Sesame Oil 1L', price: '₹450', originalPrice: '₹520', rating: 4.9, reviews: 312, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', badge: 'Top Rated', description: 'Gingelly oil, traditional wood-press, rich in calcium' },
        { id: 704, name: 'Cold Press Mustard Oil 1L', price: '₹220', originalPrice: '₹280', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', badge: 'Popular', description: 'Kacchi Ghani, pungent, ideal for cooking & pickling' },
        { id: 705, name: 'Cold Press Sunflower Oil 1L', price: '₹310', originalPrice: '₹380', rating: 4.5, reviews: 145, image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop', badge: null, description: 'Light flavor, high smoke point, heart-healthy' },
        { id: 706, name: 'Cold Press Flaxseed Oil 500ml', price: '₹520', originalPrice: '₹650', rating: 4.7, reviews: 98, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', badge: 'New', description: 'Rich in Omega-3, lignans & fiber, unrefined' },
        { id: 707, name: 'Wood Press Oil Gift Set (3 oils)', price: '₹899', originalPrice: '₹1,100', rating: 4.8, reviews: 67, image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Groundnut + Sesame + Coconut, 250ml each, gift box' },
    ],
    'solar-dry-products': [
        // ── RaloS Brand – 20 Products (15% Flat Off) ────────────────────────
        { id: 801, name: 'Moringa Powder', price: '₹187', originalPrice: '₹220', rating: 4.8, reviews: 312, image: 'https://ralos.in/wp-content/uploads/2025/12/IMG-20250826-WA0003.jpg', badge: 'Popular', description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 802, name: 'Banana Powder', price: '₹183', originalPrice: '₹215', rating: 4.6, reviews: 198, image: 'https://ralos.in/wp-content/uploads/2025/12/1-3.png', badge: null, description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 803, name: 'Baby Food – Tinny Tunny Foods', price: '₹187', originalPrice: '₹220', rating: 4.7, reviews: 145, image: 'https://ralos.in/wp-content/uploads/2025/12/Baby-Food-01.jpg', badge: 'New', description: '100% Natural, No added Chemicals & Preservatives', weight: '200 gms' },
        { id: 804, name: 'Curry Leaf Powder', price: '₹128', originalPrice: '₹150', rating: 4.9, reviews: 423, image: 'https://ralos.in/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-03-at-11.42.09-AM-1.jpeg', badge: 'Best Seller', description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 805, name: 'Amla Powder', price: '₹187', originalPrice: '₹220', rating: 4.8, reviews: 356, image: 'https://ralos.in/wp-content/uploads/2025/12/20251221_171527-scaled.jpg', badge: 'Top Rated', description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 806, name: 'Beet Root Powder', price: '₹183', originalPrice: '₹215', rating: 4.7, reviews: 267, image: 'https://ralos.in/wp-content/uploads/2025/12/20251221_171401-1-scaled.jpg', badge: null, description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 807, name: 'Aloe Vera Powder', price: '₹221', originalPrice: '₹260', rating: 4.6, reviews: 189, image: 'https://ralos.in/wp-content/uploads/2025/12/20251221_171657-scaled.jpg', badge: null, description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 808, name: 'Hibiscus Powder', price: '₹202', originalPrice: '₹238', rating: 4.7, reviews: 234, image: 'https://ralos.in/wp-content/uploads/2025/12/20251221_171935-scaled.jpg', badge: 'Popular', description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 809, name: 'Wheat Grass Powder', price: '₹204', originalPrice: '₹240', rating: 4.8, reviews: 178, image: 'https://ralos.in/wp-content/uploads/2025/12/1-9.png', badge: null, description: '100% Natural, No added Chemicals & Preservatives', weight: '100 gms' },
        { id: 810, name: 'ABC Powder (Apple Beetroot Carrot)', price: '₹242', originalPrice: '₹285', rating: 4.7, reviews: 298, image: 'https://ralos.in/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-24-at-7.48.30-AM.jpeg', badge: 'Detox', description: 'Supports natural detox & digestion for healthy skin glow', weight: '100 gms' },
        { id: 811, name: 'Multani Mitti Powder', price: '₹94', originalPrice: '₹110', rating: 4.5, reviews: 134, image: 'https://ralos.in/wp-content/uploads/2025/12/1-8.png', badge: null, description: '100% Natural Fuller\'s Earth clay powder', weight: '100 gms' },
        { id: 812, name: 'Idly Podi', price: '₹128', originalPrice: '₹150', rating: 4.8, reviews: 389, image: '/images/ralos/idly-podi.png', badge: 'Popular', description: 'Andhro Style Idly Podi – Bold Aroma, Authentic Flavor', weight: '100 gms' },
        { id: 813, name: 'Detox Juice – Amla Beetroot', price: '₹200', originalPrice: '₹235', rating: 4.6, reviews: 212, image: 'https://ralos.in/wp-content/uploads/2026/01/1-1.png', badge: 'Detox', description: 'Helps reduce digestion issues & supports free motion', weight: '100 gms' },
        { id: 814, name: 'Herbal Tea – Hibiscus Tea', price: '₹213', originalPrice: '₹250', rating: 4.9, reviews: 445, image: '/images/ralos/herbal-tea.png', badge: 'Top Rated', description: '100% Sun Dried Hibiscus Herbal Tea – rich in antioxidants', weight: '100 gms' },
        { id: 815, name: 'KayaShuddi – Body Scrub', price: '₹157', originalPrice: '₹185', rating: 4.7, reviews: 167, image: 'https://ralos.in/wp-content/uploads/2025/12/Front-90x90mm.png', badge: null, description: '45 Herbs Natural Detox for Body & Scalp', weight: '100 gms' },
        { id: 816, name: 'Herbal Hair Pack', price: '₹166', originalPrice: '₹195', rating: 4.8, reviews: 298, image: 'https://ralos.in/wp-content/uploads/2026/02/website_cWXCcCyV_1773655474232_pepfecbgmmoirmk.webp', badge: 'Best Seller', description: 'Henna, Amla, Shikakai, Bhringraj & 15+ Ayurvedic herbs', weight: '100 gms' },
        { id: 817, name: 'Vedic Radiance Multipurpose Balm', price: '₹55', originalPrice: '₹65', rating: 4.6, reviews: 189, image: '/images/ralos/multipurpose-balm.png', badge: 'Ayurvedic', description: 'Sandalwood, Amla, Coconut Oil, Beeswax & Blue Tea Extract', weight: '10 gms', imageFit: 'cover' },
        { id: 818, name: 'Tulasmrit Drops', price: '₹94', originalPrice: '₹110', rating: 4.7, reviews: 224, image: '/images/ralos/tulasi-drops.png', badge: null, description: 'Soothes throat, supports relief from cold & cough', weight: '30 ml' },
        { id: 819, name: 'Moringa Podi', price: '₹128', originalPrice: '₹150', rating: 4.8, reviews: 267, image: 'https://ralos.in/wp-content/uploads/2025/12/IMG-20250826-WA0003.jpg', badge: null, description: 'Made of Natural spices to enrich the Idli or Rice Mix', weight: '100 gms' },
        { id: 820, name: 'ABC Powder 50gms (Apple Beetroot Carrot)', price: '₹140', originalPrice: '₹165', rating: 4.7, reviews: 156, image: 'https://ralos.in/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-24-at-7.48.30-AM.jpeg', badge: 'Value Pack', description: 'Supports natural detox & digestion for healthy skin glow', weight: '50 gms' },
    ],
    'organic-manure': [
        { id: 901, name: 'Vermicompost Premium 50kg', price: '₹450', originalPrice: '₹550', rating: 4.8, reviews: 345, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Earthworm cast, NPK rich, improves soil structure' },
        { id: 902, name: 'Neem Cake Powder 25kg', price: '₹650', originalPrice: '₹780', rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Organic', description: 'Natural pest repellent + nitrogen source, dual action' },
        { id: 903, name: 'Bone Meal Fertilizer 10kg', price: '₹380', originalPrice: '₹450', rating: 4.5, reviews: 178, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: null, description: 'High phosphorus, for root development & flowering' },
        { id: 904, name: 'Panchagavya Liquid 5L', price: '₹320', originalPrice: '₹400', rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Traditional', description: 'Cow-based bio-stimulant, foliar spray, growth promoter' },
        { id: 905, name: 'Jeevamrutha Culture 10L', price: '₹280', originalPrice: '₹350', rating: 4.4, reviews: 198, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop', badge: 'Popular', description: 'Zero-budget natural farming, soil microbial booster' },
        { id: 906, name: 'Coco Peat + Vermicompost Mix 30kg', price: '₹520', originalPrice: '₹650', rating: 4.6, reviews: 289, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Ready-to-use potting mix, pH balanced, for containers' },
    ],
    'millets-grains': [
        { id: 1001, name: 'Foxtail Millet (Thinai) 1kg', price: '₹120', originalPrice: '₹160', rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Popular', description: 'Unpolished, high fiber, low glycemic index, diabetic-friendly' },
        { id: 1002, name: 'Finger Millet (Ragi) Flour 1kg', price: '₹85', originalPrice: '₹110', rating: 4.8, reviews: 456, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Stone-ground, calcium rich, ideal for ragi mudde & dosa' },
        { id: 1003, name: 'Pearl Millet (Bajra) 2kg', price: '₹140', originalPrice: '₹180', rating: 4.5, reviews: 189, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: null, description: 'Whole grain, iron-rich, for rotis & khichdi' },
        { id: 1004, name: 'Little Millet (Samai) 1kg', price: '₹150', originalPrice: '₹190', rating: 4.6, reviews: 145, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Organic', description: 'Gluten-free, easy to cook, rice substitute' },
        { id: 1005, name: 'Barnyard Millet (Kuthiraivali) 1kg', price: '₹130', originalPrice: '₹170', rating: 4.4, reviews: 112, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: null, description: 'Low calorie, high fiber, fasting-friendly grain' },
        { id: 1006, name: 'Multi-Millet Mix (5 grains) 1kg', price: '₹220', originalPrice: '₹280', rating: 4.7, reviews: 267, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Ragi + Foxtail + Pearl + Little + Barnyard millet combo' },
        { id: 1007, name: 'Sorghum (Jowar) Whole 2kg', price: '₹100', originalPrice: '₹130', rating: 4.5, reviews: 198, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', badge: null, description: 'Gluten-free, high antioxidants, for bhakri & porridge' },
    ],
    'honey-products': [
        { id: 1101, name: 'Raw Forest Honey 500g', price: '₹450', originalPrice: '₹550', rating: 4.9, reviews: 312, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'Top Rated', description: 'Unprocessed, unfiltered wild honey from Western Ghats' },
        { id: 1102, name: 'Multiflora Honey 1kg', price: '₹650', originalPrice: '₹800', rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Mixed flower honey, thick consistency, rich taste' },
        { id: 1103, name: 'Bee Pollen Granules 200g', price: '₹380', originalPrice: '₹480', rating: 4.6, reviews: 98, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'Superfood', description: 'High protein, vitamins & minerals, immunity booster' },
        { id: 1104, name: 'Beeswax Block 500g', price: '₹320', originalPrice: '₹400', rating: 4.5, reviews: 67, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: null, description: 'Pure cosmetic-grade, for candles, balms & polishes' },
        { id: 1105, name: 'Bee Hive Starter Kit', price: '₹3,500', originalPrice: '₹4,200', rating: 4.8, reviews: 45, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'New', description: 'Langstroth box + frames + smoker + gloves, beginner kit' },
        { id: 1106, name: 'Neem Honey 350g', price: '₹520', originalPrice: '₹650', rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', badge: 'Premium', description: 'Bitter-sweet, medicinal grade, anti-bacterial properties' },
    ],
    'spices-herbs': [
        { id: 1201, name: 'Turmeric Powder (Lakadong) 500g', price: '₹350', originalPrice: '₹420', rating: 4.9, reviews: 456, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Top Rated', description: 'High curcumin (7-12%), Meghalaya origin, farm-direct' },
        { id: 1202, name: 'Red Chilli Powder (Guntur) 500g', price: '₹180', originalPrice: '₹220', rating: 4.7, reviews: 378, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Popular', description: 'Bold color & heat, Teja variety, stone-ground' },
        { id: 1203, name: 'Black Pepper Whole 250g', price: '₹280', originalPrice: '₹350', rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Premium', description: 'Wayanad estate pepper, bold grade, pungent aroma' },
        { id: 1204, name: 'Cardamom (Elaichi) 100g', price: '₹420', originalPrice: '₹500', rating: 4.6, reviews: 156, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: null, description: 'Green cardamom, 8mm bold, from Kerala hills' },
        { id: 1205, name: 'Coriander Seeds 500g', price: '₹90', originalPrice: '₹120', rating: 4.5, reviews: 289, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: null, description: 'Whole dhania, aromatic, Rajasthan origin' },
        { id: 1206, name: 'Cumin Seeds (Jeera) 250g', price: '₹160', originalPrice: '₹200', rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Gujarat origin, bold grain, hand-sorted' },
        { id: 1207, name: 'Dried Moringa Leaves 200g', price: '₹180', originalPrice: '₹240', rating: 4.4, reviews: 123, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Superfood', description: 'Solar dried, powder-ready, rich in iron & calcium' },
        { id: 1208, name: 'Kitchen Spice Box Set (12 spices)', price: '₹799', originalPrice: '₹999', rating: 4.8, reviews: 189, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', badge: 'Bundle', description: 'Farm-fresh: turmeric, chilli, pepper, cumin, coriander & 7 more' },
    ],
    'dairy-products': [
        { id: 1301, name: 'Fresh Full-Cream Milk 1L', price: '₹65', originalPrice: '₹75', rating: 4.8, reviews: 512, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop', badge: 'Fresh Daily', description: 'Farm-fresh, pasteurized, 3.5% fat, sourced from local dairy farms' },
        { id: 1302, name: 'Pure Cow Ghee 500ml', price: '₹420', originalPrice: '₹500', rating: 4.9, reviews: 389, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop', badge: 'Best Seller', description: 'Bilona churned A2 cow ghee, golden color, rich aroma' },
        { id: 1303, name: 'Natural Paneer (Cottage Cheese) 200g', price: '₹90', originalPrice: '₹110', rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop', badge: 'Fresh', description: 'Soft, fresh-made paneer from pure cow milk, 72hr shelf life' },
        { id: 1304, name: 'Dahi (Curd) 500g', price: '₹45', originalPrice: '₹55', rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop', badge: 'Popular', description: 'Set curd, thick & creamy, probiotic-rich, natural culture' },
        { id: 1305, name: 'Butter (White Makhan) 200g', price: '₹110', originalPrice: '₹135', rating: 4.5, reviews: 178, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop', badge: 'Traditional', description: 'Hand-churned table butter from cultured cream, unsalted' },
        { id: 1306, name: 'Lassi (Sweet) 500ml', price: '₹55', originalPrice: '₹70', rating: 4.7, reviews: 267, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop', badge: 'Refreshing', description: 'Thick Punjabi-style sweet lassi, made with full-fat dahi' },
        { id: 1307, name: 'Chenna / Fresh Cheese 250g', price: '₹80', originalPrice: '₹100', rating: 4.4, reviews: 98, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop', badge: null, description: 'Soft, moist chenna ideal for sweets like rasgulla & sandesh' },
        { id: 1308, name: 'Cheese Blocks Assorted 200g', price: '₹180', originalPrice: '₹220', rating: 4.6, reviews: 145, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop', badge: 'New', description: 'Farm-made aged cheese, cheddar-style, mild flavor' },
    ],
};

export const categoryMeta: Record<string, { title: string; icon: string; description: string; bannerColor: string }> = {
    'agriculture-drone': { title: 'Agriculture Drones', icon: 'flight', description: 'Advanced spraying & monitoring drones for precision farming. Increase efficiency and reduce chemical usage.', bannerColor: 'from-blue-600 to-blue-800' },
    'seeds': { title: 'Seeds', icon: '\u{1F331}', description: 'High-quality certified seeds for all seasons. From hybrid vegetables to premium grain varieties.', bannerColor: 'from-amber-500 to-amber-700' },
    'garden-products': { title: 'Garden Products', icon: '\u{1F9F4}', description: 'Organic pesticides, growth media, sprayers, and everything for a healthy garden & farm.', bannerColor: 'from-purple-600 to-purple-800' },
    'crop-special-kit': { title: 'Crop Special Kit Products', icon: '\u{1F4E6}', description: 'Complete crop care kits with seeds, fertilizers, and pest management \u2014 everything in one box.', bannerColor: 'from-green-600 to-green-800' },
    'agri-inputs': { title: 'Agri Inputs', icon: '\u{1F6CD}\uFE0F', description: 'Essential farming inputs \u2014 fertilizers, pesticides, herbicides, and micronutrients at best prices.', bannerColor: 'from-orange-500 to-orange-700' },
    'agriculture-tools': { title: 'Agriculture Tools', icon: '\u{1F527}', description: 'Hand tools, sprayers, irrigation equipment, and planting accessories for every farmer.', bannerColor: 'from-slate-600 to-slate-800' },
    'cold-press-oil': { title: 'Cold Press Oil', icon: 'water_drop', description: 'Pure wood-pressed and cold-pressed oils \u2014 groundnut, sesame, coconut, mustard & more. Chemical-free, farm-fresh.', bannerColor: 'from-yellow-600 to-yellow-800' },
    'solar-dry-products': { title: 'Solar Dry Products', icon: 'sunny', description: 'Sun-dried and solar-dehydrated fruits, vegetables & herbs. Natural preservation, intense flavor.', bannerColor: 'from-amber-400 to-orange-600' },
    'organic-manure': { title: 'Organic Manure', icon: 'compost', description: 'Natural fertilizers \u2014 vermicompost, neem cake, bone meal, panchagavya & jeevamrutha for healthy soil.', bannerColor: 'from-lime-600 to-lime-800' },
    'millets-grains': { title: 'Millets & Grains', icon: 'grain', description: 'Farm-fresh millets and traditional grains \u2014 ragi, foxtail, bajra, jowar & more. Nutrient-dense superfoods.', bannerColor: 'from-emerald-600 to-emerald-800' },
    'honey-products': { title: 'Honey & Bee Products', icon: 'hive', description: 'Raw forest honey, bee pollen, beeswax & beekeeping kits. Unprocessed, straight from the hive.', bannerColor: 'from-amber-500 to-amber-700' },
    'spices-herbs': { title: 'Spices & Herbs', icon: 'spa', description: 'Farm-direct Indian spices & medicinal herbs. Turmeric, pepper, cardamom, moringa & more \u2014 pure & aromatic.', bannerColor: 'from-rose-600 to-rose-800' },
    'dairy-products': { title: 'Dairy Products', icon: '🥛', description: 'Fresh farm dairy — milk, ghee, paneer, curd, butter & more. Sourced daily from local dairy farms near you.', bannerColor: 'from-sky-500 to-sky-700' },
};

// ── Featured Brands config ───────────────────────────────────────────────────
// Add a new entry here to show an animated featured-brand banner in a category.
// Multiple brands per category are supported (rendered as stacked banners).

export interface FeaturedBrandSlide {
    headline: string;
    sub: string;
    emoji: string;
    color: string; // hex accent colour for the slide circle
}

export interface FeaturedBrand {
    id: string;                 // unique slug, used in the brand page route
    name: string;               // display name
    logoText: string[];         // split around the icon, e.g. ['Ral', 'S']
    logoIcon: string;           // emoji icon rendered between logoText parts
    tagline: string;
    brandPagePath: string;      // absolute Next.js route to the brand store page
    heroBg: string;             // CSS gradient string for the banner card
    discountLabel: string;      // e.g. '15% OFF'
    discountSub: string;        // e.g. 'Flat Discount'
    rating: string;
    productCount: number;
    slides: FeaturedBrandSlide[];
}

export const featuredBrands: Record<string, FeaturedBrand[]> = {
    // ── Solar Dry Products ───────────────────────────────────────────────────
    'solar-dry-products': [
        {
            id: 'ralos',
            name: 'RaloS',
            logoText: ['Ral', 'S'],
            logoIcon: '☀️',
            tagline: '100% Natural · No Chemicals · Sun-Dried Goodness',
            brandPagePath: '/home/shop/solar-dry-products/ralos',
            heroBg: 'linear-gradient(135deg, #0f1f13 0%, #132a17 30%, #1a3620 60%, #1e4028 100%)',
            discountLabel: '15% OFF',
            discountSub: 'Flat Discount',
            rating: '4.8',
            productCount: 19,
            slides: [
                { headline: 'Moringa Powder', sub: 'Rich in Vitamins A, C & Iron', emoji: '🌿', color: '#22863a' },
                { headline: 'Amla Powder', sub: "Nature's Vitamin C Powerhouse", emoji: '🫐', color: '#7c3d8e' },
                { headline: 'Herbal Tea – Vedic Kada', sub: 'Ashwagandha · Shatavari · Yashtimadhu', emoji: '🍵', color: '#b45309' },
            ],
        },
        // Add more featured brands for solar-dry-products here in future:
        // { id: 'brand2', name: 'Brand Two', ... },
    ],

    // ── Example: add featured brands for other categories here ──────────────
    // 'cold-press-oil': [
    //   { id: 'woodpress', name: 'WoodPress', ... },
    // ],
};
