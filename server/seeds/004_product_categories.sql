-- seeds/004_product_categories.sql

BEGIN;

-- Main product categories
INSERT INTO product_categories (id, name, slug, description, sort_order, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'Soins Visage', 'soins-visage', 'Produits de soins pour le visage', 1, true),
('a2000000-0000-0000-0000-000000000002', 'Soins Corps', 'soins-corps', 'Produits de soins pour le corps', 2, true),
('a3000000-0000-0000-0000-000000000003', 'K-Beauty', 'k-beauty', 'Produits de beauté coréenne', 3, true),
('a4000000-0000-0000-0000-000000000004', 'Test', 'test', 'Catégorie de test', 4, true);

-- Soins Visage subcategories
INSERT INTO product_categories (id, name, slug, description, parent_category_id, sort_order, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Nettoyants', 'soins-visage-nettoyants', 'Nettoyants et démaquillants pour le visage', 'a1000000-0000-0000-0000-000000000001', 1, true),
('b1000000-0000-0000-0000-000000000002', 'Hydratants', 'soins-visage-hydratants', 'Crèmes et lotions hydratantes pour le visage', 'a1000000-0000-0000-0000-000000000001', 2, true),
('b1000000-0000-0000-0000-000000000003', 'Sérums', 'soins-visage-serums', 'Sérums concentrés pour le visage', 'a1000000-0000-0000-0000-000000000001', 3, true),
('b1000000-0000-0000-0000-000000000004', 'Masques', 'soins-visage-masques', 'Masques de soin pour le visage', 'a1000000-0000-0000-0000-000000000001', 4, true),
('b1000000-0000-0000-0000-000000000005', 'Exfoliants', 'soins-visage-exfoliants', 'Exfoliants et gommages pour le visage', 'a1000000-0000-0000-0000-000000000001', 5, true);

-- Soins Corps subcategories
INSERT INTO product_categories (id, name, slug, description, parent_category_id, sort_order, is_active) VALUES
('b2000000-0000-0000-0000-000000000001', 'Hydratants', 'soins-corps-hydratants', 'Crèmes et lotions hydratantes pour le corps', 'a2000000-0000-0000-0000-000000000002', 1, true),
('b2000000-0000-0000-0000-000000000002', 'Gommages', 'soins-corps-gommages', 'Gommages et exfoliants pour le corps', 'a2000000-0000-0000-0000-000000000002', 2, true),
('b2000000-0000-0000-0000-000000000003', 'Huiles', 'soins-corps-huiles', 'Huiles de soin pour le corps', 'a2000000-0000-0000-0000-000000000002', 3, true);

-- K-Beauty subcategories
INSERT INTO product_categories (id, name, slug, description, parent_category_id, sort_order, is_active) VALUES
('b3000000-0000-0000-0000-000000000001', 'Nettoyants', 'k-beauty-nettoyants', 'Nettoyants coréens', 'a3000000-0000-0000-0000-000000000003', 1, true),
('b3000000-0000-0000-0000-000000000002', 'Essences', 'k-beauty-essences', 'Essences et lotions coréennes', 'a3000000-0000-0000-0000-000000000003', 2, true),
('b3000000-0000-0000-0000-000000000003', 'Sérums', 'k-beauty-serums', 'Sérums et ampoules coréens', 'a3000000-0000-0000-0000-000000000003', 3, true),
('b3000000-0000-0000-0000-000000000004', 'Masques', 'k-beauty-masques', 'Sheet masks et masques coréens', 'a3000000-0000-0000-0000-000000000003', 4, true),
('b3000000-0000-0000-0000-000000000005', 'Crèmes', 'k-beauty-cremes', 'Crèmes hydratantes coréennes', 'a3000000-0000-0000-0000-000000000003', 5, true);

COMMIT;
