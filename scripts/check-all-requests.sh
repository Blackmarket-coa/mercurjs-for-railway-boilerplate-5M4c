#!/bin/bash

# ============================================
# Check All Request Types in Railway Database
# ============================================
# This script shows all request types and their details
#
# Usage:
#   DATABASE_URL="postgresql://user:pass@host:port/dbname" ./check-all-requests.sh
#   Or:
#   ./check-all-requests.sh "postgresql://user:pass@host:port/dbname"

# Get database URL from environment variable or command line argument
DB_URL="${1:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "Error: No database URL provided."
  echo ""
  echo "Usage:"
  echo "  DATABASE_URL=\"postgresql://user:pass@host:port/dbname\" $0"
  echo "  Or:"
  echo "  $0 \"postgresql://user:pass@host:port/dbname\""
  exit 1
fi

echo "=========================================="
echo "Checking All Request Types"
echo "=========================================="
echo ""

# Run the SQL script if it exists
if [ -f "$(dirname "$0")/check-all-requests.sql" ]; then
  psql "$DB_URL" -f "$(dirname "$0")/check-all-requests.sql"
else
  # Run inline queries if script file not found
  echo "Running inline queries..."

  echo "--- Total Requests ---"
  psql "$DB_URL" -c "SELECT COUNT(*) as total_requests FROM request;"

  echo ""
  echo "--- Request Types Breakdown ---"
  psql "$DB_URL" -c "
    SELECT
      type as request_type,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
    FROM request
    GROUP BY type
    ORDER BY count DESC;
  "

  echo ""
  echo "--- Latest 5 Seller Requests ---"
  psql "$DB_URL" -c "
    SELECT
      id,
      status,
      data::jsonb->'seller'->>'name' as seller_name,
      data::jsonb->'member'->>'email' as member_email,
      created_at
    FROM request
    WHERE type = 'seller'
    ORDER BY created_at DESC
    LIMIT 5;
  "

  echo ""
  echo "--- All Product Requests ---"
  psql "$DB_URL" -c "
    SELECT
      id,
      status,
      data::jsonb->>'product_name' as product_name,
      created_at
    FROM request
    WHERE type = 'product'
    ORDER BY created_at DESC;
  "

  echo ""
  echo "--- Recent Requests (All Types) ---"
  psql "$DB_URL" -c "
    SELECT
      id,
      type,
      status,
      created_at
    FROM request
    ORDER BY created_at DESC
    LIMIT 10;
  "
fi

echo ""
echo "=========================================="
echo "Done!"
echo "=========================================="
