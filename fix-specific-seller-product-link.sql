-- Fix seller-product link for specific product
-- Run this in your Railway PostgreSQL console

-- The product and seller IDs from the error:
-- Product: prod_01KDZW4Z82TXHHCHFMY0MBRDRR
-- Seller:  mem_01KBN8XGXAA69D6R1ZZ7ZW8N8W

-- Step 1: Verify the product exists
SELECT 'STEP 1: Verify product exists' as step;
SELECT id, title, status FROM product WHERE id = 'prod_01KDZW4Z82TXHHCHFMY0MBRDRR';

-- Step 2: Verify the seller exists
SELECT 'STEP 2: Verify seller exists' as step;
SELECT id, name, email FROM seller WHERE id = 'mem_01KBN8XGXAA69D6R1ZZ7ZW8N8W';

-- Step 3: Check if link already exists
SELECT 'STEP 3: Check existing link' as step;
SELECT * FROM seller_product 
WHERE product_id = 'prod_01KDZW4Z82TXHHCHFMY0MBRDRR';

-- Step 4: Create the seller_product link
SELECT 'STEP 4: Creating seller_product link...' as step;

INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
VALUES (
  'selprod_' || substr(md5(random()::text), 1, 26),
  'mem_01KBN8XGXAA69D6R1ZZ7ZW8N8W',
  'prod_01KDZW4Z82TXHHCHFMY0MBRDRR',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Step 5: Verify the link was created
SELECT 'STEP 5: Verification' as step;
SELECT sp.*, s.name as seller_name, p.title as product_title
FROM seller_product sp
JOIN seller s ON sp.seller_id = s.id
JOIN product p ON sp.product_id = p.id
WHERE sp.product_id = 'prod_01KDZW4Z82TXHHCHFMY0MBRDRR';

SELECT 'Done! Product is now linked to seller.' as status;
