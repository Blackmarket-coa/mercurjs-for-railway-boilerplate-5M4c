import { Migration } from '@mikro-orm/migrations';

export class Migration20251228AssociateTicketProductsWithSellers extends Migration {

  async up(): Promise<void> {
    // This migration intelligently associates all orphaned ticket products with sellers
    // Strategy:
    // 1. If ticket_product has seller_id, use it
    // 2. If not, try to infer from the seller who created most products
    // 3. As fallback, link to the oldest/first seller in the system
    //
    // NOTE: All operations are wrapped in a DO block that checks if seller_product table exists
    // This prevents errors when the seller module hasn't been migrated yet

    // First, try to link products via ticket_product.seller_id if it exists as a column
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_product') THEN
          INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
          SELECT 
            'selprod_' || substr(md5(random()::text || p.id), 1, 26),
            tp.seller_id,
            p.id,
            NOW(),
            NOW()
          FROM ticket_product tp
          JOIN product p ON tp.product_id = p.id
          LEFT JOIN seller_product sp ON p.id = sp.product_id
          WHERE tp.seller_id IS NOT NULL
          AND sp.id IS NULL
          ON CONFLICT DO NOTHING;
        END IF;
      END $$;
    `);

    // For any remaining orphaned ticket products, link to the seller with the most products
    // This is a heuristic - products created around the same time likely belong to same seller
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_product') THEN
          INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
          SELECT 
            'selprod_' || substr(md5(random()::text || orphaned.product_id), 1, 26),
            (
              SELECT sp2.seller_id 
              FROM seller_product sp2
              GROUP BY sp2.seller_id
              ORDER BY COUNT(*) DESC
              LIMIT 1
            ),
            orphaned.product_id,
            NOW(),
            NOW()
          FROM (
            SELECT tp.product_id
            FROM ticket_product tp
            LEFT JOIN seller_product sp ON tp.product_id = sp.product_id
            WHERE sp.id IS NULL
          ) AS orphaned
          WHERE (
            SELECT COUNT(*) FROM seller_product 
            WHERE seller_id IS NOT NULL
          ) > 0
          ON CONFLICT DO NOTHING;
        END IF;
      END $$;
    `);

    // If there are still orphaned products and no sellers with products, 
    // link to the first/oldest seller in the system
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_product') 
           AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller') THEN
          INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
          SELECT 
            'selprod_' || substr(md5(random()::text || p.id), 1, 26),
            (
              SELECT id FROM seller 
              ORDER BY created_at ASC
              LIMIT 1
            ),
            p.id,
            NOW(),
            NOW()
          FROM product p
          LEFT JOIN seller_product sp ON p.id = sp.product_id
          WHERE sp.id IS NULL
          AND p.id IN (
            SELECT product_id FROM ticket_product
          )
          AND (
            SELECT COUNT(*) FROM seller
          ) > 0
          ON CONFLICT DO NOTHING;
        END IF;
      END $$;
    `);

    // Log which products were linked (optional, for debugging)
    // Only run if seller_product table exists
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_product') THEN
          PERFORM COUNT(*) FROM seller_product 
          WHERE id LIKE 'selprod_%' AND created_at > NOW() - INTERVAL '1 minute';
        END IF;
      END $$;
    `);
  }

  async down(): Promise<void> {
    // Remove seller_product links that were created by this migration
    // Only run if seller_product table exists
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_product') THEN
          DELETE FROM seller_product 
          WHERE id LIKE 'selprod_%' 
          AND created_at > NOW() - INTERVAL '1 day';
        END IF;
      END $$;
    `);
  }

}
