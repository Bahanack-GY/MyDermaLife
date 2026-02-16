-- migrations/017_product_descriptions.sql
-- Replace single description column with short_description + long_description

BEGIN;

-- Rename description → long_description
ALTER TABLE products RENAME COLUMN description TO long_description;

-- Add short_description column
ALTER TABLE products ADD COLUMN short_description VARCHAR(500);

-- Drop old full-text search index
DROP INDEX IF EXISTS idx_products_search;

-- Rebuild full-text search index using both new columns
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('english', name || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(long_description, ''))
);

COMMIT;
