#!/bin/bash
# This script connects to your Railway PostgreSQL and creates seller_product associations
# Usage: ./seed-seller-products.sh

set -e

# Railway PostgreSQL connection details (update these)
export PGPASSWORD="epbRzOLNGekBgJqLgMpTYruMcfLVjkfi"
PGHOST="nozomi.proxy.rlwy.net"
PGPORT="21341"
PGUSER="postgres"
PGDATABASE="railway"

echo "Connecting to Railway PostgreSQL..."

# Step 1: Find sellers
echo ""
echo "=== Available Sellers ==="
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "SELECT id, name, email FROM seller LIMIT 10;"

# Step 2: Find orphaned products (ticket products without seller association)
echo ""
echo "=== Orphaned Ticket Products ==="
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "
SELECT p.id, p.title 
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL
LIMIT 20;
"

# Step 3: Count orphaned products
echo ""
echo "=== Count of Orphaned Products ==="
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "
SELECT COUNT(*) as orphaned_ticket_products
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL;
"

echo ""
echo "To automatically link all orphaned products to the first seller, run:"
echo "psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c \"$(cat << 'SQL'
INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
SELECT 
  'selprod_' || substr(md5(random()::text || p.id), 1, 26),
  (SELECT id FROM seller ORDER BY created_at ASC LIMIT 1),
  p.id,
  NOW(),
  NOW()
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL
ON CONFLICT DO NOTHING;
SQL
)\""

