-- migrations/021_delivery_role.sql
-- Add delivery + catalog_manager roles and extend shipments table for Lis Course integration

-- Add new roles to users role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('patient', 'doctor', 'admin', 'super_admin', 'delivery', 'catalog_manager'));

-- Add new columns to shipments for delivery management
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS assigned_driver UUID REFERENCES users(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS proof_of_delivery_url VARCHAR(500);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_shipments_assigned_driver ON shipments(assigned_driver);
