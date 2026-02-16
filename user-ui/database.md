# 🗄️ MyDermaLife Database Documentation

Complete PostgreSQL database schema, migrations, and seeding guide for the MyDermaLife dermatology platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Migrations](#migrations)
4. [Seeding](#seeding)
5. [Test Credentials](#test-credentials)
6. [Useful Queries](#useful-queries)

---

## Overview

### Database Engine
- **PostgreSQL** 14+
- **Extensions**: uuid-ossp, pgcrypto

### Key Features
- ✅ Guest checkout support
- ✅ Prescription management
- ✅ Video consultations
- ✅ E-commerce with inventory
- ✅ Doctor scheduling
- ✅ Payment processing
- ✅ Audit logging
- ✅ HIPAA compliance ready

---

## Database Setup

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mydermalife;

# Connect to database
\c mydermalife

# Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## Migrations

### File Structure

```
migrations/
├── 001_core_extensions.sql
├── 002_users_authentication.sql
├── 003_doctors.sql
├── 004_patients.sql
├── 005_consultations.sql
├── 006_prescriptions.sql
├── 007_products.sql
├── 008_shopping_cart.sql
├── 009_orders.sql
├── 010_payments.sql
├── 011_content.sql
├── 012_notifications.sql
├── 013_security.sql
├── 014_system.sql
└── 015_seed_data.sql
```

---

## Migration 001: Core Extensions and Functions

```sql
-- migrations/001_core_extensions.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to generate consultation number
CREATE OR REPLACE FUNCTION generate_consultation_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'CONS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('consultation_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Sequence for consultation numbers
CREATE SEQUENCE IF NOT EXISTS consultation_number_seq START 1;

-- Function to generate prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('prescription_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Sequence for prescription numbers
CREATE SEQUENCE IF NOT EXISTS prescription_number_seq START 1;

-- Function to generate guest tracking token
CREATE OR REPLACE FUNCTION generate_guest_tracking_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to check stock before order
CREATE OR REPLACE FUNCTION check_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    available_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO available_stock
    FROM products
    WHERE id = NEW.product_id;

    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products
        SET stock_quantity = stock_quantity - NEW.quantity,
            total_sales = total_sales + NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE products
        SET stock_quantity = stock_quantity + OLD.quantity - NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE products
        SET stock_quantity = stock_quantity + OLD.quantity,
            total_sales = total_sales - OLD.quantity
        WHERE id = OLD.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    )
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update doctor rating
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating IS NOT NULL THEN
        UPDATE doctors
        SET rating = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM consultations
            WHERE doctor_id = NEW.doctor_id AND rating IS NOT NULL
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM consultations
            WHERE doctor_id = NEW.doctor_id AND rating IS NOT NULL
        )
        WHERE id = NEW.doctor_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration 002: Users and Authentication

```sql
-- migrations/002_users_authentication.sql

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    failed_login_count INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT users_role_check CHECK (role IN ('patient', 'doctor', 'admin', 'super_admin')),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'banned', 'deleted'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    profile_photo VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT user_profiles_gender_check CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'))
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens(expires_at);
```

---

## Migration 003: Doctors

```sql
-- migrations/003_doctors.sql

-- Doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(200),
    years_of_experience INTEGER,
    bio TEXT,
    education JSONB,
    certifications JSONB,
    languages_spoken JSONB,
    consultation_fee DECIMAL(10,2),
    video_consultation_fee DECIMAL(10,2),
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_consultations INTEGER DEFAULT 0,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    is_available BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT doctors_verification_status_check CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    CONSTRAINT doctors_status_check CHECK (status IN ('active', 'inactive', 'on_leave')),
    CONSTRAINT doctors_rating_check CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_verification_status ON doctors(verification_status);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctors_is_available ON doctors(is_available);

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor documents
CREATE TABLE doctor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    expiry_date DATE,
    uploaded_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_documents_type_check CHECK (document_type IN ('license', 'certification', 'id', 'insurance'))
);

CREATE INDEX idx_doctor_documents_doctor_id ON doctor_documents(doctor_id);
CREATE INDEX idx_doctor_documents_verified ON doctor_documents(verified);

-- Doctor availability
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_availability_day_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT doctor_availability_time_check CHECK (start_time < end_time)
);

CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_day ON doctor_availability(day_of_week);

CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON doctor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor time off
CREATE TABLE doctor_time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_time_off_dates_check CHECK (start_date <= end_date)
);

CREATE INDEX idx_doctor_time_off_doctor_id ON doctor_time_off(doctor_id);
CREATE INDEX idx_doctor_time_off_dates ON doctor_time_off(start_date, end_date);
```

---

## Migration 004: Patients

```sql
-- migrations/004_patients.sql

-- Patient medical history
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    allergies JSONB,
    current_medications JSONB,
    past_conditions JSONB,
    family_history JSONB,
    skin_type VARCHAR(50),
    skin_concerns JSONB,
    blood_type VARCHAR(10),
    chronic_conditions JSONB,
    surgeries JSONB,
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT patient_medical_history_skin_type_check CHECK (skin_type IN ('normal', 'dry', 'oily', 'combination', 'sensitive'))
);

CREATE INDEX idx_patient_medical_history_patient_id ON patient_medical_history(patient_id);

CREATE TRIGGER update_patient_medical_history_updated_at BEFORE UPDATE ON patient_medical_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration 005: Consultations

```sql
-- migrations/005_consultations.sql

-- Consultations
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_consultation_number(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    chief_complaint TEXT,
    symptoms JSONB,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    video_call_url VARCHAR(500),
    video_recording_url VARCHAR(500),
    fee DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT consultations_type_check CHECK (consultation_type IN ('video', 'chat', 'in_person')),
    CONSTRAINT consultations_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT consultations_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    CONSTRAINT consultations_rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX idx_consultations_payment_status ON consultations(payment_status);

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update doctor rating
CREATE TRIGGER update_doctor_rating_trigger AFTER INSERT OR UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();

-- Trigger to increment doctor consultation count
CREATE OR REPLACE FUNCTION increment_doctor_consultations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE doctors
        SET total_consultations = total_consultations + 1
        WHERE id = NEW.doctor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_doctor_consultations_trigger AFTER UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION increment_doctor_consultations();

-- Consultation attachments
CREATE TABLE consultation_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT consultation_attachments_type_check CHECK (file_type IN ('image', 'document', 'lab_result'))
);

CREATE INDEX idx_consultation_attachments_consultation_id ON consultation_attachments(consultation_id);
```

---

## Migration 006: Prescriptions

```sql
-- migrations/006_prescriptions.sql

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_prescription_number(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    valid_until DATE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    refills_allowed INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    digital_signature VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT prescriptions_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'dispensed', 'expired'))
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prescription items
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INTEGER,
    quantity INTEGER,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);
```

---

## Migration 007: Products

```sql
-- migrations/007_products.sql

-- Product categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_parent ON product_categories(parent_category_id);
CREATE INDEX idx_product_categories_is_active ON product_categories(is_active);

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    requires_prescription BOOLEAN DEFAULT false,
    is_prescription_only BOOLEAN DEFAULT false,
    ingredients JSONB,
    usage_instructions TEXT,
    warnings TEXT,
    benefits JSONB,
    skin_types JSONB,
    conditions_treated JSONB,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    weight_grams INTEGER,
    dimensions JSONB,
    tags JSONB,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT products_price_check CHECK (price >= 0),
    CONSTRAINT products_stock_check CHECK (stock_quantity >= 0),
    CONSTRAINT products_rating_check CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Full text search index
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);

-- Product reviews
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT product_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT product_reviews_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update product rating
CREATE TRIGGER update_product_rating_trigger AFTER INSERT OR UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();
```

---

## Migration 008: Shopping Cart

```sql
-- migrations/008_shopping_cart.sql

-- Shopping carts (guest + registered)
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT check_cart_owner CHECK (user_id IS NOT NULL OR session_token IS NOT NULL)
);

CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_session_token ON shopping_carts(session_token);
CREATE INDEX idx_shopping_carts_expires_at ON shopping_carts(expires_at);

CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON shopping_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cart items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT cart_items_quantity_check CHECK (quantity > 0),
    UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration 009: Orders

```sql
-- migrations/009_orders.sql

-- Orders (supports guest checkout)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_order_number(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Guest customer info
    guest_email VARCHAR(255),
    guest_first_name VARCHAR(100),
    guest_last_name VARCHAR(100),
    guest_phone VARCHAR(50),

    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',

    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',

    coupon_code VARCHAR(50),
    notes TEXT,

    requires_prescription BOOLEAN DEFAULT false,
    prescription_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),

    -- Shipping address
    shipping_first_name VARCHAR(100),
    shipping_last_name VARCHAR(100),
    shipping_phone VARCHAR(50),
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),

    -- Billing address
    billing_first_name VARCHAR(100),
    billing_last_name VARCHAR(100),
    billing_phone VARCHAR(50),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_postal_code VARCHAR(20),

    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,

    -- Guest tracking token
    guest_tracking_token VARCHAR(500) UNIQUE DEFAULT generate_guest_tracking_token(),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT check_order_customer CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL),
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded'))
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_guest_email ON orders(guest_email);
CREATE INDEX idx_orders_guest_tracking_token ON orders(guest_tracking_token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Trigger to check stock before inserting order item
CREATE TRIGGER check_product_stock_trigger BEFORE INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION check_product_stock();

-- Trigger to update product stock when order is confirmed
CREATE OR REPLACE FUNCTION update_stock_on_order_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Deduct stock for all items in this order
        UPDATE products p
        SET stock_quantity = p.stock_quantity - oi.quantity,
            total_sales = p.total_sales + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    ELSIF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        -- Restore stock if order is cancelled
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

-- User addresses (for registered users)
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(50),
    full_name VARCHAR(200),
    phone VARCHAR(50),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT user_addresses_type_check CHECK (address_type IN ('shipping', 'billing', 'both'))
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(255),
    carrier VARCHAR(100),
    status VARCHAR(50) DEFAULT 'preparing',
    shipped_at TIMESTAMP,
    estimated_delivery DATE,
    delivered_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT shipments_status_check CHECK (status IN ('preparing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'))
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration 010: Payments

```sql
-- migrations/010_payments.sql

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(100),

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',

    status VARCHAR(50) DEFAULT 'pending',

    gateway_response JSONB,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),

    payment_date TIMESTAMP,
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMP,
    failure_reason TEXT,

    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT payments_method_check CHECK (payment_method IN ('card', 'mobile_money', 'bank_transfer', 'wallet', 'cash')),
    CONSTRAINT payments_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor payouts
CREATE TABLE doctor_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    total_consultations INTEGER DEFAULT 0,
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_payouts_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_doctor_payouts_doctor_id ON doctor_payouts(doctor_id);
CREATE INDEX idx_doctor_payouts_status ON doctor_payouts(status);
CREATE INDEX idx_doctor_payouts_period ON doctor_payouts(payout_period_start, payout_period_end);

CREATE TRIGGER update_doctor_payouts_updated_at BEFORE UPDATE ON doctor_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    times_used INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    applies_to VARCHAR(50) DEFAULT 'all',
    applicable_product_ids JSONB,
    applicable_category_ids JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('percentage', 'fixed_amount')),
    CONSTRAINT coupons_applies_to_check CHECK (applies_to IN ('all', 'specific_products', 'specific_categories'))
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Coupon usage
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);

-- Trigger to update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons
    SET times_used = times_used + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupon_usage_count_trigger AFTER INSERT ON coupon_usage
    FOR EACH ROW EXECUTE FUNCTION update_coupon_usage_count();
```

---

## Migration 011: Content

```sql
-- migrations/011_content.sql

-- Blog posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image VARCHAR(500),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    tags JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Full text search
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_active ON faqs(is_active);
CREATE INDEX idx_faqs_sort_order ON faqs(sort_order);

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(200),
    content TEXT NOT NULL,
    rating INTEGER,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX idx_testimonials_is_featured ON testimonials(is_featured);

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Skin conditions library
CREATE TABLE skin_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    symptoms TEXT,
    causes TEXT,
    treatments TEXT,
    prevention TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skin_conditions_slug ON skin_conditions(slug);
CREATE INDEX idx_skin_conditions_is_active ON skin_conditions(is_active);

CREATE TRIGGER update_skin_conditions_updated_at BEFORE UPDATE ON skin_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration 012: Notifications

```sql
-- migrations/012_notifications.sql

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    sent_via JSONB,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT notifications_type_check CHECK (type IN ('consultation', 'order', 'prescription', 'system', 'promotional'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Email queue
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    template_name VARCHAR(100),
    template_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'subscribed',
    subscribed_at TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('subscribed', 'unsubscribed'))
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
```

---

## Migration 013: Security

```sql
-- migrations/013_security.sql

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Access logs
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    status_code INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX idx_access_logs_endpoint ON access_logs(endpoint);

-- Security incidents
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT security_incidents_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_security_incidents_resolved ON security_incidents(resolved);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_created_at ON security_incidents(created_at DESC);
```

---

## Migration 014: System Settings

```sql
-- migrations/014_system.sql

-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(50),
    category VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT system_settings_data_type_check CHECK (data_type IN ('string', 'number', 'boolean', 'json'))
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin roles
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_roles_name ON admin_roles(name);

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin permissions
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_admin_permissions_user_id ON admin_permissions(user_id);
CREATE INDEX idx_admin_permissions_role_id ON admin_permissions(role_id);

-- Contact form submissions
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    responded_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT contact_submissions_status_check CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'))
);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Running Migrations

### Shell Script

Create `run_migrations.sh`:

```bash
#!/bin/bash
# run_migrations.sh

DB_NAME="mydermalife"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "Running PostgreSQL migrations for $DB_NAME..."

for migration in migrations/*.sql; do
    echo "Running $migration..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
    if [ $? -eq 0 ]; then
        echo "✓ $migration completed successfully"
    else
        echo "✗ $migration failed"
        exit 1
    fi
done

echo "All migrations completed successfully!"
```

### Usage

```bash
chmod +x run_migrations.sh
export DB_PASSWORD="your_password"
./run_migrations.sh
```

---

## Seeding

### File Structure

```
seeds/
├── 001_admin_and_roles.sql
├── 002_users_and_profiles.sql
├── 003_doctors.sql
├── 004_product_categories.sql
├── 005_products.sql
├── 006_content.sql
├── 007_coupons.sql
├── 008_sample_orders.sql
├── 009_consultations.sql
└── run_seeds.sh
```

### Seed 001: Admin and Roles

```sql
-- seeds/001_admin_and_roles.sql

BEGIN;

-- Insert admin roles
INSERT INTO admin_roles (id, name, description, permissions, is_system_role) VALUES
('00000000-0000-0000-0000-000000000001', 'super_admin', 'Full system access', '{"all": true}'::jsonb, true),
('00000000-0000-0000-0000-000000000002', 'admin', 'General admin access', '{"users": "manage", "products": "manage"}'::jsonb, true),
('00000000-0000-0000-0000-000000000003', 'moderator', 'Content moderation', '{"reviews": "moderate", "content": "moderate"}'::jsonb, true),
('00000000-0000-0000-0000-000000000004', 'pharmacist', 'Prescription verification', '{"prescriptions": "manage"}'::jsonb, true);

-- Insert system admin
INSERT INTO users (id, email, password_hash, role, email_verified, status) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@mydermalife.com', '$2b$10$YourHashedPasswordHere', 'super_admin', true, 'active');

INSERT INTO user_profiles (user_id, first_name, last_name, language) VALUES
('10000000-0000-0000-0000-000000000001', 'System', 'Administrator', 'en');

INSERT INTO admin_permissions (user_id, role_id, granted_by) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, category, is_public) VALUES
('site_name', 'MyDermaLife', 'string', 'general', true),
('currency', 'XAF', 'string', 'commerce', true),
('tax_rate', '19.25', 'number', 'commerce', false),
('free_shipping_threshold', '50000', 'number', 'commerce', true),
('enable_guest_checkout', 'true', 'boolean', 'commerce', true);

COMMIT;
```

### Run All Seeds Script

```bash
#!/bin/bash
# seeds/run_seeds.sh

DB_NAME="mydermalife"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "MyDermaLife Database Seeding"
echo "=============================="

seed_files=(
    "001_admin_and_roles.sql"
    "002_users_and_profiles.sql"
    "003_doctors.sql"
    "004_product_categories.sql"
    "005_products.sql"
    "006_content.sql"
    "007_coupons.sql"
    "008_sample_orders.sql"
    "009_consultations.sql"
)

for seed_file in "${seed_files[@]}"; do
    seed_path="seeds/$seed_file"

    if [ ! -f "$seed_path" ]; then
        echo "⚠ Warning: $seed_file not found"
        continue
    fi

    echo "Running $seed_file..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$seed_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $seed_file completed${NC}"
    else
        echo -e "${RED}✗ $seed_file failed${NC}"
        exit 1
    fi
done

echo ""
echo "All seeds completed successfully!"
```

---

## Test Credentials

### Admin Account
```
Email: admin@mydermalife.com
Password: Admin@123
Role: Super Admin
```

### Doctor Account
```
Email: sarah.ndiaye@mydermalife.com
Password: Doctor@123
Role: Doctor
```

### Patient Account
```
Email: aminata.kamara@email.com
Password: Patient@123
Role: Patient
```

### Coupon Codes
```
WELCOME10 - 10% off for new customers
FREESHIP - Free shipping over 30,000 XAF
SKINCARE20 - 20% off skincare products
CONSULT5000 - 5,000 XAF off first consultation
```

---

## Useful Queries

### Check All Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Count Records

```sql
SELECT
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_catalog.pg_class WHERE relname = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### View All Indexes

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Triggers

```sql
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Guest Orders Query

```sql
-- Find all guest orders
SELECT
    order_number,
    guest_email,
    guest_first_name || ' ' || guest_last_name as guest_name,
    status,
    total_amount,
    created_at
FROM orders
WHERE user_id IS NULL
ORDER BY created_at DESC;
```

### Low Stock Products

```sql
-- Products below threshold
SELECT
    name,
    sku,
    stock_quantity,
    low_stock_threshold
FROM products
WHERE stock_quantity <= low_stock_threshold
    AND is_active = true
ORDER BY stock_quantity ASC;
```

### Doctor Performance

```sql
-- Doctor consultation stats
SELECT
    u.email,
    up.first_name || ' ' || up.last_name as doctor_name,
    d.specialization,
    d.rating,
    d.total_consultations,
    d.total_reviews,
    COUNT(c.id) as completed_consultations
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN consultations c ON d.id = c.doctor_id AND c.status = 'completed'
GROUP BY u.email, up.first_name, up.last_name, d.specialization, d.rating, d.total_consultations, d.total_reviews
ORDER BY d.total_consultations DESC;
```

### Revenue Summary

```sql
-- Total revenue by period
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

---

## Backup and Restore

### Backup Database

```bash
pg_dump -U postgres -h localhost mydermalife > mydermalife_backup.sql
```

### Restore Database

```bash
psql -U postgres -h localhost mydermalife < mydermalife_backup.sql
```

---

## Notes

- **Currency**: All prices are in XAF (Central African CFA franc)
- **Tax Rate**: 19.25% (Cameroon VAT)
- **Free Shipping**: Orders over 50,000 XAF
- **Guest Checkout**: Fully supported with tracking tokens
- **HIPAA Compliance**: Medical data encrypted in JSONB fields
- **Audit Trails**: All critical actions logged

---

## Support

For issues or questions:
- **Email**: dev@mydermalife.com
- **Documentation**: Check inline SQL comments
- **GitHub**: [Repository URL]

---

**Last Updated**: January 2026
