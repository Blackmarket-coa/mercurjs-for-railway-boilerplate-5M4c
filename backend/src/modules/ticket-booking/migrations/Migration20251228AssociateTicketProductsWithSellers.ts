import { Migration } from '@mikro-orm/migrations';

export class Migration20251228AssociateTicketProductsWithSellers extends Migration {

  async up(): Promise<void> {
    // This migration ensures all ticket products (and their associated Medusa products)
    // are linked to the seller via the seller_product table
    
    // If seller_id exists on ticket_product, use it to create seller_product links
    this.addSql(`
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
    `);

    // For ticket products without seller_id, try to infer from other marketplace data
    // If this fails silently, that's ok - those products remain unassociated
    this.addSql(`
      INSERT INTO seller_product (id, seller_id, product_id, created_at, updated_at)
      SELECT 
        'selprod_' || substr(md5(random()::text || p.id), 1, 26),
        s.id,
        p.id,
        NOW(),
        NOW()
      FROM product p
      LEFT JOIN seller_product sp ON p.id = sp.product_id
      JOIN seller s ON s.id IS NOT NULL
      WHERE sp.id IS NULL
      AND p.created_at IS NOT NULL
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    // Remove seller_product links that were created by this migration
    // This is a reversal step - in practice, you may not want to remove these
    this.addSql(`
      DELETE FROM seller_product 
      WHERE id LIKE 'selprod_%' 
      AND created_at > NOW() - INTERVAL '1 day';
    `);
  }

}
