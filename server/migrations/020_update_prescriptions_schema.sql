-- Add missing columns to prescriptions table to match Sequelize model
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT NOW();
