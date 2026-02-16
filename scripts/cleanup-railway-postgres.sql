-- =============================================================================
-- FreeBlackMarket.com - Railway PostgreSQL Cleanup Script
-- =============================================================================
--
-- PURPOSE: Drop all user-created tables, types, and sequences so that
--          `medusa db:migrate` can recreate everything from the current
--          codebase migrations. This ensures the database schema matches
--          the repository exactly.
--
-- USAGE:
--   # Direct psql execution:
--   PGPASSWORD=<password> psql -h <host> -U postgres -p <port> -d railway -f scripts/cleanup-railway-postgres.sql
--
--   # Or use the companion shell script:
--   ./scripts/cleanup-railway-postgres.sh
--
-- WARNING: This script DROPS ALL DATA. Back up first!
--   ./scripts/backup-db.sh --compress
--
-- =============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Drop all tables in public schema
-- ============================================================================
-- This uses a dynamic query to drop every table, handling dependencies
-- automatically with CASCADE.

DO $$
DECLARE
    _tbl text;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 1: Dropping all tables ===';

    FOR _tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', _tbl);
        _count := _count + 1;
        RAISE NOTICE 'Dropped table: %', _tbl;
    END LOOP;

    RAISE NOTICE 'Dropped % tables total.', _count;
END $$;

-- ============================================================================
-- PHASE 2: Drop all custom enum types in public schema
-- ============================================================================
-- Drops every user-defined ENUM type. Medusa migrations will recreate them.

DO $$
DECLARE
    _type text;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 2: Dropping all custom enum types ===';

    FOR _type IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.typtype = 'e'
        ORDER BY t.typname
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', _type);
        _count := _count + 1;
        RAISE NOTICE 'Dropped type: %', _type;
    END LOOP;

    RAISE NOTICE 'Dropped % enum types total.', _count;
END $$;

-- ============================================================================
-- PHASE 3: Drop all custom composite types in public schema
-- ============================================================================

DO $$
DECLARE
    _type text;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 3: Dropping composite types ===';

    FOR _type IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.typtype = 'c'
          AND NOT EXISTS (
              SELECT 1 FROM pg_class c
              WHERE c.relname = t.typname AND c.relkind IN ('r', 'v', 'm')
          )
        ORDER BY t.typname
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', _type);
        _count := _count + 1;
        RAISE NOTICE 'Dropped composite type: %', _type;
    END LOOP;

    RAISE NOTICE 'Dropped % composite types total.', _count;
END $$;

-- ============================================================================
-- PHASE 4: Drop all sequences in public schema
-- ============================================================================

DO $$
DECLARE
    _seq text;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 4: Dropping all sequences ===';

    FOR _seq IN
        SELECT sequencename
        FROM pg_sequences
        WHERE schemaname = 'public'
        ORDER BY sequencename
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', _seq);
        _count := _count + 1;
        RAISE NOTICE 'Dropped sequence: %', _seq;
    END LOOP;

    RAISE NOTICE 'Dropped % sequences total.', _count;
END $$;

-- ============================================================================
-- PHASE 5: Drop all functions in public schema
-- ============================================================================

DO $$
DECLARE
    _func record;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 5: Dropping all user functions ===';

    FOR _func IN
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prokind IN ('f', 'p')  -- functions and procedures
        ORDER BY p.proname
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', _func.proname, _func.args);
        _count := _count + 1;
        RAISE NOTICE 'Dropped function: %(%)', _func.proname, _func.args;
    END LOOP;

    RAISE NOTICE 'Dropped % functions total.', _count;
END $$;

-- ============================================================================
-- PHASE 6: Drop all views in public schema
-- ============================================================================

DO $$
DECLARE
    _view text;
    _count int := 0;
BEGIN
    RAISE NOTICE '=== PHASE 6: Dropping all views ===';

    FOR _view IN
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
        ORDER BY viewname
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', _view);
        _count := _count + 1;
        RAISE NOTICE 'Dropped view: %', _view;
    END LOOP;

    RAISE NOTICE 'Dropped % views total.', _count;
END $$;

COMMIT;

-- ============================================================================
-- DONE
-- ============================================================================
-- The database is now empty. Run migrations to recreate the schema:
--
--   cd backend && pnpm exec medusa db:migrate --execute-safe-links
--
-- Then optionally seed:
--
--   cd backend && pnpm seed
-- ============================================================================
