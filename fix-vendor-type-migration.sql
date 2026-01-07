-- Migration to fix vendor_type enum values and add missing columns
-- Run this on your Railway PostgreSQL database

-- Step 1: Add missing columns first
ALTER TABLE "seller_metadata"
ADD COLUMN IF NOT EXISTS "social_links" JSONB NULL,
ADD COLUMN IF NOT EXISTS "storefront_links" JSONB NULL,
ADD COLUMN IF NOT EXISTS "website_url" TEXT NULL;

-- Step 2: Convert vendor_type column to text temporarily
ALTER TABLE "seller_metadata"
ALTER COLUMN "vendor_type" TYPE TEXT;

-- Step 3: Drop the old enum type
DROP TYPE IF EXISTS "vendor_type_enum";

-- Step 4: Create new enum with correct lowercase values
CREATE TYPE "vendor_type_enum" AS ENUM (
  'producer',
  'garden',
  'maker',
  'restaurant',
  'mutual_aid'
);

-- Step 5: Update existing data to use new lowercase values
-- Map: FARM -> producer, RESTAURANT -> restaurant, RETAIL -> maker,
--      CREATOR -> maker, DISTRIBUTOR -> producer
UPDATE "seller_metadata"
SET "vendor_type" = CASE
  WHEN UPPER("vendor_type") = 'FARM' THEN 'producer'
  WHEN UPPER("vendor_type") = 'RESTAURANT' THEN 'restaurant'
  WHEN UPPER("vendor_type") = 'RETAIL' THEN 'maker'
  WHEN UPPER("vendor_type") = 'CREATOR' THEN 'maker'
  WHEN UPPER("vendor_type") = 'DISTRIBUTOR' THEN 'producer'
  ELSE 'producer'
END;

-- Step 6: Convert column back to enum with new type
ALTER TABLE "seller_metadata"
ALTER COLUMN "vendor_type" TYPE vendor_type_enum
USING "vendor_type"::vendor_type_enum,
ALTER COLUMN "vendor_type" SET DEFAULT 'producer';

-- Verify the changes
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_metadata'
ORDER BY ordinal_position;
