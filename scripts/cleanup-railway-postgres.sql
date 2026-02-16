-- =============================================================================
-- FreeBlackMarket.com - Railway PostgreSQL Targeted Cleanup
-- =============================================================================
--
-- PURPOSE: Remove orphaned tables from removed plugins/modules while
--          preserving all active data. After running this, run
--          `medusa db:migrate` to create tables for new modules.
--
-- USAGE (PowerShell):
--   $env:PGPASSWORD="<password>"
--   psql -h <host> -U postgres -p <port> -d railway -f scripts/cleanup-railway-postgres.sql
--
-- USAGE (Bash):
--   PGPASSWORD=<password> psql -h <host> -U postgres -p <port> -d railway \
--     -f scripts/cleanup-railway-postgres.sql
--
-- This script is SAFE for production — it only drops tables that have no
-- corresponding code in the current repository.
--
-- =============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Drop tables from removed @mercurjs/requests plugin
-- ============================================================================
-- The @mercurjs/requests plugin was removed from medusa-config.ts and replaced
-- with a custom Request module at ./src/modules/request. These tables are
-- orphaned and not referenced anywhere in the codebase.

\echo '=== PHASE 1: Dropping removed @mercurjs/requests tables ==='

DROP TABLE IF EXISTS order_return_request_line_item CASCADE;
DROP TABLE IF EXISTS order_return_request CASCADE;

-- Link tables that referenced the removed request tables
DROP TABLE IF EXISTS order_return_order_return_request_order_order CASCADE;
DROP TABLE IF EXISTS seller_seller_order_return_order_return_request CASCADE;

\echo 'Done: removed @mercurjs/requests tables dropped.'

-- ============================================================================
-- PHASE 2: Drop old Mercur attribute tables (replaced by cms-blueprint)
-- ============================================================================
-- The old @mercurjs/b2c-core attribute system is unused. The custom
-- cms-blueprint module (cms_attribute, cms_category, etc.) replaces it.
-- No code in src/ references these tables.

\echo ''
\echo '=== PHASE 2: Dropping old Mercur attribute tables ==='

DROP TABLE IF EXISTS product_product_attribute_attribute_value CASCADE;
DROP TABLE IF EXISTS product_product_category_attribute_attribute CASCADE;
DROP TABLE IF EXISTS attribute_value CASCADE;
DROP TABLE IF EXISTS attribute_possible_value CASCADE;
DROP TABLE IF EXISTS attribute CASCADE;

\echo 'Done: old attribute tables dropped.'

-- ============================================================================
-- PHASE 3: Drop old Mercur secondary_category tables (unused)
-- ============================================================================
-- No code in src/ references secondary_category. Product categories are
-- handled by Medusa core product_category + cms-blueprint.

\echo ''
\echo '=== PHASE 3: Dropping old secondary_category tables ==='

DROP TABLE IF EXISTS product_product_secondary_category_secondary_category CASCADE;
DROP TABLE IF EXISTS secondary_category CASCADE;

\echo 'Done: old secondary_category tables dropped.'

-- ============================================================================
-- PHASE 4: Drop old Mercur tax_code link table (unused)
-- ============================================================================
-- No code in src/ references the product-category-to-tax-code link.
-- Tax handling uses Medusa core tax_rate / tax_region.

\echo ''
\echo '=== PHASE 4: Dropping old tax_code link table ==='

DROP TABLE IF EXISTS product_product_category_taxcode_tax_code CASCADE;
DROP TABLE IF EXISTS tax_code CASCADE;

\echo 'Done: old tax_code tables dropped.'

-- ============================================================================
-- PHASE 5: Drop old Mercur wishlist tables (replaced by shopper_wishlist)
-- ============================================================================
-- The custom wishlist module creates shopper_wishlist + shopper_wishlist_item.
-- The old Mercur "wishlist" table is orphaned.

\echo ''
\echo '=== PHASE 5: Dropping old Mercur wishlist tables ==='

DROP TABLE IF EXISTS customer_customer_wishlist_wishlist CASCADE;
DROP TABLE IF EXISTS wishlist_wishlist_product_product CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;

\echo 'Done: old wishlist tables dropped.'

-- ============================================================================
-- PHASE 6: Drop old Mercur vendor_type table (replaced by vendor_type_enum)
-- ============================================================================
-- The seller-extension module uses vendor_type_enum (PostgreSQL enum) on the
-- seller_metadata table. The standalone vendor_type TABLE is from old Mercur
-- and is not referenced in the codebase.

\echo ''
\echo '=== PHASE 6: Dropping old vendor_type table ==='

DROP TABLE IF EXISTS vendor_type CASCADE;

\echo 'Done: old vendor_type table dropped.'

-- ============================================================================
-- PHASE 7: Drop old Mercur configuration_rule table (unused)
-- ============================================================================
-- No code in src/ references configuration_rule. Commission handling uses
-- the commission_rule / commission_rate tables from @mercurjs/commission.

\echo ''
\echo '=== PHASE 7: Dropping old configuration_rule table ==='

DROP TABLE IF EXISTS configuration_rule CASCADE;

\echo 'Done: old configuration_rule table dropped.'

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
--
-- Dropped orphaned tables from:
--   1. Removed @mercurjs/requests plugin (4 tables)
--   2. Old Mercur attribute system, replaced by cms-blueprint (5 tables)
--   3. Old Mercur secondary_category, unused (2 tables)
--   4. Old Mercur tax_code link, unused (2 tables)
--   5. Old Mercur wishlist, replaced by shopper_wishlist (3 tables)
--   6. Old Mercur vendor_type table, replaced by vendor_type_enum (1 table)
--   7. Old Mercur configuration_rule, unused (1 table)
--
-- Total: 18 orphaned tables removed.
-- All active data (orders, products, sellers, etc.) is preserved.
--
-- NEXT STEPS:
--   Run migrations to create tables for new modules:
--
--   cd backend
--   pnpm exec medusa db:migrate --execute-safe-links
--
--   This will create ~30 new tables for these modules:
--     - governance (garden_proposal, garden_vote, garden_role, ...)
--     - harvest (garden_harvest, garden_harvest_claim, ...)
--     - harvest-batches (harvest_batch, seasonal_product, ...)
--     - impact-metrics (buyer_impact, producer_impact, ...)
--     - payout-breakdown (payout_config, seller_payout_settings, ...)
--     - season (garden_season, garden_growing_plan, ...)
--     - vendor-rules (vendor_rules, fulfillment_window, ...)
--     - vendor-verification (vendor_verification, vendor_badge, ...)
--     - volunteer (garden_work_party, volunteer_log, ...)
--
-- ============================================================================
