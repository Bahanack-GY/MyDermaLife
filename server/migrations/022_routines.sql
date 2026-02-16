-- migrations/022_routines.sql

-- Drop old product-linked routines
DROP TABLE IF EXISTS product_routines CASCADE;

-- Standalone routines
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_routines_slug ON routines(slug);
CREATE INDEX idx_routines_is_active ON routines(is_active);

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Routine-product join table
CREATE TABLE IF NOT EXISTS routine_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_routine_product UNIQUE (routine_id, product_id)
);

CREATE INDEX idx_routine_products_routine_id ON routine_products(routine_id);
CREATE INDEX idx_routine_products_product_id ON routine_products(product_id);

CREATE TRIGGER update_routine_products_updated_at BEFORE UPDATE ON routine_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
