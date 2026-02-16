-- Migration: Add signature column to doctors table
-- Description: Adds a TEXT column to store doctor signatures for prescriptions

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS signature TEXT;
