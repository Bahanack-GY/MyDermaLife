-- seeds/005_products.sql

BEGIN;

-- Products
INSERT INTO products (id, sku, name, slug, short_description, long_description, category_id, price, compare_at_price, requires_prescription, ingredients, usage_instructions, benefits, skin_types, stock_quantity, is_active, is_featured, is_new, created_by) VALUES
-- Nettoyants
('0038cf0c-5aac-42ca-a145-7260df9cb8ab', 'CLN-001', 'Gel Nettoyant Doux', 'gel-nettoyant-doux',
    'Gel nettoyant doux pour peaux sensibles et foncées.',
    'Gel nettoyant doux formulé pour les peaux sensibles et foncées. Élimine les impuretés sans dessécher la peau.',
    'b1000000-0000-0000-0000-000000000001', 8500, 10000, false,
    '["Aloe Vera", "Glycérine", "Niacinamide", "Extrait de Papaye"]'::jsonb,
    'Appliquer matin et soir sur le visage humide. Masser doucement et rincer à l''eau tiède.',
    '["Nettoie en douceur", "Apaise la peau", "Prépare au soin"]'::jsonb,
    '["sensitive", "normal", "combination"]'::jsonb,
    150, true, true, true, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Hydratants
('25468c18-e493-4b12-96dd-baeae57ca1bb', 'HYD-001', 'Crème Hydratante Karité', 'creme-hydratante-karite',
    'Crème hydratante riche au beurre de karité pour peaux sèches.',
    'Crème hydratante riche au beurre de karité, parfaite pour les peaux sèches à très sèches.',
    'b1000000-0000-0000-0000-000000000002', 12000, 15000, false,
    '["Beurre de Karité", "Huile d''Argan", "Vitamine E", "Allantoïne"]'::jsonb,
    'Appliquer matin et/ou soir sur une peau propre. Masser jusqu''à absorption complète.',
    '["Hydratation intense", "Nourrit la peau", "Protection 24h"]'::jsonb,
    '["dry", "normal"]'::jsonb,
    200, true, true, false, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Sérums
('8111a09e-4e80-4922-86ec-521265d36933', 'SER-001', 'Sérum Vitamine C 15%', 'serum-vitamine-c-15',
    'Sérum antioxydant à la vitamine C, éclaircit le teint.',
    'Sérum antioxydant à la vitamine C pure, éclaircit le teint et réduit les taches pigmentaires.',
    'b1000000-0000-0000-0000-000000000003', 18500, 22000, false,
    '["Vitamine C (Acide Ascorbique) 15%", "Vitamine E", "Acide Férulique", "Acide Hyaluronique"]'::jsonb,
    'Appliquer 3-4 gouttes le matin sur peau propre, avant la crème hydratante. Utiliser une protection solaire.',
    '["Éclaircit le teint", "Réduit les taches", "Anti-oxydant puissant"]'::jsonb,
    '["normal", "combination", "oily"]'::jsonb,
    100, true, true, true, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Sérums (Anti-Acné)
('ed09eb6e-1665-43f8-9c54-d7b4d607f76c', 'ACN-001', 'Gel Anti-Acné Niacinamide', 'gel-anti-acne-niacinamide',
    'Gel léger au niacinamide 10% contre le sébum et les imperfections.',
    'Gel léger au niacinamide 10% pour contrôler le sébum et réduire les imperfections.',
    'b1000000-0000-0000-0000-000000000003', 14000, null, false,
    '["Niacinamide 10%", "Zinc PCA", "Acide Salicylique 0.5%", "Extrait de Thé Vert"]'::jsonb,
    'Appliquer localement sur les zones à imperfections, 1 à 2 fois par jour.',
    '["Réduit le sébum", "Resserre les pores", "Apaise l''inflammation"]'::jsonb,
    '["oily", "combination"]'::jsonb,
    120, true, false, true, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Sérums (Éclaircissants)
('cb76b53e-ffd6-44de-b7c7-dab0881a3a59', 'ECL-001', 'Sérum Anti-Taches Alpha Arbutin', 'serum-anti-taches-alpha-arbutin',
    'Sérum éclaircissant à l''alpha arbutin, réduit les taches brunes.',
    'Sérum éclaircissant à l''alpha arbutin, réduit visiblement les taches brunes et unifie le teint.',
    'b1000000-0000-0000-0000-000000000003', 22000, 25000, false,
    '["Alpha Arbutin 2%", "Niacinamide 5%", "Acide Kojique", "Extrait de Réglisse"]'::jsonb,
    'Appliquer matin et soir sur les zones hyperpigmentées. Toujours utiliser une protection solaire.',
    '["Réduit les taches", "Unifie le teint", "Prévient l''hyperpigmentation"]'::jsonb,
    '["normal", "combination", "sensitive"]'::jsonb,
    80, true, true, false, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Hydratants (Protection Solaire)
('3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', 'SUN-001', 'Crème Solaire SPF 50+ Invisible', 'creme-solaire-spf50-invisible',
    'Protection solaire SPF 50+, fini invisible sur peaux foncées.',
    'Protection solaire haute efficacité, fini invisible sans traces blanches sur peaux foncées.',
    'b1000000-0000-0000-0000-000000000002', 16000, 18000, false,
    '["Filtres UV (UVA/UVB)", "Vitamine E", "Aloe Vera", "Niacinamide"]'::jsonb,
    'Appliquer généreusement 15 minutes avant l''exposition. Renouveler toutes les 2 heures.',
    '["Protection UVA/UVB", "Sans traces blanches", "Hydrate la peau"]'::jsonb,
    '["normal", "dry", "oily", "combination", "sensitive"]'::jsonb,
    250, true, true, true, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

-- Sérums (Prescription)
('0f220327-5266-4ab2-99f6-2d3620849260', 'RX-001', 'Crème Trétinoïne 0.025%', 'creme-tretinoine-0025',
    'Crème à la trétinoïne pour l''acné et le renouvellement cellulaire.',
    'Crème à la trétinoïne pour le traitement de l''acné et le renouvellement cellulaire. Prescription requise.',
    'b1000000-0000-0000-0000-000000000003', 25000, null, true,
    '["Trétinoïne 0.025%", "Base émolliente"]'::jsonb,
    'Appliquer une fine couche le soir sur peau sèche. Commencer par 2-3 fois/semaine.',
    '["Traitement acné", "Renouvellement cellulaire", "Anti-âge"]'::jsonb,
    '["oily", "combination"]'::jsonb,
    50, true, false, false, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c'),

('dd48db44-3e46-4496-bd8f-69f2bcc0696d', 'RX-002', 'Crème Hydroquinone 4%', 'creme-hydroquinone-4',
    'Crème éclaircissante à l''hydroquinone pour taches résistantes.',
    'Crème éclaircissante à l''hydroquinone pour traiter les taches pigmentaires résistantes. Prescription requise.',
    'b1000000-0000-0000-0000-000000000003', 28000, null, true,
    '["Hydroquinone 4%", "Trétinoïne 0.025%", "Hydrocortisone 1%"]'::jsonb,
    'Appliquer le soir sur les zones concernées. Ne pas utiliser plus de 3 mois consécutifs.',
    '["Dépigmentation", "Traitement mélasma", "Éclaircissement intense"]'::jsonb,
    '["normal", "combination"]'::jsonb,
    30, true, false, false, 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

-- Product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
('0038cf0c-5aac-42ca-a145-7260df9cb8ab', '/images/products/gel-nettoyant-doux-1.jpg', 'Gel Nettoyant Doux - Vue principale', 0, true),
('25468c18-e493-4b12-96dd-baeae57ca1bb', '/images/products/creme-karite-1.jpg', 'Crème Hydratante Karité - Vue principale', 0, true),
('8111a09e-4e80-4922-86ec-521265d36933', '/images/products/serum-vitc-1.jpg', 'Sérum Vitamine C 15% - Vue principale', 0, true),
('ed09eb6e-1665-43f8-9c54-d7b4d607f76c', '/images/products/gel-anti-acne-1.jpg', 'Gel Anti-Acné - Vue principale', 0, true),
('cb76b53e-ffd6-44de-b7c7-dab0881a3a59', '/images/products/serum-arbutin-1.jpg', 'Sérum Alpha Arbutin - Vue principale', 0, true),
('3e5ba884-2a9b-4c9c-8271-9783cbf04d8d', '/images/products/creme-solaire-1.jpg', 'Crème Solaire SPF 50+ - Vue principale', 0, true),
('0f220327-5266-4ab2-99f6-2d3620849260', '/images/products/tretinoine-1.jpg', 'Crème Trétinoïne - Vue principale', 0, true),
('dd48db44-3e46-4496-bd8f-69f2bcc0696d', '/images/products/hydroquinone-1.jpg', 'Crème Hydroquinone - Vue principale', 0, true);

COMMIT;
