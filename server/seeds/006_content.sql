-- seeds/006_content.sql

BEGIN;

-- Skin conditions
INSERT INTO skin_conditions (id, name, slug, description, symptoms, causes, treatments, prevention, is_active) VALUES
('f5821d5e-c330-4bf8-ad4b-e2236443f3b6', 'Acné', 'acne',
    'L''acné est une affection cutanée courante qui survient lorsque les follicules pileux sont obstrués par du sébum et des cellules mortes.',
    'Boutons, points noirs, points blancs, kystes, nodules, peau grasse, cicatrices',
    'Surproduction de sébum, bactéries, hormones, stress, alimentation, génétique',
    'Nettoyage régulier, produits à base d''acide salicylique ou de peroxyde de benzoyle, rétinoïdes, antibiotiques (prescription)',
    'Nettoyage doux deux fois par jour, éviter de toucher le visage, alimentation équilibrée, gestion du stress',
    true),

('add66079-18dc-4d18-8b81-07b0eaa3f6c6', 'Hyperpigmentation', 'hyperpigmentation',
    'L''hyperpigmentation se manifeste par des taches sombres sur la peau dues à une production excessive de mélanine.',
    'Taches brunes, teint inégal, masque de grossesse, taches post-inflammatoires',
    'Exposition au soleil, inflammation, hormones, vieillissement, blessures cutanées',
    'Protection solaire, vitamine C, alpha arbutin, acide kojique, hydroquinone (prescription)',
    'Protection solaire quotidienne SPF 30+, éviter le soleil aux heures de pointe, traiter rapidement les inflammations',
    true),

('5f9744fc-2390-4bf6-a0a9-1098614ac51f', 'Eczéma', 'eczema',
    'L''eczéma est une affection inflammatoire chronique de la peau caractérisée par des démangeaisons et une peau sèche.',
    'Démangeaisons intenses, peau sèche et squameuse, rougeurs, plaques épaisses',
    'Prédisposition génétique, allergènes, irritants, stress, climat sec',
    'Hydratation intensive, corticoïdes topiques, antihistaminiques, immunomodulateurs',
    'Hydrater régulièrement, éviter les irritants, utiliser des produits sans parfum, maintenir un environnement humide',
    true),

('fc1f7888-aec9-4bbd-96b6-7603b2263c12', 'Mélasma', 'melasma',
    'Le mélasma est une hyperpigmentation qui apparaît principalement sur le visage, souvent liée aux hormones.',
    'Taches brunes symétriques sur le front, les joues, le nez et la lèvre supérieure',
    'Hormones (grossesse, contraceptifs), exposition au soleil, génétique',
    'Protection solaire stricte, hydroquinone, trétinoïne, acide azélaïque, peelings chimiques',
    'Protection solaire quotidienne très stricte, éviter les sources de chaleur sur le visage',
    true);

-- FAQs
INSERT INTO faqs (id, question, answer, category, sort_order, is_active) VALUES
('2cfa3335-bcf0-47f8-9f97-9c72b8c66ab1',
    'Comment prendre rendez-vous avec un dermatologue ?',
    'Vous pouvez prendre rendez-vous directement sur notre plateforme en sélectionnant le médecin de votre choix et un créneau disponible. Les consultations peuvent être en vidéo ou en personne selon la disponibilité.',
    'Consultations', 1, true),
('b80ac661-c4fa-498e-9fed-2f4cfda5ea65',
    'Puis-je commander des produits sans ordonnance ?',
    'Oui, la plupart de nos produits sont disponibles sans ordonnance. Cependant, certains traitements spécifiques nécessitent une prescription médicale qui peut être obtenue lors d''une consultation.',
    'Produits', 1, true),
('1b80fc5a-41b7-42d7-8097-3db9bd1c5f50',
    'Comment fonctionne la consultation vidéo ?',
    'Après avoir réservé votre créneau, vous recevrez un lien de connexion par email. À l''heure du rendez-vous, connectez-vous via ce lien. Assurez-vous d''avoir une bonne connexion internet et un endroit calme.',
    'Consultations', 2, true),
('c0e31526-6cc9-4c86-9110-36244f238a73',
    'Quels sont les délais de livraison ?',
    'Les commandes sont généralement livrées sous 2-5 jours ouvrables à Douala et Yaoundé, et 5-10 jours pour les autres régions. Vous recevrez un numéro de suivi par email.',
    'Livraison', 1, true),
('45889fed-1856-499d-b220-9e074b623641',
    'Comment puis-je suivre ma commande ?',
    'Vous pouvez suivre votre commande depuis votre espace client ou en utilisant le lien de suivi envoyé par email. Les commandes invités peuvent être suivies avec le numéro de commande et l''email utilisé.',
    'Livraison', 2, true);

-- Testimonials
INSERT INTO testimonials (id, name, content, rating, is_featured, is_approved, approved_at) VALUES
('6f7c92cc-b20d-4989-a60c-daa040c90a58', 'Mariam K.',
    'Grâce à MyDermaLife, j''ai enfin trouvé des produits adaptés à ma peau noire. Le Dr. Ndiaye a été d''une aide précieuse pour mon problème d''hyperpigmentation.',
    5, true, true, NOW()),
('de744140-d615-49e4-bd37-55094d2db709', 'Jean-Pierre M.',
    'La consultation vidéo était très pratique. Le médecin a pris le temps d''examiner mes photos et m''a prescrit un traitement efficace pour mon eczéma.',
    5, true, true, NOW()),
('289dc56d-0f6d-47f1-8f9c-15e17a1e3496', 'Fatima O.',
    'Livraison rapide et produits de qualité. Le sérum vitamine C a vraiment amélioré mon teint en quelques semaines.',
    4, false, true, NOW());

-- Blog posts
INSERT INTO blog_posts (id, title, slug, excerpt, content, author_id, category, tags, status, published_at) VALUES
('154588ff-d554-40e0-8cbc-25511dfd618c',
    'Les meilleurs soins pour les peaux noires et métissées',
    'meilleurs-soins-peaux-noires-metissees',
    'Découvrez les ingrédients et routines adaptés aux besoins spécifiques des peaux foncées.',
    'Les peaux noires et métissées ont des besoins spécifiques en matière de soins. Riches en mélanine, elles sont plus résistantes au soleil mais aussi plus sujettes à l''hyperpigmentation et aux taches...',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c',
    'Conseils Beauté',
    '["peau noire", "soins", "hyperpigmentation", "routine beauté"]'::jsonb,
    'published', NOW()),
('dd8fde9b-eb7d-46ef-bf07-d565cf0a7b74',
    'Comment traiter l''acné naturellement',
    'traiter-acne-naturellement',
    'Guide complet pour combattre l''acné avec des méthodes naturelles et des produits adaptés.',
    'L''acné touche de nombreuses personnes, quel que soit leur âge. Bien que les traitements médicaux soient souvent nécessaires pour les cas sévères, il existe des approches naturelles efficaces...',
    'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c',
    'Santé',
    '["acné", "traitement naturel", "soins de la peau"]'::jsonb,
    'published', NOW());

COMMIT;
