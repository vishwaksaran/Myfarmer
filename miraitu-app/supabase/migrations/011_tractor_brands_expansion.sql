-- Migration: tractor_brands + expand machinery_models + comparisons + banners
-- Comprehensive tractor marketplace data layer

-- ============================================================
-- 1. tractor_brands — Master brand catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tractor_brands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    logo_url text,
    description text,
    founded_year integer,
    country text DEFAULT 'India',
    website_url text,
    tagline text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 100,
    tier integer DEFAULT 2, -- 1=major, 2=popular, 3=niche
    series jsonb DEFAULT '[]',
    key_highlights jsonb DEFAULT '{}',
    hp_range_min integer,
    hp_range_max integer,
    price_range_min integer, -- in INR
    price_range_max integer,
    total_models integer DEFAULT 0,
    brand_color text, -- hex color for UI theming
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.tractor_brands (slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.tractor_brands (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_tier ON public.tractor_brands (tier, display_order);

ALTER TABLE public.tractor_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active tractor_brands"
    ON public.tractor_brands FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role manages tractor_brands"
    ON public.tractor_brands FOR ALL
    USING (auth.role() = 'service_role');

CREATE TRIGGER trigger_tractor_brands_updated
    BEFORE UPDATE ON public.tractor_brands
    FOR EACH ROW EXECUTE FUNCTION update_machinery_timestamp();

-- ============================================================
-- 2. Expand machinery_models with new columns
-- ============================================================
ALTER TABLE public.machinery_models
    ADD COLUMN IF NOT EXISTS slug text,
    ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.tractor_brands(id),
    ADD COLUMN IF NOT EXISTS series text,
    ADD COLUMN IF NOT EXISTS drive_type text DEFAULT '2WD',
    ADD COLUMN IF NOT EXISTS category_type text DEFAULT 'new', -- new, mini, 4wd, electric
    ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_upcoming boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS launch_year integer,
    ADD COLUMN IF NOT EXISTS cylinders integer,
    ADD COLUMN IF NOT EXISTS engine_cc integer,
    ADD COLUMN IF NOT EXISTS description text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_machinery_models_slug ON public.machinery_models (slug) WHERE slug IS NOT NULL;

-- ============================================================
-- 3. tractor_comparisons — pre-made comparison pairs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tractor_comparisons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    model_a_id uuid NOT NULL REFERENCES public.machinery_models(id) ON DELETE CASCADE,
    model_b_id uuid NOT NULL REFERENCES public.machinery_models(id) ON DELETE CASCADE,
    slug text NOT NULL UNIQUE,
    is_popular boolean DEFAULT true,
    display_order integer DEFAULT 100,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT different_models CHECK (model_a_id != model_b_id)
);

CREATE INDEX IF NOT EXISTS idx_comparisons_popular ON public.tractor_comparisons (is_popular, display_order);

ALTER TABLE public.tractor_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tractor_comparisons"
    ON public.tractor_comparisons FOR SELECT
    USING (true);

CREATE POLICY "Service role manages tractor_comparisons"
    ON public.tractor_comparisons FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- 4. promo_banners — promotional banners
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promo_banners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    cta_text text,
    cta_link text,
    image_url text,
    placement text NOT NULL DEFAULT 'tractor-hub', -- tractor-hub, brand-page, compare-page, detail-page
    display_order integer DEFAULT 100,
    is_active boolean DEFAULT true,
    bg_color text DEFAULT '#16a34a',
    text_color text DEFAULT '#ffffff',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active promo_banners"
    ON public.promo_banners FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role manages promo_banners"
    ON public.promo_banners FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- 5. SEED: Tractor Brands (Tier 1 — 10 major brands)
-- ============================================================

INSERT INTO public.tractor_brands (name, slug, logo_url, description, founded_year, country, tagline, tier, display_order, series, hp_range_min, hp_range_max, price_range_min, price_range_max, total_models, brand_color) VALUES
('Mahindra', 'mahindra', '/images/brands/tractors/mahindra.svg',
 'India''s No. 1 tractor brand and the world''s largest manufacturer of tractors by volume. Known for best-in-class power, mileage, and technology with 6-year warranty.',
 1945, 'India', 'Tough Hardum', 1, 1,
 '["Arjun", "Jivo", "Novo", "OJA", "SP Plus", "XP Plus", "Yuvo", "Yuvo Tech+", "Yuvraj"]'::jsonb,
 15, 74, 310000, 1484000, 60, '#cc0000'),

('Swaraj', 'swaraj', '/images/brands/tractors/swaraj.svg',
 'Part of the Mahindra Group, Swaraj offers rugged, fuel-efficient tractors trusted by millions of Indian farmers.',
 1965, 'India', 'Mera Swaraj', 1, 2,
 '["Target", "FE", "XT", "XM Orchard", "700 Series", "800 Series"]'::jsonb,
 15, 65, 265000, 940000, 30, '#e6001f'),

('Sonalika', 'sonalika', '/images/brands/tractors/sonalika.svg',
 'Leading agri-evolution brand offering versatile tractors for all farming conditions from 20 to 120 HP.',
 1969, 'India', 'Leading Agri Evolution', 1, 3,
 '["Sikander", "DI", "Tiger", "Worldtrac", "GT", "Maxx"]'::jsonb,
 20, 120, 290000, 1400000, 50, '#1a5276'),

('John Deere', 'john-deere', '/images/brands/tractors/john-deere.svg',
 'Global agriculture technology leader with premium tractors known for reliability and resale value.',
 1837, 'USA', 'Nothing Runs Like a Deere', 1, 4,
 '["E Series", "D Series", "5000 Series"]'::jsonb,
 35, 120, 550000, 2200000, 25, '#367c2b'),

('Massey Ferguson', 'massey-ferguson', '/images/brands/tractors/massey-ferguson.svg',
 'Iconic global brand known for efficient, simple and dependable tractors. Popular choice for Indian farmers.',
 1953, 'UK', 'Born to Farm', 1, 5,
 '["1035", "7235", "9500", "241", "Puddler"]'::jsonb,
 24, 75, 320000, 1200000, 20, '#cc0000'),

('New Holland', 'new-holland', '/images/brands/tractors/new-holland.svg',
 'Premium agriculture brand offering advanced tractors with superior fuel efficiency and comfort.',
 1895, 'USA', 'Clean Energy Leader', 1, 6,
 '["Excel", "Simba", "3600", "Workmaster"]'::jsonb,
 24, 75, 380000, 1300000, 20, '#003da5'),

('Eicher', 'eicher', '/images/brands/tractors/eicher.svg',
 'Trusted Indian brand known for durable, fuel-efficient tractors ideal for small to medium farms.',
 1959, 'India', 'Sabse Zyada Bikne Wala', 1, 7,
 '["200 Series", "300 Series", "400 Series", "500 Series", "PRIMA"]'::jsonb,
 18, 50, 300000, 780000, 15, '#b30000'),

('Kubota', 'kubota', '/images/brands/tractors/kubota.svg',
 'Japanese precision engineering for agriculture. Known for compact tractors and advanced technology.',
 1890, 'Japan', 'For Earth, For Life', 1, 8,
 '["MU", "L", "NEOstar", "B Series"]'::jsonb,
 21, 60, 410000, 1300000, 15, '#f28c00'),

('Farmtrac', 'farmtrac', '/images/brands/tractors/farmtrac.svg',
 'Part of Escorts Kubota, Farmtrac offers a wide range of reliable and affordable tractors.',
 1971, 'India', 'Champion of Farm', 1, 9,
 '["Atom", "Ultramaxx", "Powermaxx", "Champion", "Promaxx"]'::jsonb,
 22, 80, 350000, 1250000, 25, '#d4200c'),

('Powertrac', 'powertrac', '/images/brands/tractors/powertrac.svg',
 'Popular tractor brand offering powerful, affordable tractors for Indian farming conditions.',
 2002, 'India', 'Power Beyond Limits', 1, 10,
 '["Euro", "ALT", "4455"]'::jsonb,
 25, 75, 340000, 1050000, 15, '#002b5c');

-- Tier 2 brands
INSERT INTO public.tractor_brands (name, slug, logo_url, description, founded_year, country, tier, display_order, series, hp_range_min, hp_range_max, price_range_min, price_range_max, total_models, brand_color) VALUES
('TAFE', 'tafe', '/images/brands/tractors/tafe.svg', 'Third largest tractor manufacturer in India with proven performance.', 1960, 'India', 2, 11, '["5900", "7502", "45DI"]'::jsonb, 25, 75, 350000, 1100000, 10, '#1b4f72'),
('Solis', 'solis', '/images/brands/tractors/solis.svg', 'International Tractors brand offering versatile tractors.', 2006, 'India', 2, 12, '["S Series", "Hybrid", "HS Series"]'::jsonb, 20, 90, 300000, 1350000, 15, '#e67e22'),
('Indo Farm', 'indo-farm', '/images/brands/tractors/indo-farm.svg', 'Manufacturer of robust tractors for diverse agri needs.', 1994, 'India', 2, 13, '["1000", "2000", "3000"]'::jsonb, 25, 90, 400000, 1300000, 12, '#2e86c1'),
('Force Motors', 'force', '/images/brands/tractors/force.svg', 'Known for Balwan and Orchard series specialized tractors.', 1958, 'India', 2, 14, '["Balwan", "Orchard", "Sanman", "Ox"]'::jsonb, 25, 50, 350000, 800000, 8, '#2c3e50'),
('VST Shakti', 'vst-shakti', '/images/brands/tractors/vst-shakti.svg', 'Specialist in compact and mini tractors for small farms.', 1967, 'India', 2, 15, '["Shakti", "Fieldtrac", "Viraaj"]'::jsonb, 18, 27, 250000, 550000, 8, '#229954'),
('Captain', 'captain', '/images/brands/tractors/captain.svg', 'Affordable tractors for Indian farmers.', 1999, 'India', 2, 16, '["200", "250", "280", "120 DI"]'::jsonb, 21, 75, 280000, 1050000, 12, '#e74c3c'),
('ACE', 'ace', '/images/brands/tractors/ace.svg', 'Leading crane manufacturer expanding into tractors.', 1995, 'India', 2, 17, '["DI Series"]'::jsonb, 15, 75, 250000, 1000000, 10, '#f39c12'),
('Preet', 'preet', '/images/brands/tractors/preet.svg', 'Punjab-based manufacturer known for heavy-duty tractors.', 1980, 'India', 2, 18, '["2549", "6049", "7549"]'::jsonb, 40, 90, 500000, 1400000, 10, '#8e44ad'),
('Escorts Kubota', 'escorts', '/images/brands/tractors/escorts.svg', 'Parent company of Farmtrac and Powertrac.', 1944, 'India', 2, 19, '[]'::jsonb, 22, 80, 350000, 1250000, 0, '#2980b9'),
('Kartar', 'kartar', '/images/brands/tractors/kartar.svg', 'Known for harvesters and mid-range tractors.', 1975, 'India', 2, 20, '["CRD", "4WD Series"]'::jsonb, 30, 60, 400000, 850000, 6, '#27ae60');

-- Tier 3 brands
INSERT INTO public.tractor_brands (name, slug, logo_url, founded_year, country, tier, display_order, hp_range_min, hp_range_max, brand_color) VALUES
('Same Deutz Fahr', 'same-deutz-fahr', '/images/brands/tractors/same-deutz-fahr.svg', 1927, 'Germany', 3, 21, 40, 80, '#005b96'),
('Trakstar', 'trakstar', '/images/brands/tractors/trakstar.svg', 2015, 'India', 3, 22, 40, 55, '#c0392b'),
('Standard', 'standard', '/images/brands/tractors/standard.svg', 1978, 'India', 3, 23, 30, 50, '#2c3e50'),
('Cooper', 'cooper', '/images/brands/tractors/cooper.svg', 2020, 'India', 3, 24, 35, 55, '#16a085'),
('AutoNxt', 'autonxt', '/images/brands/tractors/autonxt.svg', 2019, 'India', 3, 25, 27, 52, '#2ecc71'),
('HAV', 'hav', '/images/brands/tractors/hav.svg', 2018, 'India', 3, 26, 21, 55, '#3498db'),
('Hindustan', 'hindustan', '/images/brands/tractors/hindustan.svg', 1970, 'India', 3, 27, 30, 50, '#7f8c8d'),
('Cellestial', 'cellestial', '/images/brands/tractors/cellestial.svg', 2018, 'India', 3, 28, 20, 27, '#1abc9c'),
('Montra', 'montra', '/images/brands/tractors/montra.svg', 2021, 'India', 3, 29, 15, 40, '#9b59b6');

-- ============================================================
-- 6. Update existing models with new columns + link to brands
-- ============================================================

-- Generate slugs for existing models
UPDATE public.machinery_models SET slug = lower(replace(replace(brand || '-' || model_name, ' ', '-'), '/', '-')) WHERE slug IS NULL;

-- Link existing models to brands
UPDATE public.machinery_models m
SET brand_id = b.id
FROM public.tractor_brands b
WHERE m.brand = b.name AND m.brand_id IS NULL;

-- Set series and drive_type for existing Mahindra OJA models
UPDATE public.machinery_models SET series = 'OJA', drive_type = '4WD', category_type = 'mini', is_popular = true, launch_year = 2023
WHERE brand = 'Mahindra' AND model_name LIKE 'OJA%';

UPDATE public.machinery_models SET is_popular = true WHERE model_name IN ('Yuvo 575 DI', '855 FE', '5050E', 'Tiger DI 60', '3630 TX Plus', 'MU4501', 'Target 630');

-- ============================================================
-- 7. SEED: Additional tractor models (40+ new models)
-- ============================================================

-- Mahindra XP Plus series
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, engine_cc, description, features) VALUES
('Mahindra', '575 DI XP Plus', 'mahindra-575-di-xp-plus', 'Tractor', 47, '47 HP • 4 Cyl • 2WD • ELS Engine', 695000, 6, 'Diesel', 'XP Plus', '2WD', 'new', true, 2022, 4, 2730,
 'Best-selling Mahindra tractor known for power, fuel efficiency, and low maintenance.',
 '{"torqueNm": 192, "rpm": 1900, "cylinders": 4, "engineCc": 2730, "engineType": "ELS", "clutch": "Dual", "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1600, "steeringType": "Power Steering", "brakes": "Oil Immersed", "weightKg": 1980, "fuelTankL": 52, "frontTyre": "6.00x16", "rearTyre": "13.6x28", "applications": ["Ploughing", "Cultivating", "Haulage", "Trolley"]}'::jsonb),

('Mahindra', '475 DI XP Plus', 'mahindra-475-di-xp-plus', 'Tractor', 42, '42 HP • 4 Cyl • 2WD', 620000, 6, 'Diesel', 'XP Plus', '2WD', 'new', true, 2022, 4, 2434,
 'Affordable and powerful tractor ideal for medium farms.',
 '{"torqueNm": 162, "rpm": 1900, "cylinders": 4, "engineCc": 2434, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1500, "brakes": "Oil Immersed", "applications": ["Ploughing", "Haulage"]}'::jsonb),

('Mahindra', '275 DI XP Plus', 'mahindra-275-di-xp-plus', 'Tractor', 37, '37 HP • 3 Cyl • 2WD', 550000, 6, 'Diesel', 'XP Plus', '2WD', 'new', false, 2022, 3, 2048,
 'Compact power tractor for versatile farming needs.',
 '{"torqueNm": 135, "rpm": 2000, "cylinders": 3, "engineCc": 2048, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1400, "applications": ["Haulage", "Basic Farming"]}'::jsonb);

-- Mahindra Novo series
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, engine_cc, description, features) VALUES
('Mahindra', 'Novo 605 DI V1 4WD', 'mahindra-novo-605-di-v1-4wd', 'Tractor', 55, '55 HP • 4 Cyl • 4WD • CRDI', 1100000, 6, 'Diesel', 'Novo', '4WD', '4wd', true, 2023, 4, 3532,
 'Premium heavy-duty tractor for commercial farming and haulage.',
 '{"torqueNm": 225, "rpm": 2100, "cylinders": 4, "engineCc": 3532, "engineType": "mZIP CRDI", "gears": "12F+3R", "transmission": "Synchromesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 2200, "brakes": "Oil Immersed", "weightKg": 2650, "steeringType": "Power Steering", "applications": ["Heavy Ploughing", "Loader", "Dozer", "Commercial Haulage"]}'::jsonb);

-- Mahindra Yuvo Tech+ series
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Mahindra', 'Yuvo Tech+ 585 DI 4WD', 'mahindra-yuvo-tech-585-di-4wd', 'Tractor', 50, '50 HP • 4 Cyl • 4WD • DigiSense', 950000, 6, 'Diesel', 'Yuvo Tech+', '4WD', '4wd', true, 2024, 4,
 'Next-gen tractor with DigiSense 4G technology for smart farming.',
 '{"torqueNm": 210, "rpm": 2000, "cylinders": 4, "gears": "12F+3R", "transmission": "Synchromesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 1800, "steeringType": "Power Steering", "brakes": "Oil Immersed", "applications": ["Rotavator", "Cultivator", "Plough", "Trolley"]}'::jsonb);

-- Mahindra Jivo mini
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Mahindra', 'Jivo 225 DI', 'mahindra-jivo-225-di', 'Tractor', 20, '20 HP • 2 Cyl • 2WD • Compact', 380000, 5, 'Diesel', 'Jivo', '2WD', 'mini', false, 2021, 2,
 'Compact mini tractor ideal for orchards and vineyards.',
 '{"torqueNm": 60, "rpm": 2700, "cylinders": 2, "gears": "6F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 700, "applications": ["Orchard", "Vineyard", "Spraying", "Intercultural"]}'::jsonb);

-- Mahindra Yuvraj
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Mahindra', 'Yuvraj 215 NXT', 'mahindra-yuvraj-215-nxt', 'Tractor', 15, '15 HP • 1 Cyl • 2WD • Mini', 310000, 5, 'Diesel', 'Yuvraj', '2WD', 'mini', false, 2020, 1,
 'The cheapest Mahindra mini tractor for basic farming and orchard operations.',
 '{"torqueNm": 42, "rpm": 3000, "cylinders": 1, "gears": "6F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 500, "applications": ["Orchard", "Gardening", "Spraying"]}'::jsonb);

-- Swaraj models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Swaraj', '744 FE', 'swaraj-744-fe', 'Tractor', 48, '48 HP • 3 Cyl • 2WD', 720000, 5, 'Diesel', 'FE', '2WD', 'new', true, 2022, 3,
 'One of the best-selling tractors in India known for durability and performance.',
 '{"torqueNm": 185, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1700, "brakes": "Oil Immersed", "steeringType": "Power Steering", "applications": ["General Purpose", "Ploughing", "Haulage"]}'::jsonb),

('Swaraj', '744 XT', 'swaraj-744-xt', 'Tractor', 48, '48 HP • 3 Cyl • 2WD', 750000, 5, 'Diesel', 'XT', '2WD', 'new', true, 2023, 3,
 'Premium variant with enhanced features and comfort.',
 '{"torqueNm": 190, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Partial Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1800, "brakes": "Oil Immersed", "steeringType": "Power Steering", "applications": ["General Purpose", "Ploughing", "Haulage"]}'::jsonb),

('Swaraj', '735 FE', 'swaraj-735-fe', 'Tractor', 40, '40 HP • 3 Cyl • 2WD', 600000, 5, 'Diesel', 'FE', '2WD', 'new', true, 2022, 3,
 'Reliable mid-range tractor for everyday farming.',
 '{"torqueNm": 152, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1500, "applications": ["General Purpose", "Cultivating"]}'::jsonb),

('Swaraj', '735 XT', 'swaraj-735-xt', 'Tractor', 40, '40 HP • 3 Cyl • 2WD', 630000, 5, 'Diesel', 'XT', '2WD', 'new', false, 2023, 3,
 'Enhanced variant of the popular 735 series.',
 '{"torqueNm": 155, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Partial Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1550, "applications": ["General Purpose"]}'::jsonb),

('Swaraj', '724 XM Orchard', 'swaraj-724-xm-orchard', 'Tractor', 28, '28 HP • 3 Cyl • 2WD • Compact', 480000, 5, 'Diesel', 'XM Orchard', '2WD', 'mini', false, 2022, 3,
 'Narrow-track orchard specialist tractor.',
 '{"torqueNm": 100, "rpm": 2200, "cylinders": 3, "gears": "8F+2R", "transmission": "Synchromesh", "ptoSpeed": "540", "hydraulicsCapacity": 900, "applications": ["Orchard", "Vineyard", "Spraying"]}'::jsonb),

('Swaraj', '855 FE 4WD', 'swaraj-855-fe-4wd', 'Tractor', 52, '52 HP • 3 Cyl • 4WD', 970000, 5, 'Diesel', 'FE', '4WD', '4wd', true, 2023, 3,
 'Powerful 4WD variant for heavy-duty farming and traction.',
 '{"torqueNm": 200, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1800, "brakes": "Oil Immersed", "applications": ["Heavy Ploughing", "Puddling", "Haulage"]}'::jsonb);

-- Sonalika models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Sonalika', 'DI 35', 'sonalika-di-35', 'Tractor', 35, '35 HP • 3 Cyl • 2WD', 480000, 5, 'Diesel', 'DI', '2WD', 'new', true, 2022, 3,
 'Affordable and versatile tractor for small to medium farms.',
 '{"torqueNm": 130, "rpm": 2000, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1200, "applications": ["Cultivating", "Ploughing", "Trolley"]}'::jsonb),

('Sonalika', 'Sikander RX 50 DLX', 'sonalika-sikander-rx-50-dlx', 'Tractor', 50, '50 HP • 3 Cyl • 2WD', 730000, 5, 'Diesel', 'Sikander', '2WD', 'new', true, 2023, 3,
 'Feature-rich mid-range tractor with modern styling.',
 '{"torqueNm": 195, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1800, "brakes": "Oil Immersed", "applications": ["General Purpose", "Haulage"]}'::jsonb),

('Sonalika', 'Sikander RX 50 DLX 4WD', 'sonalika-sikander-rx-50-dlx-4wd', 'Tractor', 52, '52 HP • 3 Cyl • 4WD', 820000, 5, 'Diesel', 'Sikander', '4WD', '4wd', true, 2023, 3,
 '4WD variant with superior traction for wet and hilly terrain.',
 '{"torqueNm": 200, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1850, "brakes": "Oil Immersed", "applications": ["Puddling", "Heavy Ploughing", "Traction"]}'::jsonb),

('Sonalika', 'Worldtrac 60', 'sonalika-worldtrac-60', 'Tractor', 60, '60 HP • 4 Cyl • 2WD', 900000, 5, 'Diesel', 'Worldtrac', '2WD', 'new', false, 2022, 4,
 'Premium heavy-duty tractor for commercial applications.',
 '{"torqueNm": 230, "rpm": 2100, "cylinders": 4, "gears": "12F+3R", "transmission": "Synchromesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 2100, "applications": ["Loader", "Commercial Haulage", "Heavy Implements"]}'::jsonb);

-- John Deere models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('John Deere', '5050 D', 'john-deere-5050-d', 'Tractor', 50, '50 HP • 3 Cyl • 2WD', 830000, 5, 'Diesel', 'D Series', '2WD', 'new', true, 2022, 3,
 'Best-selling John Deere model known for durability and resale value.',
 '{"torqueNm": 195, "rpm": 1900, "cylinders": 3, "gears": "8F+4R", "transmission": "Collar Shift", "ptoSpeed": "540", "hydraulicsCapacity": 1800, "brakes": "Oil Immersed", "steeringType": "Power Steering", "applications": ["General Purpose", "Rotavator", "Plough"]}'::jsonb),

('John Deere', '5310', 'john-deere-5310', 'Tractor', 55, '55 HP • 3 Cyl • 2WD', 890000, 5, 'Diesel', 'D Series', '2WD', 'new', true, 2022, 3,
 'Premium tractor for demanding farming conditions.',
 '{"torqueNm": 220, "rpm": 2100, "cylinders": 3, "gears": "8F+4R", "transmission": "Collar Shift", "ptoSpeed": "540", "hydraulicsCapacity": 2000, "brakes": "Oil Immersed", "applications": ["Heavy Ploughing", "Haulage"]}'::jsonb),

('John Deere', '5405 GearPro', 'john-deere-5405-gearpro', 'Tractor', 63, '63 HP • 3 Cyl • 2WD', 1050000, 5, 'Diesel', 'E Series', '2WD', 'new', false, 2023, 3,
 'High-performance tractor with advanced GearPro transmission.',
 '{"torqueNm": 250, "rpm": 2100, "cylinders": 3, "gears": "12F+4R", "transmission": "Synchromesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 2300, "applications": ["Commercial", "Loader", "Heavy Implements"]}'::jsonb);

-- Massey Ferguson models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Massey Ferguson', '1035 DI Mahashakti', 'massey-ferguson-1035-di-mahashakti', 'Tractor', 40, '40 HP • 3 Cyl • 2WD', 590000, 4, 'Diesel', '1035', '2WD', 'new', true, 2022, 3,
 'One of the most popular tractors in India trusted for generations.',
 '{"torqueNm": 148, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1500, "applications": ["General Purpose", "Ploughing"]}'::jsonb),

('Massey Ferguson', '241 DI', 'massey-ferguson-241-di', 'Tractor', 42, '42 HP • 3 Cyl • 2WD', 620000, 4, 'Diesel', '241', '2WD', 'new', true, 2022, 3,
 'Versatile and fuel-efficient tractor for Indian farms.',
 '{"torqueNm": 155, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1600, "applications": ["Cultivating", "Trolley", "Ploughing"]}'::jsonb),

('Massey Ferguson', '1035 Super Plus', 'massey-ferguson-1035-super-plus', 'Tractor', 40, '40 HP • 3 Cyl • 2WD', 570000, 4, 'Diesel', '1035', '2WD', 'new', false, 2023, 3,
 'Updated model with enhanced features and comfort.',
 '{"torqueNm": 150, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1550, "applications": ["General Purpose"]}'::jsonb);

-- New Holland models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('New Holland', '3630 TX Plus Special Edition', 'new-holland-3630-tx-plus-special-edition', 'Tractor', 55, '55 HP • 3 Cyl • 2WD', 890000, 4, 'Diesel', '3600', '2WD', 'new', true, 2023, 3,
 'Best-selling New Holland model with special edition features.',
 '{"torqueNm": 215, "rpm": 2100, "cylinders": 3, "gears": "8F+2R", "transmission": "Synchromesh", "ptoSpeed": "540", "hydraulicsCapacity": 1900, "brakes": "Oil Immersed", "applications": ["General Purpose", "Haulage"]}'::jsonb),

('New Holland', 'Excel 4710 2WD', 'new-holland-excel-4710-2wd', 'Tractor', 47, '47 HP • 3 Cyl • 2WD', 720000, 4, 'Diesel', 'Excel', '2WD', 'new', false, 2022, 3,
 'Mid-range tractor with excellent fuel efficiency.',
 '{"torqueNm": 180, "rpm": 2000, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1700, "applications": ["Cultivating", "Ploughing"]}'::jsonb),

('New Holland', '3230 NX', 'new-holland-3230-nx', 'Tractor', 42, '42 HP • 3 Cyl • 2WD', 630000, 4, 'Diesel', '3600', '2WD', 'new', false, 2022, 3,
 'Compact and affordable New Holland tractor.',
 '{"torqueNm": 160, "rpm": 2000, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1500, "applications": ["General Purpose"]}'::jsonb);

-- Eicher models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Eicher', '380', 'eicher-380', 'Tractor', 40, '40 HP • 3 Cyl • 2WD', 520000, 4, 'Diesel', '300 Series', '2WD', 'new', true, 2022, 3,
 'Versatile tractor designed for diverse farming tasks. Popular for reliability and low maintenance.',
 '{"torqueNm": 145, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "gearType": "Partial Constant Mesh", "clutch": "Single / Dual", "steeringType": "Mechanical / Power (Optional)", "brakes": "Sealed Dry Disc Brake / Oil Immersed (Optional)", "ptoSpeed": "540", "hydraulicsCapacity": 1650, "applications": ["Ploughing", "Tilling", "Harvesting"]}'::jsonb),

('Eicher', '485', 'eicher-485', 'Tractor', 45, '45 HP • 3 Cyl • 2WD', 600000, 4, 'Diesel', '400 Series', '2WD', 'new', true, 2022, 3,
 'Powerful tractor for medium to large farms.',
 '{"torqueNm": 170, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Partial Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1700, "applications": ["General Purpose", "Haulage"]}'::jsonb),

('Eicher', '557', 'eicher-557', 'Tractor', 50, '50 HP • 4 Cyl • 2WD', 680000, 4, 'Diesel', '500 Series', '2WD', 'new', false, 2022, 4,
 'Heavy-duty Eicher tractor for commercial farming.',
 '{"torqueNm": 195, "rpm": 1900, "cylinders": 4, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1850, "applications": ["Heavy Farm", "Haulage"]}'::jsonb),

('Eicher', '548', 'eicher-548', 'Tractor', 48, '48 HP • 3 Cyl • 2WD', 650000, 4, 'Diesel', '500 Series', '2WD', 'new', false, 2022, 3,
 'Reliable mid-range Eicher tractor.',
 '{"torqueNm": 180, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1750, "applications": ["General Purpose"]}'::jsonb);

-- Kubota models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Kubota', 'MU5502 4WD', 'kubota-mu5502-4wd', 'Tractor', 55, '55 HP • 4 Cyl • 4WD', 1050000, 5, 'Diesel', 'MU', '4WD', '4wd', true, 2023, 4,
 'Premium 4WD tractor with Japanese engineering excellence.',
 '{"torqueNm": 215, "rpm": 2100, "cylinders": 4, "gears": "8F+4R", "transmission": "Synchromesh", "ptoSpeed": "540", "hydraulicsCapacity": 2000, "brakes": "Oil Immersed", "applications": ["Puddling", "Heavy Ploughing", "Rotavator"]}'::jsonb),

('Kubota', 'NEOstar B2741', 'kubota-neostar-b2741', 'Tractor', 27, '27 HP • 3 Cyl • 4WD • Compact', 520000, 5, 'Diesel', 'NEOstar', '4WD', 'mini', false, 2022, 3,
 'Compact utility tractor for small farms and orchards.',
 '{"torqueNm": 85, "rpm": 2500, "cylinders": 3, "gears": "8F+4R", "transmission": "Synchromesh", "ptoSpeed": "540", "hydraulicsCapacity": 800, "applications": ["Orchard", "Vineyard", "Landscaping"]}'::jsonb);

-- Farmtrac models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Farmtrac', '60 Powermaxx', 'farmtrac-60-powermaxx', 'Tractor', 60, '60 HP • 4 Cyl • 2WD', 850000, 4, 'Diesel', 'Powermaxx', '2WD', 'new', true, 2023, 4,
 'Powerful tractor for heavy-duty farming and commercial use.',
 '{"torqueNm": 235, "rpm": 2100, "cylinders": 4, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 2000, "applications": ["Heavy Ploughing", "Loader", "Haulage"]}'::jsonb),

('Farmtrac', '45 Ultramaxx', 'farmtrac-45-ultramaxx', 'Tractor', 45, '45 HP • 3 Cyl • 2WD', 620000, 4, 'Diesel', 'Ultramaxx', '2WD', 'new', true, 2022, 3,
 'Versatile mid-range tractor with excellent mileage.',
 '{"torqueNm": 175, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1600, "applications": ["General Purpose", "Cultivating"]}'::jsonb),

('Farmtrac', '45 Promaxx 4WD', 'farmtrac-45-promaxx-4wd', 'Tractor', 45, '45 HP • 3 Cyl • 4WD', 700000, 4, 'Diesel', 'Promaxx', '4WD', '4wd', false, 2023, 3,
 '4WD variant with excellent grip and traction.',
 '{"torqueNm": 192, "rpm": 2000, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1700, "applications": ["Wet Fields", "Puddling", "Rotavator"]}'::jsonb);

-- Powertrac models
INSERT INTO public.machinery_models (brand, model_name, slug, category, hp, specs, base_price, warranty_years, fuel_type, series, drive_type, category_type, is_popular, launch_year, cylinders, description, features) VALUES
('Powertrac', 'Euro 50', 'powertrac-euro-50', 'Tractor', 50, '50 HP • 3 Cyl • 2WD', 660000, 4, 'Diesel', 'Euro', '2WD', 'new', true, 2022, 3,
 'Powerful and affordable workhorse tractor.',
 '{"torqueNm": 190, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1700, "applications": ["General Purpose", "Haulage"]}'::jsonb),

('Powertrac', '439 RDX', 'powertrac-439-rdx', 'Tractor', 39, '39 HP • 3 Cyl • 2WD', 520000, 4, 'Diesel', 'Euro', '2WD', 'new', false, 2022, 3,
 'Affordable tractor for basic farming needs.',
 '{"torqueNm": 145, "rpm": 1900, "cylinders": 3, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "hydraulicsCapacity": 1400, "applications": ["Cultivating", "Trolley"]}'::jsonb);

-- Link all new models to brand IDs
UPDATE public.machinery_models m
SET brand_id = b.id
FROM public.tractor_brands b
WHERE m.brand = b.name AND m.brand_id IS NULL;

-- ============================================================
-- 8. SEED: Promotional Banners
-- ============================================================

INSERT INTO public.promo_banners (title, subtitle, cta_text, cta_link, placement, display_order, bg_color) VALUES
('Simplify Your Farm Tractor Financing', 'Get instant tractor loan approval with easy EMI options', 'Check Loan Eligibility', '/home/machinery/tractors', 'tractor-hub', 1, '#16a34a'),
('Sell Your Used Tractor', 'Reach thousands of verified buyers near you', 'List Your Tractor', '/home/machinery/tractors/sell', 'tractor-hub', 2, '#2563eb'),
('Get Unbiased Tractor Valuation', 'Know the fair market value of your tractor', 'Try Valuation', '/home/machinery/tractors', 'brand-page', 1, '#dc2626'),
('Compare Before You Buy', 'Side-by-side comparison of any two tractors', 'Compare Now', '/home/machinery/tractors/compare', 'detail-page', 1, '#7c3aed'),
('Get Best Quote', 'Contact authorized dealers near you for best prices', 'Get Quote', '/home/machinery/tractors', 'tractor-hub', 3, '#ea580c');

-- ============================================================
-- 9. SEED: Pre-made comparisons
-- ============================================================

-- We need to insert by looking up model IDs. Using a DO block for safety.
DO $$
DECLARE
    v_mahindra_575 uuid;
    v_swaraj_855 uuid;
    v_swaraj_744fe uuid;
    v_swaraj_744xt uuid;
    v_eicher_380 uuid;
    v_mf_1035 uuid;
    v_jd_5050 uuid;
    v_sonalika_50 uuid;
    v_nh_3630 uuid;
    v_mahindra_475 uuid;
    v_farmtrac_60 uuid;
    v_powertrac_50 uuid;
    v_mf_241 uuid;
    v_swaraj_735_fe uuid;
    v_eicher_485 uuid;
BEGIN
    SELECT id INTO v_mahindra_575 FROM public.machinery_models WHERE slug = 'mahindra-575-di-xp-plus' LIMIT 1;
    SELECT id INTO v_swaraj_855 FROM public.machinery_models WHERE slug = 'swaraj-855-fe-4wd' LIMIT 1;
    SELECT id INTO v_swaraj_744fe FROM public.machinery_models WHERE slug = 'swaraj-744-fe' LIMIT 1;
    SELECT id INTO v_swaraj_744xt FROM public.machinery_models WHERE slug = 'swaraj-744-xt' LIMIT 1;
    SELECT id INTO v_eicher_380 FROM public.machinery_models WHERE slug = 'eicher-380' LIMIT 1;
    SELECT id INTO v_mf_1035 FROM public.machinery_models WHERE slug = 'massey-ferguson-1035-di-mahashakti' LIMIT 1;
    SELECT id INTO v_jd_5050 FROM public.machinery_models WHERE slug = 'john-deere-5050-d' LIMIT 1;
    SELECT id INTO v_sonalika_50 FROM public.machinery_models WHERE slug = 'sonalika-sikander-rx-50-dlx' LIMIT 1;
    SELECT id INTO v_nh_3630 FROM public.machinery_models WHERE slug = 'new-holland-3630-tx-plus-special-edition' LIMIT 1;
    SELECT id INTO v_mahindra_475 FROM public.machinery_models WHERE slug = 'mahindra-475-di-xp-plus' LIMIT 1;
    SELECT id INTO v_farmtrac_60 FROM public.machinery_models WHERE slug = 'farmtrac-60-powermaxx' LIMIT 1;
    SELECT id INTO v_powertrac_50 FROM public.machinery_models WHERE slug = 'powertrac-euro-50' LIMIT 1;
    SELECT id INTO v_mf_241 FROM public.machinery_models WHERE slug = 'massey-ferguson-241-di' LIMIT 1;
    SELECT id INTO v_swaraj_735_fe FROM public.machinery_models WHERE slug = 'swaraj-735-fe' LIMIT 1;
    SELECT id INTO v_eicher_485 FROM public.machinery_models WHERE slug = 'eicher-485' LIMIT 1;

    -- Insert comparisons only if both models exist
    IF v_swaraj_744xt IS NOT NULL AND v_swaraj_744fe IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_swaraj_744xt, v_swaraj_744fe, 'swaraj-744-xt-vs-swaraj-744-fe', 1);
    END IF;
    IF v_mahindra_575 IS NOT NULL AND v_swaraj_855 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_mahindra_575, v_swaraj_855, 'mahindra-575-di-xp-plus-vs-swaraj-855-fe-4wd', 2);
    END IF;
    IF v_mf_1035 IS NOT NULL AND v_swaraj_735_fe IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_mf_1035, v_swaraj_735_fe, 'massey-ferguson-1035-vs-swaraj-735-fe', 3);
    END IF;
    IF v_eicher_380 IS NOT NULL AND v_mf_1035 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_eicher_380, v_mf_1035, 'eicher-380-vs-massey-ferguson-1035', 4);
    END IF;
    IF v_jd_5050 IS NOT NULL AND v_sonalika_50 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_jd_5050, v_sonalika_50, 'john-deere-5050-d-vs-sonalika-sikander-rx-50', 5);
    END IF;
    IF v_mahindra_475 IS NOT NULL AND v_mf_241 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_mahindra_475, v_mf_241, 'mahindra-475-di-xp-plus-vs-massey-ferguson-241-di', 6);
    END IF;
    IF v_nh_3630 IS NOT NULL AND v_farmtrac_60 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_nh_3630, v_farmtrac_60, 'new-holland-3630-vs-farmtrac-60-powermaxx', 7);
    END IF;
    IF v_eicher_485 IS NOT NULL AND v_powertrac_50 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_eicher_485, v_powertrac_50, 'eicher-485-vs-powertrac-euro-50', 8);
    END IF;
    IF v_mahindra_575 IS NOT NULL AND v_jd_5050 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_mahindra_575, v_jd_5050, 'mahindra-575-di-xp-plus-vs-john-deere-5050-d', 9);
    END IF;
    IF v_swaraj_744fe IS NOT NULL AND v_eicher_485 IS NOT NULL THEN
        INSERT INTO public.tractor_comparisons (model_a_id, model_b_id, slug, display_order) VALUES (v_swaraj_744fe, v_eicher_485, 'swaraj-744-fe-vs-eicher-485', 10);
    END IF;
END $$;
