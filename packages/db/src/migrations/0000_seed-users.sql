-- Custom SQL migration file, put your code below! ---- Migration: seed items (converted from seed-items.ts)
-- This migration inserts a small set of sample items and records the seed run.
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS seed_runs (
  name TEXT PRIMARY KEY,
  ran_at INTEGER NOT NULL
);

-- Insert 20 sample items
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Tasty Rubber Bike', 'Innovative Salad featuring secondary technology and Ceramic construction', 4515, 'TASTY-RUBBER-BIKE-SR3P', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Bespoke Wooden Fish', 'New Shirt model with 19 GB RAM, 243 GB storage, and reflecting features', 13919, 'AWESOME-GRANITE-SALAD-1FTG', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Soft Concrete Chicken', 'Introducing the Gabon-inspired Mouse, blending utter style with local craftsmanship', 14149, 'ORIENTAL-BAMBOO-MOUSE-BWHI', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Licensed Metal Ball', 'The Santos Chair is the latest in a series of frilly products from Langosh - Walsh', 17690, 'INTELLIGENT-GOLD-PANTS-373O', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Refined Granite Hat', 'Mohr - Schneider''s most advanced Ball technology increases normal capabilities', 3999, 'BESPOKE-WOODEN-FISH-QDML', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Gorgeous Cotton Bacon', 'Featuring Rutherfordium-enhanced technology, our Towels offers unparalleled alarmed performance', 17690, 'HANDMADE-PLASTIC-SAUSAGES-9SHV', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Intelligent Gold Pants', 'Experience the indigo brilliance of our Ball, perfect for elastic environments', 3999, 'HANDMADE-METAL-HAT-7TMZ', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Handmade Plastic Sausages', 'Introducing the Senegal-inspired Ball, blending frail style with local craftsmanship', 319, 'HANDCRAFTED-GOLD-MOUSE-X4AU', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Handcrafted Gold Mouse', 'New Soap model with 18 GB RAM, 351 GB storage, and rigid features', 6509, 'UNBRANDED-SILK-TUNA-UJVL', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Handmade Metal Hat', 'Mohr - Schneider''s most advanced Ball technology increases normal capabilities', 4515, 'ELECTRONIC-CONCRETE-GLOVES-TFRA', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Tasty Silk Chair', 'Featuring Rutherfordium-enhanced technology, our Towels offers unparalleled alarmed performance', 15755, 'MODERN-PLASTIC-BALL-OQLO', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Modern Plastic Ball', 'Our koala-friendly Table ensures minor comfort for your pets', 3999, 'SMALL-PLASTIC-BIKE-GEAY', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Small Plastic Bike', 'Innovative Salad featuring secondary technology and Ceramic construction', 11569, 'LICENSED-METAL-BALL-YSUV', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Frozen Steel Table', 'Introducing the Senegal-inspired Ball, blending frail style with local craftsmanship', 5969, 'FROZEN-STEEL-TABLE-WVDN', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Oriental Bamboo Mouse', 'Experience the indigo brilliance of our Ball, perfect for elastic environments', 5969, 'REFINED-RUBBER-CAR-UXSF', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Unbranded Silk Tuna', 'New Shirt model with 19 GB RAM, 243 GB storage, and reflecting features', 319, 'ORIENTAL-BAMBOO-PIZZA-ZHBX', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Refined Rubber Car', 'New magenta Soap with ergonomic design for pushy comfort', 5669, 'SOFT-CONCRETE-CHICKEN-FBNG', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Electronic Concrete Gloves', 'Mohr - Schneider''s most advanced Ball technology increases normal capabilities', 13919, 'REFINED-GRANITE-HAT-JOQP', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Awesome Granite Salad', 'Our koala-friendly Table ensures minor comfort for your pets', 12769, 'GORGEOUS-COTTON-BACON-ABK2', (strftime('%s','now') * 1000));
INSERT INTO items (name, description, price, sku, created_at) VALUES ('Oriental Bamboo Pizza', 'New magenta Soap with ergonomic design for pushy comfort', 12769, 'TASTY-SILK-CHAIR-KHUL', (strftime('%s','now') * 1000));

-- record this seed run
INSERT INTO seed_runs (name, ran_at) VALUES ('seed_items_v1', (strftime('%s','now') * 1000));

COMMIT;
