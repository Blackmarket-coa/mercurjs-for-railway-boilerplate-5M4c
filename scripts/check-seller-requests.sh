#!/bin/bash

# ============================================
# Check Seller Requests in Railway Database
# ============================================
# This script connects to the Railway PostgreSQL database and checks for seller requests
#
# Usage:
#   DATABASE_URL="postgresql://user:pass@host:port/dbname" ./check-seller-requests.sh
#   Or:
#   ./check-seller-requests.sh "postgresql://user:pass@host:port/dbname"

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

echo "=================================="
echo "Checking Seller Requests"
echo "=================================="
echo ""

# Run the SQL script
if [ -f "$(dirname "$0")/check-seller-requests.sql" ]; then
  psql "$DB_URL" -f "$(dirname "$0")/check-seller-requests.sql"
else
  # Run inline queries if script file not found
  echo "Running inline queries..."

  echo "--- Total Requests ---"
  psql "$DB_URL" -c "SELECT COUNT(*) as total_requests FROM request;"

  echo ""
  echo "--- Seller Creation Requests Count ---"
  psql "$DB_URL" -c "SELECT COUNT(*) as seller_requests FROM request WHERE type = 'seller';"

  echo ""
  echo "--- Seller Requests by Status ---"
  psql "$DB_URL" -c "SELECT status, COUNT(*) as count FROM request WHERE type = 'seller' GROUP BY status ORDER BY status;"

  echo ""
  echo "--- Latest 5 Seller Requests ---"
  psql "$DB_URL" -c "
    SELECT
      id,
      type as request_type,
      status,
      data::jsonb->'seller'->>'name' as seller_name,
      data::jsonb->'member'->>'email' as member_email,
      data::jsonb->>'vendor_type' as vendor_type,
      created_at
    FROM request
    WHERE type = 'seller'
    ORDER BY created_at DESC
    LIMIT 5;
  "
fi

echo ""
echo "=================================="
echo "Done!"
echo "=================================="
