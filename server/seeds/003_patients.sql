-- seeds/003_patients.sql

BEGIN;

-- Create patient users (password: Patient@123)
INSERT INTO users (id, email, phone, password_hash, role, email_verified, status) VALUES
('4350545b-b22c-43c5-84af-c06ea8441280', 'aminata.kamara@email.com', '+237655002001', '$2b$10$q66b6yAJy31cGCrvBY8B5eY0NSp61yCRj7/prZsD8SlVEwZimkwtW', 'patient', true, 'active'),
('2e235cd5-d757-444b-96b9-781957977bef', 'paul.fotso@email.com', '+237655002002', '$2b$10$q66b6yAJy31cGCrvBY8B5eY0NSp61yCRj7/prZsD8SlVEwZimkwtW', 'patient', true, 'active'),
('21376b03-cae7-4bb1-acbd-5af8eba00885', 'marie.tchoupo@email.com', '+237655002003', '$2b$10$q66b6yAJy31cGCrvBY8B5eY0NSp61yCRj7/prZsD8SlVEwZimkwtW', 'patient', true, 'active');

-- Patient profiles
INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender, language, country, city, address_line1, postal_code) VALUES
('4350545b-b22c-43c5-84af-c06ea8441280', 'Aminata', 'Kamara', '1990-05-15', 'female', 'fr', 'Cameroon', 'Douala', '123 Rue Bonanjo', 'BP 1234'),
('2e235cd5-d757-444b-96b9-781957977bef', 'Paul', 'Fotso', '1985-08-22', 'male', 'fr', 'Cameroon', 'Yaounde', '45 Avenue Kennedy', 'BP 5678'),
('21376b03-cae7-4bb1-acbd-5af8eba00885', 'Marie', 'Tchoupo', '1995-12-03', 'female', 'fr', 'Cameroon', 'Douala', '78 Boulevard Leclerc', 'BP 9012');

-- Patient medical histories
INSERT INTO patient_medical_history (patient_id, allergies, current_medications, skin_type, skin_concerns, blood_type) VALUES
('4350545b-b22c-43c5-84af-c06ea8441280',
    '["Pénicilline", "Fruits de mer"]'::jsonb,
    '["Vitamine D - 1000 UI/jour"]'::jsonb,
    'combination',
    '["Hyperpigmentation", "Acné légère"]'::jsonb,
    'O+'),
('2e235cd5-d757-444b-96b9-781957977bef',
    '[]'::jsonb,
    '["Antihypertenseur"]'::jsonb,
    'oily',
    '["Eczéma", "Peau grasse"]'::jsonb,
    'A+'),
('21376b03-cae7-4bb1-acbd-5af8eba00885',
    '["Latex"]'::jsonb,
    '[]'::jsonb,
    'sensitive',
    '["Rosacée", "Peau sensible"]'::jsonb,
    'B+');

-- User addresses
INSERT INTO user_addresses (user_id, address_type, full_name, phone, address_line1, city, state, country, postal_code, is_default) VALUES
('4350545b-b22c-43c5-84af-c06ea8441280', 'both', 'Aminata Kamara', '+237655002001', '123 Rue Bonanjo', 'Douala', 'Littoral', 'Cameroon', 'BP 1234', true),
('2e235cd5-d757-444b-96b9-781957977bef', 'both', 'Paul Fotso', '+237655002002', '45 Avenue Kennedy', 'Yaounde', 'Centre', 'Cameroon', 'BP 5678', true),
('21376b03-cae7-4bb1-acbd-5af8eba00885', 'both', 'Marie Tchoupo', '+237655002003', '78 Boulevard Leclerc', 'Douala', 'Littoral', 'Cameroon', 'BP 9012', true);

COMMIT;
