-- migrations/015_product_routines.sql

-- Product routines (complementary products for "Complete Your Routine")
CREATE TABLE IF NOT EXISTS product_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    complement_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_product_routine_complement UNIQUE (product_id, complement_product_id),
    CONSTRAINT chk_no_self_reference CHECK (product_id <> complement_product_id)
);

CREATE INDEX idx_product_routines_product_id ON product_routines(product_id);
CREATE INDEX idx_product_routines_complement_product_id ON product_routines(complement_product_id);

CREATE TRIGGER update_product_routines_updated_at BEFORE UPDATE ON product_routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
