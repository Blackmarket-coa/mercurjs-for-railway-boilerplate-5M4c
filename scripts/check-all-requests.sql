-- ============================================
-- Check All Request Types in Database
-- ============================================
-- Run this script to see all request types and their details
-- Usage: psql "$DATABASE_URL" -f scripts/check-all-requests.sql

-- 1. Show table structure
\echo '=== Request Table Structure ==='
\d request

-- 2. Count all requests
\echo ''
\echo '=== Total Request Count ==='
SELECT COUNT(*) as total_requests FROM request;

-- 3. Request types breakdown
\echo ''
\echo '=== Request Types Breakdown ==='
SELECT
  type as request_type,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft
FROM request
GROUP BY type
ORDER BY count DESC;

-- 4. All seller requests
\echo ''
\echo '=== Seller Requests (Latest 5) ==='
SELECT
  id,
  status,
  data::jsonb->'seller'->>'name' as seller_name,
  data::jsonb->'member'->>'email' as member_email,
  data::jsonb->>'vendor_type' as vendor_type,
  created_at
FROM request
WHERE type = 'seller'
ORDER BY created_at DESC
LIMIT 5;

-- 5. All product requests
\echo ''
\echo '=== Product Requests (All) ==='
SELECT
  id,
  status,
  data::jsonb->>'product_name' as product_name,
  data::jsonb->>'product_id' as product_id,
  data::jsonb->>'description' as description,
  submitter_id,
  created_at
FROM request
WHERE type = 'product'
ORDER BY created_at DESC;

-- 6. Recent requests across all types
\echo ''
\echo '=== Recent Requests (All Types, Last 10) ==='
SELECT
  id,
  type,
  status,
  CASE
    WHEN type = 'seller' THEN data::jsonb->'seller'->>'name'
    WHEN type = 'product' THEN data::jsonb->>'product_name'
    ELSE 'N/A'
  END as name,
  created_at,
  updated_at
FROM request
ORDER BY created_at DESC
LIMIT 10;

-- 7. Status distribution across all requests
\echo ''
\echo '=== Status Distribution (All Requests) ==='
SELECT
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM request
GROUP BY status
ORDER BY count DESC;

-- 8. Sample data structure for each type
\echo ''
\echo '=== Sample Data Structure (One of Each Type) ==='
SELECT
  type,
  jsonb_pretty(data::jsonb) as data_structure
FROM (
  SELECT DISTINCT ON (type)
    type,
    data
  FROM request
  ORDER BY type, created_at DESC
) as samples;
