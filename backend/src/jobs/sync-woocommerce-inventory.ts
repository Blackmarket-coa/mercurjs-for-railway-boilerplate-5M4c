import { MedusaContainer } from "@medusajs/framework/types";
import { WOOCOMMERCE_IMPORT_MODULE } from "../modules/woocommerce-import";
import WooCommerceImportModuleService from "../modules/woocommerce-import/service";
import { syncWooInventoryWorkflow } from "../workflows/woocommerce-import/sync-woo-inventory";
import { buildQueueEnvelope, runQueueConsumer } from "../shared/queue-runtime";
import { requeueWithBackoff } from "../shared/queue-requeue-adapter";

/**
 * Scheduled job: Sync WooCommerce inventory for all connected vendors.
 * Runs daily at 2:00 AM server time.
 */
export default async function syncWooCommerceInventoryJob(
  container: MedusaContainer,
) {
  const logger = container.resolve("logger");
  const wooService: WooCommerceImportModuleService = container.resolve(
    WOOCOMMERCE_IMPORT_MODULE,
  );

  logger.info("[WooCommerce Sync] Starting scheduled inventory sync...");

  const publishToDlq = async (message: ReturnType<typeof buildQueueEnvelope>) => {
    logger.error(
      `[WooCommerce Sync][DLQ] topic=${message.metadata.dead_letter_topic} payload=${JSON.stringify(
        message.payload,
      )} retry=${JSON.stringify(message.metadata.retry)}`,
    );
  };


  const requeue = async (
    message: ReturnType<typeof buildQueueEnvelope>,
    delaySeconds: number,
  ) => {
    await requeueWithBackoff(message, delaySeconds, logger)
  }

  try {
    // Get all connections with inventory sync enabled
    const connections = await wooService.listWooCommerceConnections({
      sync_inventory: true,
    });

    if (connections.length === 0) {
      logger.info(
        "[WooCommerce Sync] No connections with inventory sync enabled",
      );
      return;
    }

    logger.info(
      `[WooCommerce Sync] Found ${connections.length} connections to sync`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const connection of connections) {
      const event = {
        event_id: `inventory-sync-${connection.id}-${Date.now()}`,
        occurred_at: new Date().toISOString(),
        product_id: `woo-connection:${connection.id}`,
        variant_id: "*",
        delta: 0,
        reason: "scheduled_sync",
        channel: "marketplace_feed" as const,
        idempotency_key: `woo-sync-${connection.id}`,
      };

      const consumeResult = await runQueueConsumer({
        topicKey: "inventory_sync",
        payload: event,
        idempotencyKey: event.idempotency_key,
        handler: async () => {
          const { result } = await syncWooInventoryWorkflow(container).run({
            input: {
              connection_id: connection.id,
              seller_id: connection.seller_id,
            },
          });

          const report = result.report;
          successCount++;

          logger.info(
            `[WooCommerce Sync] Synced ${connection.store_name || connection.id}: ` +
              `${report.products_checked} checked, ${report.variants_updated} updated, ` +
              `${report.errors.length} errors`,
          );

          if (report.out_of_stock.length > 0) {
            logger.info(
              `[WooCommerce Sync] Out of stock items for ${connection.store_name}: ${report.out_of_stock.join(", ")}`,
            );
          }
        },
        publishToDlq,
        requeue,
      });

      if (consumeResult.status !== "processed") {
        errorCount++;
        logger.error(
          `[WooCommerce Sync] connection ${connection.id} failed status=${consumeResult.status} retry=${consumeResult.retries}`,
        );
      }
    }

    logger.info(
      `[WooCommerce Sync] Completed: ${successCount} succeeded, ${errorCount} failed`,
    );
  } catch (error: any) {
    logger.error(`[WooCommerce Sync] Job failed: ${error.message}`);
  }
}

export const config = {
  name: "sync-woocommerce-inventory",
  schedule: "0 2 * * *", // Daily at 2:00 AM
};
