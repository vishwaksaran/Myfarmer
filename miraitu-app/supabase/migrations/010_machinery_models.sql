-- Migration: machinery_models + machinery_state_prices
-- Tables for tractor/machinery catalog with state-wise pricing

-- ============================================================
-- 1. machinery_models — master catalog of all machinery
-- ============================================================
CREATE TABLE IF NOT EXISTS public.machinery_models (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand text NOT NULL,
    model_name text NOT NULL,
    category text NOT NULL DEFAULT 'Tractor',
    hp integer,
    specs text,
    base_price integer,          -- ex-showroom base price in INR
    warranty_years integer,
    fuel_type text DEFAULT 'Diesel',
    image_url text,
    features jsonb DEFAULT '{}', -- detailed specs: torque, gears, hydraulics, techPacks, applications, etc.
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_machinery_models_brand ON public.machinery_models (brand);
CREATE INDEX IF NOT EXISTS idx_machinery_models_category ON public.machinery_models (category);
CREATE INDEX IF NOT EXISTS idx_machinery_models_active ON public.machinery_models (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.machinery_models ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read active machinery_models"
    ON public.machinery_models FOR SELECT
    USING (is_active = true);

-- Service role can manage
CREATE POLICY "Service role manages machinery_models"
    ON public.machinery_models FOR ALL
    USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_machinery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_machinery_models_updated
    BEFORE UPDATE ON public.machinery_models
    FOR EACH ROW EXECUTE FUNCTION update_machinery_timestamp();


-- ============================================================
-- 2. machinery_state_prices — state-wise on-road prices
-- ============================================================
CREATE TABLE IF NOT EXISTS public.machinery_state_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id uuid NOT NULL REFERENCES public.machinery_models(id) ON DELETE CASCADE,
    state text NOT NULL,
    ex_showroom_price integer,
    on_road_price integer,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(model_id, state)
);

CREATE INDEX IF NOT EXISTS idx_state_prices_model ON public.machinery_state_prices (model_id);
CREATE INDEX IF NOT EXISTS idx_state_prices_state ON public.machinery_state_prices (state);

-- RLS
ALTER TABLE public.machinery_state_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read machinery_state_prices"
    ON public.machinery_state_prices FOR SELECT
    USING (true);

CREATE POLICY "Service role manages machinery_state_prices"
    ON public.machinery_state_prices FOR ALL
    USING (auth.role() = 'service_role');

CREATE TRIGGER trigger_state_prices_updated
    BEFORE UPDATE ON public.machinery_state_prices
    FOR EACH ROW EXECUTE FUNCTION update_machinery_timestamp();


-- ============================================================
-- 3. Seed data — Mahindra OJA series + Swaraj Target 630
-- ============================================================

-- Mahindra OJA 2121
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 2121', 'Tractor', 21,
    '21 HP • 3 Cylinder • 8F+4R Gears • ADDC Hydraulics',
    350000, 5, 'Diesel',
    '{"torqueNm": 73.5, "rpm": 2400, "cylinders": 3, "gears": "8F+4R / 12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 950, "draftSensing": "ADDC", "groundClearanceMm": 303, "wheelbaseMm": 1560, "turningRadiusM": 2.0, "techPacks": ["PROJA"], "variants": ["PROJA", "Narrow Track"], "applications": ["Sugarcane", "Cotton", "Orchard", "Banana"]}'::jsonb
);

-- Mahindra OJA 2124
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 2124', 'Tractor', 24,
    '24 HP • 3 Cylinder • 12F+12R Gears • ADDC Hydraulics',
    390000, 5, 'Diesel',
    '{"torqueNm": 83.3, "rpm": 2400, "cylinders": 3, "gears": "8F+4R / 12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 950, "draftSensing": "ADDC", "groundClearanceMm": 330, "wheelbaseMm": 1560, "turningRadiusM": 2.1, "techPacks": ["ROBOJA", "PROJA", "MYOJA"], "variants": ["PROJA", "ROBOJA", "Narrow Track"], "applications": ["Sugarcane", "Cotton", "Orchard", "Banana"]}'::jsonb
);

-- Mahindra OJA 2127
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 2127', 'Tractor', 27,
    '27 HP • 3 Cylinder • 12F+12R Gears • EDDC Hydraulics',
    420000, 5, 'Diesel',
    '{"torqueNm": 83.1, "rpm": 2700, "cylinders": 3, "gears": "12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 950, "draftSensing": "EDDC", "groundClearanceMm": 330, "wheelbaseMm": 1560, "turningRadiusM": 2.1, "techPacks": ["ROBOJA", "PROJA", "MYOJA"], "variants": ["ROBOJA", "PROJA"], "applications": ["Sugarcane", "Cotton", "Orchard", "Banana"]}'::jsonb
);

-- Mahindra OJA 2130
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 2130', 'Tractor', 30,
    '30 HP • 3 Cylinder • 12F+12R Gears • EDDC Hydraulics',
    480000, 5, 'Diesel',
    '{"torqueNm": 83.7, "rpm": 3000, "cylinders": 3, "gears": "8F+4R / 8F+8R / 12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "hydraulicsCapacity": 950, "draftSensing": "EDDC", "groundClearanceMm": 330, "wheelbaseMm": 1560, "turningRadiusM": 2.1, "techPacks": ["ROBOJA", "PROJA", "MYOJA"], "variants": ["ROBOJA", "PROJA", "Narrow Track"], "applications": ["Sugarcane", "Cotton", "Orchard", "Banana"]}'::jsonb
);

-- Mahindra OJA 3132
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 3132', 'Tractor', 32,
    '32 HP • 3 Cylinder • 8F+8R Gears • Wet PTO • ADDC',
    550000, 5, 'Diesel',
    '{"torqueNm": 107.5, "rpm": 2500, "cylinders": 3, "gears": "8F+8R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "ptoType": "Wet PTO", "hydraulicsCapacity": 950, "draftSensing": "ADDC", "groundClearanceMm": 350, "wheelbaseMm": 1660, "turningRadiusM": 2.5, "weightKg": 1335, "techPacks": ["PROJA", "ROBOJA"], "variants": ["PROJA", "ROBOJA"], "applications": ["Rotary Tiller", "Plough", "Cultivator", "Mulching", "Trolley"]}'::jsonb
);

-- Mahindra OJA 3136
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 3136', 'Tractor', 36,
    '36 HP • 3 Cylinder • 12F+12R Gears • Wet PTO • EDDC',
    620000, 5, 'Diesel',
    '{"torqueNm": 121, "rpm": 2500, "cylinders": 3, "gears": "12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "ptoType": "Wet PTO", "hydraulicsCapacity": 950, "draftSensing": "EDDC", "groundClearanceMm": 370, "wheelbaseMm": 1660, "turningRadiusM": 2.5, "weightKg": 1365, "techPacks": ["ROBOJA", "PROJA", "MYOJA"], "variants": ["PROJA", "ROBOJA"], "applications": ["Rotary Tiller", "Plough", "Cultivator", "Mulching", "Sprayer", "Trolley"]}'::jsonb
);

-- Mahindra OJA 3140
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'OJA 3140', 'Tractor', 40,
    '40 HP • 3 Cylinder • 12F+12R Gears • Wet PTO • EDDC',
    680000, 5, 'Diesel',
    '{"torqueNm": 133, "rpm": 2500, "cylinders": 3, "gears": "12F+12R", "shiftType": "Synchro Shuttle", "transmission": "Constant Mesh", "ptoSpeed": "540/540E", "ptoType": "Wet PTO", "hydraulicsCapacity": 950, "draftSensing": "EDDC", "groundClearanceMm": 370, "wheelbaseMm": 1660, "turningRadiusM": 2.5, "weightKg": 1365, "techPacks": ["ROBOJA", "PROJA", "MYOJA"], "variants": ["ROBOJA", "PROJA"], "applications": ["Rotary Tiller", "Plough", "Cultivator", "Mulching", "Sprayer", "Paddyvator", "Trolley"]}'::jsonb
);

-- Mahindra Yuvo 575 DI (existing model, now in DB)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Mahindra', 'Yuvo 575 DI', 'Tractor', 45,
    '45 HP • 4 Cylinder • 4WD • Power Steering',
    720000, 6, 'Diesel',
    '{"cylinders": 4, "gears": "8F+2R", "transmission": "Constant Mesh", "ptoSpeed": "540", "applications": ["General Purpose", "Plough", "Trolley", "Cultivator"]}'::jsonb
);

-- Swaraj Target 630
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Swaraj', 'Target 630', 'Tractor', 29,
    '29 HP • Yanmar DI • 9F+3R • Oil Immersed Brakes • ADDC',
    500000, 5, 'Diesel',
    '{"torqueNm": 87, "rpm": 2800, "cylinders": 3, "displacementCc": 1331, "engineType": "Yanmar / Liquid Cooled, Direct Injection", "clutch": "Single Dry (Main) + Independent Wet (PTO)", "gears": "9F+3R", "transmission": "Mechanical Synchromesh", "brakes": "Oil Immersed", "ptoSpeed": "540/540E", "ptoPowerKw": 17.9, "hydraulicsControl": "ADDC", "hitchCategory": "Category 1", "maxLiftKgf": 980, "hitchFlowLpm": 22, "axleType": "4WD Portal", "steeringType": "Balanced Power Steering", "wheelbaseMm": 1555, "weightKg": 975, "turningRadiusM": 2.1, "fuelTankL": 27, "frontTyre": "180/85D12", "rearTyre": "8.30x20", "groundClearanceMm": 303, "applications": ["Grapes", "Pomegranate", "Sugarcane", "Cotton"], "usps": ["Narrowest FlexiTrack (3ft width)", "MaxLift 980kgf", "Powerful DI Engine 87Nm"]}'::jsonb
);

-- Swaraj 855 FE (existing model, now in DB)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Swaraj', '855 FE', 'Tractor', 52,
    '52 HP • Oil Immersed Brakes • 4WD',
    910000, 5, 'Diesel',
    '{"gears": "8F+2R", "applications": ["General Purpose"]}'::jsonb
);

-- John Deere 5050E (existing)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('John Deere', '5050E', 'Tractor', 50,
    '50 HP • Power Steering • Dual Clutch',
    855000, 5, 'Diesel',
    '{"applications": ["General Purpose"]}'::jsonb
);

-- Sonalika Tiger DI 60 (existing)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Sonalika', 'Tiger DI 60', 'Tractor', 60,
    '60 HP • Multi Speed PTO • Hydraulic',
    910000, 5, 'Diesel',
    '{"applications": ["General Purpose"]}'::jsonb
);

-- New Holland 3630 TX Plus (existing)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('New Holland', '3630 TX Plus', 'Tractor', 55,
    '55 HP • Synchromesh Gearbox • Air Cleaner',
    875000, 4, 'Diesel',
    '{"applications": ["General Purpose"]}'::jsonb
);

-- Kubota MU4501 (existing)
INSERT INTO public.machinery_models (brand, model_name, category, hp, specs, base_price, warranty_years, fuel_type, features)
VALUES ('Kubota', 'MU4501', 'Tractor', 45,
    '45 HP • ISM Technology • 8F+2R Gears',
    785000, 5, 'Diesel',
    '{"gears": "8F+2R", "applications": ["General Purpose"]}'::jsonb
);
