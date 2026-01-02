-- Railway PostgreSQL Script to link orphaned ticket products to sellers
-- Run this in your Railway PostgreSQL console
-- NOTE: MercurJS uses table name "seller_seller_product_product" (not "seller_product")

-- Step 1: See what sellers exist
SELECT 'STEP 1: Sellers in System' as step;
SELECT id, name, email FROM seller LIMIT 10;

-- Step 2: See orphaned ticket products
SELECT 'STEP 2: Orphaned Ticket Products (no seller link)' as step;
SELECT p.id, p.title, tp.venue_id
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_seller_product_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL
LIMIT 20;

-- Step 3: Count how many
SELECT 'STEP 3: Count of Orphaned Products' as step;
SELECT COUNT(*) as orphaned_count
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_seller_product_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL;

-- Step 4: Create the associations (links all orphaned ticket products to the first/oldest seller)
SELECT 'STEP 4: Creating seller_seller_product_product associations...' as step;

INSERT INTO seller_seller_product_product (id, seller_id, product_id, created_at, updated_at)
SELECT 
  'selprod_' || substr(md5(random()::text || p.id), 1, 26),
  (SELECT id FROM seller ORDER BY created_at ASC LIMIT 1),
  p.id,
  NOW(),
  NOW()
FROM product p
INNER JOIN ticket_product tp ON p.id = tp.product_id
LEFT JOIN seller_seller_product_product sp ON p.id = sp.product_id
WHERE sp.id IS NULL
ON CONFLICT DO NOTHING;

-- Step 5: Verify it worked
SELECT 'STEP 5: Verification - Linked products' as step;
SELECT COUNT(*) as newly_linked_products
FROM seller_seller_product_product 
WHERE id LIKE 'selprod_%'
AND created_at > NOW() - INTERVAL '1 minute';

SELECT 'Done! All orphaned ticket products are now linked to sellers.' as status;
