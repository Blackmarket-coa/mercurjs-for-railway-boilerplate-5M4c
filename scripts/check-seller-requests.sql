-- ============================================
-- Check Seller Requests in Database
-- ============================================
-- Run this script to verify seller requests exist and see their structure
-- Usage: psql "$DATABASE_URL" -f scripts/check-seller-requests.sql

-- 1. Show table structure
\echo '=== Request Table Structure ==='
\d request

-- 2. Count all requests
\echo ''
\echo '=== Total Request Count ==='
SELECT COUNT(*) as total_requests FROM request;

-- 3. Count seller creation requests
\echo ''
\echo '=== Seller Creation Requests Count ==='
SELECT COUNT(*) as seller_requests
FROM request
WHERE type = 'seller';

-- 4. Breakdown by status
\echo ''
\echo '=== Seller Requests by Status ==='
SELECT
  status,
  COUNT(*) as count
FROM request
WHERE type = 'seller'
GROUP BY status
ORDER BY status;

-- 5. View latest 10 seller requests with details
\echo ''
\echo '=== Latest 10 Seller Requests ==='
SELECT
  id,
  type as request_type,
  status,
  data::jsonb->'seller'->>'name' as seller_name,
  data::jsonb->'member'->>'email' as member_email,
  data::jsonb->'member'->>'name' as member_name,
  data::jsonb->>'vendor_type' as vendor_type,
  submitter_id,
  reviewer_id,
  reviewer_note,
  created_at,
  updated_at
FROM request
WHERE type = 'seller'
ORDER BY created_at DESC
LIMIT 10;

-- 6. View all request types (to see what other types exist)
\echo ''
\echo '=== All Request Types ==='
SELECT DISTINCT
  type as request_type,
  COUNT(*) as count
FROM request
GROUP BY type
ORDER BY count DESC;

-- 7. Sample data structure (first seller request)
\echo ''
\echo '=== Sample Data Structure ==='
SELECT
  id,
  type,
  jsonb_pretty(data::jsonb) as data_structure
FROM request
WHERE type = 'seller'
ORDER BY created_at DESC
LIMIT 1;
