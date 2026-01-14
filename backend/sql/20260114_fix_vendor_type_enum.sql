-- Migration: Normalize vendor_type values and recreate vendor_type_enum
-- Filename: backend/sql/20260114_fix_vendor_type_enum.sql

BEGIN;

-- 1) Convert vendor_type to text so we can safely rewrite values
ALTER TABLE seller_metadata ALTER COLUMN vendor_type TYPE TEXT USING vendor_type::text;

-- 2) Map legacy/uppercase values to canonical lowercase values
UPDATE seller_metadata
SET vendor_type = CASE
  WHEN UPPER(vendor_type) = 'FARM' THEN 'producer'
  WHEN UPPER(vendor_type) = 'DISTRIBUTOR' THEN 'producer'
  WHEN UPPER(vendor_type) = 'CREATOR' THEN 'maker'
  WHEN UPPER(vendor_type) = 'RETAIL' THEN 'maker'
  ELSE lower(vendor_type)
END;

-- 3) Recreate the Postgres enum with canonical entries
DROP TYPE IF EXISTS vendor_type_enum CASCADE;
CREATE TYPE vendor_type_enum AS ENUM (
  'producer',
  'garden',
  'kitchen',
  'maker',
  'restaurant',
  'mutual_aid'
);

-- 4) Convert column back to enum and set default
ALTER TABLE seller_metadata ALTER COLUMN vendor_type TYPE vendor_type_enum USING vendor_type::vendor_type_enum;
ALTER TABLE seller_metadata ALTER COLUMN vendor_type SET DEFAULT 'producer';

COMMIT;

-- NOTE: This migration is destructive to the previous enum type but preserves
-- string values by mapping them first to the canonical set. Review backups
-- or run inside a transaction in staging before production.
