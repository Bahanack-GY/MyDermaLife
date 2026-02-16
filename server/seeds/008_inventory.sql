-- seeds/008_inventory.sql
-- Inventory Management: Warehouses, Stock Distribution, Suppliers, Sample PO

BEGIN;

-- =============================================
-- WAREHOUSES
-- =============================================

INSERT INTO warehouses (id, name, code, country, city, address, phone, email, is_active, is_default) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', 'Entrepôt Douala', 'CM-DLA', 'Cameroon', 'Douala',
    'Zone Industrielle de Bonabéri, BP 1234, Douala', '+237 233 42 00 00', 'douala@mydermalife.com', true, true),
('a1b2c3d4-2222-4000-a000-000000000002', 'Entrepôt Abidjan', 'CI-ABJ', 'Ivory Coast', 'Abidjan',
    'Zone Industrielle de Yopougon, BP 5678, Abidjan', '+225 27 21 00 00', 'abidjan@mydermalife.com', true, false);

-- =============================================
-- WAREHOUSE STOCK (~60% Cameroon, ~40% Ivory Coast)
-- =============================================

-- Gel Nettoyant Doux (stock_quantity=150): 90 CM + 60 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 90, 15),
('a1b2c3d4-2222-4000-a000-000000000002', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 60, 10);

-- Crème Hydratante Karité (stock_quantity=200): 120 CM + 80 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', '25468c18-e493-4b12-96dd-baeae57ca1bb', 120, 20),
('a1b2c3d4-2222-4000-a000-000000000002', '25468c18-e493-4b12-96dd-baeae57ca1bb', 80, 15);

-- Sérum Vitamine C 15% (stock_quantity=100): 60 CM + 40 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', '8111a09e-4e80-4922-86ec-521265d36933', 60, 10),
('a1b2c3d4-2222-4000-a000-000000000002', '8111a09e-4e80-4922-86ec-521265d36933', 40, 8);

-- Gel Anti-Acné Niacinamide (stock_quantity=120): 72 CM + 48 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 72, 12),
('a1b2c3d4-2222-4000-a000-000000000002', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 48, 8);

-- Sérum Anti-Taches Alpha Arbutin (stock_quantity=80): 48 CM + 32 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', 'cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 48, 8),
('a1b2c3d4-2222-4000-a000-000000000002', 'cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 32, 6);

-- Crème Solaire SPF 50+ Invisible (stock_quantity=250): 150 CM + 100 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', '3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 150, 25),
('a1b2c3d4-2222-4000-a000-000000000002', '3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 100, 15);

-- Crème Trétinoïne 0.025% (stock_quantity=50): 30 CM + 20 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', '0f220327-5266-4ab2-99f6-2d3620849260', 30, 5),
('a1b2c3d4-2222-4000-a000-000000000002', '0f220327-5266-4ab2-99f6-2d3620849260', 20, 5);

-- Crème Hydroquinone 4% (stock_quantity=30): 18 CM + 12 CI
INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, low_stock_threshold) VALUES
('a1b2c3d4-1111-4000-a000-000000000001', 'dd48db44-3e46-4496-bd8f-69f2bcc0696d', 18, 5),
('a1b2c3d4-2222-4000-a000-000000000002', 'dd48db44-3e46-4496-bd8f-69f2bcc0696d', 12, 3);

-- =============================================
-- SUPPLIERS
-- =============================================

INSERT INTO suppliers (id, name, code, email, phone, address, city, country, contact_person, website, payment_terms, lead_time_days, is_active, notes, created_by) VALUES
('b1c2d3e4-1111-4000-b000-000000000001', 'DermaLab Cameroun', 'SUP-DLC', 'contact@dermalab.cm',
    '+237 233 45 67 89', 'Zone Industrielle de Bonabéri, Lot 45', 'Douala', 'Cameroon',
    'Jean-Pierre Nkouam', 'https://dermalab.cm', 'Net 30', 14, true,
    'Fabricant local spécialisé en produits dermatologiques. Partenaire depuis 2023.',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('b1c2d3e4-2222-4000-b000-000000000002', 'AfriCosmetics SARL', 'SUP-ACS', 'commandes@africosmetics.ci',
    '+225 27 22 33 44', 'Boulevard de Marseille, Immeuble Cosmos', 'Abidjan', 'Ivory Coast',
    'Aminata Koné', 'https://africosmetics.ci', 'Net 45', 21, true,
    'Distributeur régional de produits cosmétiques pour l''Afrique de l''Ouest.',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('b1c2d3e4-3333-4000-b000-000000000003', 'PharmaDerm International', 'SUP-PDI', 'orders@pharmaderm.com',
    '+33 1 42 68 00 00', '15 Rue de la Santé', 'Paris', 'France',
    'Dr. Marie Lefèvre', 'https://pharmaderm.com', 'Net 60', 30, true,
    'Laboratoire pharmaceutique international. Fournisseur des produits sur ordonnance.',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

-- =============================================
-- SUPPLIER-PRODUCT LINKS
-- =============================================

-- DermaLab Cameroun supplies: cleansers, moisturizers, serums, anti-acne
INSERT INTO supplier_products (supplier_id, product_id, supplier_sku, cost_price, lead_time_days, min_order_quantity, is_preferred) VALUES
('b1c2d3e4-1111-4000-b000-000000000001', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 'DL-CLN-001', 4500, 10, 50, true),
('b1c2d3e4-1111-4000-b000-000000000001', '25468c18-e493-4b12-96dd-baeae57ca1bb', 'DL-HYD-001', 6500, 10, 50, true),
('b1c2d3e4-1111-4000-b000-000000000001', '8111a09e-4e80-4922-86ec-521265d36933', 'DL-SER-001', 10000, 14, 30, true),
('b1c2d3e4-1111-4000-b000-000000000001', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 'DL-ACN-001', 7500, 10, 40, true);

-- AfriCosmetics supplies: brightening, sunscreen
INSERT INTO supplier_products (supplier_id, product_id, supplier_sku, cost_price, lead_time_days, min_order_quantity, is_preferred) VALUES
('b1c2d3e4-2222-4000-b000-000000000002', 'cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 'AC-ECL-001', 12000, 18, 20, true),
('b1c2d3e4-2222-4000-b000-000000000002', '3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 'AC-SUN-001', 8500, 18, 30, true);

-- PharmaDerm International supplies: prescription products
INSERT INTO supplier_products (supplier_id, product_id, supplier_sku, cost_price, lead_time_days, min_order_quantity, is_preferred) VALUES
('b1c2d3e4-3333-4000-b000-000000000003', '0f220327-5266-4ab2-99f6-2d3620849260', 'PD-RX-001', 15000, 28, 10, true),
('b1c2d3e4-3333-4000-b000-000000000003', 'dd48db44-3e46-4496-bd8f-69f2bcc0696d', 'PD-RX-002', 18000, 28, 10, true);

-- =============================================
-- SAMPLE PURCHASE ORDER (received)
-- =============================================

INSERT INTO purchase_orders (id, po_number, supplier_id, warehouse_id, status, order_date, expected_delivery_date, received_date, subtotal, tax_amount, shipping_cost, total_amount, currency, notes, created_by, approved_by, received_by) VALUES
('c1d2e3f4-1111-4000-c000-000000000001', 'PO-001000', 'b1c2d3e4-1111-4000-b000-000000000001',
    'a1b2c3d4-1111-4000-a000-000000000001', 'received',
    '2025-01-10', '2025-01-24', '2025-01-22',
    725000, 0, 15000, 740000, 'XAF',
    'Commande de réapprovisionnement initiale - Entrepôt Douala',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES
('c1d2e3f4-1111-4000-c000-000000000001', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 50, 50, 4500, 225000),
('c1d2e3f4-1111-4000-c000-000000000001', '25468c18-e493-4b12-96dd-baeae57ca1bb', 50, 50, 6500, 325000),
('c1d2e3f4-1111-4000-c000-000000000001', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 30, 30, 5000, 150000),
('c1d2e3f4-1111-4000-c000-000000000001', '8111a09e-4e80-4922-86ec-521265d36933', 5, 5, 5000, 25000);

-- =============================================
-- INITIAL STOCK MOVEMENTS (for audit trail)
-- =============================================

-- Record initial stock setup as adjustments
INSERT INTO stock_movements (warehouse_id, product_id, movement_type, quantity, direction, reference_type, reason, performed_by) VALUES
-- Douala warehouse
('a1b2c3d4-1111-4000-a000-000000000001', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 'adjustment', 90, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', '25468c18-e493-4b12-96dd-baeae57ca1bb', 'adjustment', 120, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', '8111a09e-4e80-4922-86ec-521265d36933', 'adjustment', 60, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 'adjustment', 72, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', 'cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 'adjustment', 48, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', '3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 'adjustment', 150, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', '0f220327-5266-4ab2-99f6-2d3620849260', 'adjustment', 30, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-1111-4000-a000-000000000001', 'dd48db44-3e46-4496-bd8f-69f2bcc0696d', 'adjustment', 18, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
-- Abidjan warehouse
('a1b2c3d4-2222-4000-a000-000000000002', '0038cf0c-5aac-42ca-a145-7260df9cb8ab', 'adjustment', 60, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', '25468c18-e493-4b12-96dd-baeae57ca1bb', 'adjustment', 80, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', '8111a09e-4e80-4922-86ec-521265d36933', 'adjustment', 40, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', 'ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 'adjustment', 48, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', 'cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 'adjustment', 32, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', '3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 'adjustment', 100, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', '0f220327-5266-4ab2-99f6-2d3620849260', 'adjustment', 20, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),
('a1b2c3d4-2222-4000-a000-000000000002', 'dd48db44-3e46-4496-bd8f-69f2bcc0696d', 'adjustment', 12, 'in', 'adjustment', 'Initial stock setup', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

COMMIT;
