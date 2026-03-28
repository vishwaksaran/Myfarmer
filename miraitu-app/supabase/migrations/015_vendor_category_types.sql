-- ============================================================================
-- 015: Add category_type to shop_categories + Seed all platform categories
-- ============================================================================
-- Allows vendors to be assigned to multiple category types:
--   'shop'             → Products (Solar Dry, Seeds, Oils, etc.)
--   'machinery'        → Equipment (Tractors, JCB, Drones, etc.)
--   'service_provider' → Services (Drone Spray, Harvester, Farm Labours, etc.)
-- ============================================================================

-- 1. Add category_type column
ALTER TABLE shop_categories
ADD COLUMN IF NOT EXISTS category_type TEXT NOT NULL DEFAULT 'shop'
CHECK (category_type IN ('shop', 'machinery', 'service_provider'));

-- 2. Add icon column if missing (material symbols icon name)
ALTER TABLE shop_categories
ADD COLUMN IF NOT EXISTS icon TEXT;

-- 3. Seed Shop categories (matching live site)
INSERT INTO shop_categories (name, slug, icon, category_type) VALUES
  ('Agriculture Drone',       'agriculture-drone',   'flight',             'shop'),
  ('Seeds',                   'seeds',               'spa',                'shop'),
  ('Garden Products',         'garden-products',     'yard',               'shop'),
  ('Crop Special Kit',        'crop-special-kit',    'inventory_2',        'shop'),
  ('Agri Inputs',             'agri-inputs',         'science',            'shop'),
  ('Agriculture Tools',       'agriculture-tools',   'construction',       'shop'),
  ('Cold Press Oil',          'cold-press-oil',      'water_drop',         'shop'),
  ('Solar Dry Products',      'solar-dry-products',  'sunny',              'shop'),
  ('Organic Manure',          'organic-manure',      'compost',            'shop'),
  ('Millets & Grains',        'millets-grains',      'grain',              'shop'),
  ('Honey & Bee Products',    'honey-products',      'hive',               'shop'),
  ('Spices & Herbs',          'spices-herbs',        'local_florist',      'shop'),
  ('Dairy Products',          'dairy-products',      'water_drop',         'shop')
ON CONFLICT (slug) DO UPDATE SET category_type = 'shop', icon = EXCLUDED.icon;

-- 4. Seed Machinery categories (matching live site routes)
INSERT INTO shop_categories (name, slug, icon, category_type) VALUES
  ('Tractors',                'tractors',            'agriculture',        'machinery'),
  ('JCB',                     'jcb',                 'front_loader',       'machinery'),
  ('Harvesters',              'harvesters',          'grass',              'machinery'),
  ('Drones',                  'drones',              'flight',             'machinery'),
  ('Small Machineries',       'small-machineries',   'precision_manufacturing', 'machinery'),
  ('Implements',              'implements',          'handyman',           'machinery')
ON CONFLICT (slug) DO UPDATE SET category_type = 'machinery', icon = EXCLUDED.icon;

-- 5. Seed Service Provider categories (matching live site routes)
INSERT INTO shop_categories (name, slug, icon, category_type) VALUES
  ('Soil Testing',            'soil-testing',        'science',            'service_provider'),
  ('Rent Machinery',          'rent-machinery',      'agriculture',        'service_provider'),
  ('Borewell Services',       'borewell',            'water_drop',        'service_provider'),
  ('CCTV Installation',       'cctv',                'videocam',           'service_provider'),
  ('Fencing Services',        'fencing',             'fence',              'service_provider'),
  ('Harvester Service',       'harvester-service',   'grass',              'service_provider'),
  ('Drone Spray',             'drone-spray',         'flight',             'service_provider'),
  ('Farm Labours',            'farm-labours',        'group',              'service_provider'),
  ('Transportation',          'transportation',      'local_shipping',     'service_provider'),
  ('Storage & Godown',        'storage-godown',      'warehouse',          'service_provider'),
  ('Plumber',                 'plumber',             'plumbing',           'service_provider'),
  ('Electrician',             'electrician',         'electrical_services','service_provider'),
  ('Mechanic',                'mechanic',            'build_circle',       'service_provider'),
  ('Milk Vendors',            'milk-vendors',        'water_drop',        'service_provider')
ON CONFLICT (slug) DO UPDATE SET category_type = 'service_provider', icon = EXCLUDED.icon;

-- 6. Create index on category_type for fast filtered queries
CREATE INDEX IF NOT EXISTS idx_shop_categories_type ON shop_categories(category_type);
