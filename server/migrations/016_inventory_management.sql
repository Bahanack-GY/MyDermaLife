-- migrations/016_inventory_management.sql
-- Inventory Management System: warehouses, stock tracking, suppliers, purchase orders

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE movement_type AS ENUM (
    'purchase_order_received',
    'sale',
    'return',
    'adjustment',
    'transfer_in',
    'transfer_out'
);

CREATE TYPE movement_direction AS ENUM ('in', 'out');

CREATE TYPE reference_type AS ENUM (
    'purchase_order',
    'order',
    'transfer',
    'adjustment',
    'return'
);

CREATE TYPE po_status AS ENUM (
    'draft',
    'submitted',
    'confirmed',
    'partially_received',
    'received',
    'cancelled'
);

-- =============================================
-- WAREHOUSES
-- =============================================

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_country ON warehouses(country);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- WAREHOUSE STOCK
-- =============================================

CREATE TABLE warehouse_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_warehouse_product UNIQUE (warehouse_id, product_id),
    CONSTRAINT warehouse_stock_quantity_check CHECK (quantity >= 0)
);

CREATE INDEX idx_warehouse_stock_warehouse_id ON warehouse_stock(warehouse_id);
CREATE INDEX idx_warehouse_stock_product_id ON warehouse_stock(product_id);
CREATE INDEX idx_warehouse_stock_quantity ON warehouse_stock(quantity);

CREATE TRIGGER update_warehouse_stock_updated_at BEFORE UPDATE ON warehouse_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STOCK MOVEMENTS (immutable audit log)
-- =============================================

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    movement_type movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    direction movement_direction NOT NULL,
    reference_type reference_type,
    reference_id UUID,
    reason TEXT,
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_performed_by ON stock_movements(performed_by);

-- =============================================
-- SUPPLIERS
-- =============================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(200),
    website VARCHAR(500),
    payment_terms VARCHAR(200),
    lead_time_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_country ON suppliers(country);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_deleted_at ON suppliers(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUPPLIER PRODUCTS
-- =============================================

CREATE TABLE supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_sku VARCHAR(100),
    cost_price DECIMAL(10,2),
    lead_time_days INTEGER,
    min_order_quantity INTEGER DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_supplier_product UNIQUE (supplier_id, product_id)
);

CREATE INDEX idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_product_id ON supplier_products(product_id);

CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON supplier_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PURCHASE ORDER NUMBER SEQUENCE
-- =============================================

CREATE SEQUENCE po_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS VARCHAR AS $$
BEGIN
    RETURN 'PO-' || LPAD(nextval('po_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PURCHASE ORDERS
-- =============================================

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_po_number(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status po_status DEFAULT 'draft',
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    received_date DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'XAF',
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_warehouse_id ON purchase_orders(warehouse_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at DESC);

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PURCHASE ORDER ITEMS
-- =============================================

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT po_items_qty_ordered_check CHECK (quantity_ordered > 0),
    CONSTRAINT po_items_qty_received_check CHECK (quantity_received >= 0)
);

CREATE INDEX idx_po_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product_id ON purchase_order_items(product_id);

CREATE TRIGGER update_po_items_updated_at BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- UPDATE ORDER STOCK TRIGGER (warehouse-aware)
-- =============================================

-- Drop old trigger and function
DROP TRIGGER IF EXISTS update_stock_on_order_status_trigger ON orders;
DROP FUNCTION IF EXISTS update_stock_on_order_status();

-- New warehouse-aware version that also updates products.stock_quantity for backward compat
CREATE OR REPLACE FUNCTION update_stock_on_order_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Deduct stock from products table (backward compatibility)
        UPDATE products p
        SET stock_quantity = p.stock_quantity - oi.quantity,
            total_sales = p.total_sales + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    ELSIF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        -- Restore stock in products table (backward compatibility)
        UPDATE products p
        SET stock_quantity = p.stock_quantity + oi.quantity,
            total_sales = p.total_sales - oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_order_status_trigger AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_stock_on_order_status();
