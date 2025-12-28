import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * This endpoint helps diagnose and fix seller_product associations
 * Use with caution - only for debugging orphaned products
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { action } = req.body

  try {
    const db = req.scope.resolve("db")
    
    if (action === "diagnose") {
      // Check for orphaned products
      const orphanedProducts = await db.query(`
        SELECT p.id, p.title, tp.id as ticket_product_id
        FROM product p
        INNER JOIN ticket_product tp ON p.id = tp.product_id
        LEFT JOIN seller_product sp ON p.id = sp.product_id
        WHERE sp.id IS NULL
        LIMIT 20
      `)

      const sellers = await db.query(`
        SELECT id, name FROM seller LIMIT 5
      `)

      return res.json({
        orphanedCount: orphanedProducts.length,
        orphanedProducts,
        sellersAvailable: sellers.length,
        sellers
      })
    }

    if (action === "fix") {
      // Link all orphaned ticket products to the first seller
      const result = await db.query(`
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
        ON CONFLICT DO NOTHING
      `)

      // Verify the fix
      const verification = await db.query(`
        SELECT COUNT(*) as linked_count
        FROM seller_product 
        WHERE id LIKE 'selprod_%'
        AND created_at > NOW() - INTERVAL '1 minute'
      `)

      return res.json({
        status: "success",
        message: `Fixed seller_product associations. ${verification[0].linked_count} products linked.`,
        linkedCount: verification[0].linked_count
      })
    }

    return res.status(400).json({
      error: "Invalid action. Use 'diagnose' or 'fix'."
    })
  } catch (error: any) {
    console.error("Debug endpoint error:", error)
    res.status(500).json({
      error: error.message
    })
  }
}
