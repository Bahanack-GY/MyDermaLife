-- seeds/001_admin_and_roles.sql

BEGIN;

-- Insert admin roles
INSERT INTO admin_roles (id, name, description, permissions, is_system_role) VALUES
('e1afae61-437a-4ebb-982a-3ccf36b65923', 'super_admin', 'Full system access', '{"all": true}'::jsonb, true),
('453ddd7b-e69e-484d-91db-5c3771176923', 'admin', 'General admin access', '{"users": "manage", "products": "manage", "orders": "manage"}'::jsonb, true),
('48564469-3238-4c5a-af2d-3aaa1de10edc', 'moderator', 'Content moderation', '{"reviews": "moderate", "content": "moderate"}'::jsonb, true),
('53be14df-a13c-4a30-a7e0-b5d750a77a73', 'pharmacist', 'Prescription verification', '{"prescriptions": "manage", "orders": "view"}'::jsonb, true);

-- Insert system admin (password: Admin@123)
INSERT INTO users (id, email, phone, password_hash, role, email_verified, status) VALUES
('bfc877a5-ac1d-4e71-aba7-ca2b184ca03c', 'admin@mydermalife.com', '+237600000000', '$2b$10$Iae3BIpcmSWnfIA5MV/wg.SVJ783wVhnkcp3dhaDcC3xkp8Kvxb7K', 'super_admin', true, 'active');

INSERT INTO user_profiles (user_id, first_name, last_name, language, country) VALUES
('bfc877a5-ac1d-4e71-aba7-ca2b184ca03c', 'System', 'Administrator', 'en', 'Cameroon');

INSERT INTO admin_permissions (user_id, role_id, granted_by) VALUES
('bfc877a5-ac1d-4e71-aba7-ca2b184ca03c', 'e1afae61-437a-4ebb-982a-3ccf36b65923', 'bfc877a5-ac1d-4e71-aba7-ca2b184ca03c');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, category, description, is_public) VALUES
('site_name', 'MyDermaLife', 'string', 'general', 'Website name', true),
('site_description', 'Your trusted dermatology platform', 'string', 'general', 'Website description', true),
('currency', 'XAF', 'string', 'commerce', 'Default currency', true),
('currency_symbol', 'FCFA', 'string', 'commerce', 'Currency symbol', true),
('tax_rate', '19.25', 'number', 'commerce', 'Tax rate percentage (Cameroon VAT)', false),
('free_shipping_threshold', '50000', 'number', 'commerce', 'Minimum order for free shipping', true),
('enable_guest_checkout', 'true', 'boolean', 'commerce', 'Allow guest checkout', true),
('consultation_duration_minutes', '30', 'number', 'consultations', 'Default consultation duration', false),
('platform_fee_percentage', '15', 'number', 'payments', 'Platform fee for doctor payouts', false),
('support_email', 'support@mydermalife.com', 'string', 'contact', 'Support email address', true),
('support_phone', '+237600000001', 'string', 'contact', 'Support phone number', true);

COMMIT;
