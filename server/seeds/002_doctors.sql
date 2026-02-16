-- seeds/002_doctors.sql

BEGIN;

-- Create doctor users (password: Doctor@123)
INSERT INTO users (id, email, phone, password_hash, role, email_verified, status) VALUES
('aa6d2971-5a77-42e5-bd8f-1abf237054e6', 'sarah.ndiaye@mydermalife.com', '+237655001001', '$2b$10$8UsmvXfLgNSwnI4xjWPHguovFyFjvhNDpTW6dHCAJVmUKw/1lqsjK', 'doctor', true, 'active'),
('f6f2c715-5e3c-4310-bb6c-3b2f0dd51a64', 'jean.mbeki@mydermalife.com', '+237655001002', '$2b$10$8UsmvXfLgNSwnI4xjWPHguovFyFjvhNDpTW6dHCAJVmUKw/1lqsjK', 'doctor', true, 'active'),
('66bf9f15-355c-4d0a-9028-d0fb55b8db51', 'fatou.diallo@mydermalife.com', '+237655001003', '$2b$10$8UsmvXfLgNSwnI4xjWPHguovFyFjvhNDpTW6dHCAJVmUKw/1lqsjK', 'doctor', true, 'active');

-- Doctor profiles
INSERT INTO user_profiles (user_id, first_name, last_name, gender, language, country, city) VALUES
('aa6d2971-5a77-42e5-bd8f-1abf237054e6', 'Sarah', 'Ndiaye', 'female', 'fr', 'Cameroon', 'Douala'),
('f6f2c715-5e3c-4310-bb6c-3b2f0dd51a64', 'Jean', 'Mbeki', 'male', 'fr', 'Cameroon', 'Yaounde'),
('66bf9f15-355c-4d0a-9028-d0fb55b8db51', 'Fatou', 'Diallo', 'female', 'fr', 'Senegal', 'Dakar');

-- Doctor records
INSERT INTO doctors (id, user_id, license_number, specialization, years_of_experience, bio, education, certifications, languages_spoken, consultation_fee, video_consultation_fee, verification_status, verified_at, is_available, status) VALUES
('80ff178f-841d-4f9e-be1f-b3773403343b', 'aa6d2971-5a77-42e5-bd8f-1abf237054e6', 'DRM-CM-2015-001', 'Dermatologie générale', 9,
    'Dr. Sarah Ndiaye est une dermatologue expérimentée spécialisée dans le traitement des affections cutanées courantes et les soins de la peau pour les peaux noires.',
    '[{"degree": "Docteur en Médecine", "institution": "Université de Douala", "year": 2015}, {"degree": "Spécialisation Dermatologie", "institution": "CHU Douala", "year": 2018}]'::jsonb,
    '[{"name": "Board Certified Dermatologist", "year": 2018}]'::jsonb,
    '["Français", "Anglais"]'::jsonb,
    15000, 12000, 'verified', NOW(), true, 'active'),

('13af737e-41a9-472b-9de2-75649164a544', 'f6f2c715-5e3c-4310-bb6c-3b2f0dd51a64', 'DRM-CM-2012-045', 'Dermatologie esthétique', 12,
    'Dr. Jean Mbeki est spécialisé en dermatologie esthétique et traitement des cicatrices, avec une expertise particulière dans les traitements laser.',
    '[{"degree": "Docteur en Médecine", "institution": "Université de Yaoundé I", "year": 2012}, {"degree": "Fellowship Dermatologie Esthétique", "institution": "Paris", "year": 2016}]'::jsonb,
    '[{"name": "Certified Aesthetic Dermatologist", "year": 2016}, {"name": "Laser Treatment Specialist", "year": 2017}]'::jsonb,
    '["Français", "Anglais"]'::jsonb,
    20000, 18000, 'verified', NOW(), true, 'active'),

('eb5c9f0c-cedc-417f-bbc1-01607849c956', '66bf9f15-355c-4d0a-9028-d0fb55b8db51', 'DRM-SN-2017-112', 'Dermatologie pédiatrique', 7,
    'Dr. Fatou Diallo se spécialise dans les conditions dermatologiques pédiatriques et les maladies de la peau chez les enfants.',
    '[{"degree": "Docteur en Médecine", "institution": "Université Cheikh Anta Diop", "year": 2017}, {"degree": "Résidence Pédiatrie-Dermatologie", "institution": "Hôpital Principal Dakar", "year": 2020}]'::jsonb,
    '[{"name": "Pediatric Dermatology Specialist", "year": 2020}]'::jsonb,
    '["Français", "Wolof"]'::jsonb,
    12000, 10000, 'verified', NOW(), true, 'active');

-- Doctor availability (Monday-Friday, 9am-5pm)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
-- Dr. Sarah Ndiaye
('80ff178f-841d-4f9e-be1f-b3773403343b', 1, '09:00', '17:00', true),
('80ff178f-841d-4f9e-be1f-b3773403343b', 2, '09:00', '17:00', true),
('80ff178f-841d-4f9e-be1f-b3773403343b', 3, '09:00', '17:00', true),
('80ff178f-841d-4f9e-be1f-b3773403343b', 4, '09:00', '17:00', true),
('80ff178f-841d-4f9e-be1f-b3773403343b', 5, '09:00', '13:00', true),
-- Dr. Jean Mbeki
('13af737e-41a9-472b-9de2-75649164a544', 1, '10:00', '18:00', true),
('13af737e-41a9-472b-9de2-75649164a544', 2, '10:00', '18:00', true),
('13af737e-41a9-472b-9de2-75649164a544', 3, '10:00', '18:00', true),
('13af737e-41a9-472b-9de2-75649164a544', 4, '10:00', '18:00', true),
('13af737e-41a9-472b-9de2-75649164a544', 5, '10:00', '14:00', true),
-- Dr. Fatou Diallo
('eb5c9f0c-cedc-417f-bbc1-01607849c956', 1, '08:00', '16:00', true),
('eb5c9f0c-cedc-417f-bbc1-01607849c956', 2, '08:00', '16:00', true),
('eb5c9f0c-cedc-417f-bbc1-01607849c956', 3, '08:00', '16:00', true),
('eb5c9f0c-cedc-417f-bbc1-01607849c956', 4, '08:00', '16:00', true),
('eb5c9f0c-cedc-417f-bbc1-01607849c956', 6, '09:00', '12:00', true);

COMMIT;
