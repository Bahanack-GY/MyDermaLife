-- migrations/019_cart_share_token.sql

ALTER TABLE shopping_carts ADD COLUMN IF NOT EXISTS share_token VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_shopping_carts_share_token ON shopping_carts(share_token);
