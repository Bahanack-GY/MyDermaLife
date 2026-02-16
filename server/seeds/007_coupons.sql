-- seeds/007_coupons.sql

BEGIN;

-- Coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_limit_per_user, valid_from, valid_until, is_active, applies_to, created_by) VALUES
('91499f92-8d06-43ed-85b6-73d9628692ee', 'WELCOME10',
    '10% de réduction pour les nouveaux clients',
    'percentage', 10, 10000, 5000, 1000, 1,
    NOW(), NOW() + INTERVAL '1 year', true, 'all',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('e36fb588-df99-442e-b93f-73d4e4e30ba7', 'FREESHIP',
    'Livraison gratuite pour les commandes de plus de 30 000 FCFA',
    'fixed_amount', 3000, 30000, 3000, null, 3,
    NOW(), NOW() + INTERVAL '6 months', true, 'all',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('bd2e8fff-20f0-474c-8471-5a35847c53f4', 'SKINCARE20',
    '20% de réduction sur les produits de soin du visage',
    'percentage', 20, 15000, 10000, 500, 2,
    NOW(), NOW() + INTERVAL '3 months', true, 'specific_categories',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('6c800c7f-e29e-40ab-a436-7a98327ffacd', 'CONSULT5000',
    '5000 FCFA de réduction sur la première consultation',
    'fixed_amount', 5000, 10000, 5000, 200, 1,
    NOW(), NOW() + INTERVAL '6 months', true, 'all',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('f2dc0d7c-b72e-4cec-ac5c-e6979ba46630', 'SUMMER25',
    '25% de réduction sur la protection solaire',
    'percentage', 25, 8000, 8000, 300, 2,
    NOW(), NOW() + INTERVAL '4 months', true, 'specific_categories',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

-- Update category-specific coupons
UPDATE coupons SET applicable_category_ids = '["a1000000-0000-0000-0000-000000000001"]'::jsonb
WHERE code = 'SKINCARE20';

UPDATE coupons SET applicable_category_ids = '["a1000000-0000-0000-0000-000000000001"]'::jsonb
WHERE code = 'SUMMER25';

COMMIT;
