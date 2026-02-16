-- migrations/018_product_brand_name.sql
-- Add brand_name column to products

BEGIN;

ALTER TABLE products ADD COLUMN brand_name VARCHAR(200);

COMMIT;
