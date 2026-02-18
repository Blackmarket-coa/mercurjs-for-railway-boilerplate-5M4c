import type { QueueEnvelope } from "./queue-runtime"

/**
 * Phase 1 retry adapter.
 *
 * This is intentionally transport-agnostic: wire this to BullMQ/SQS/Kafka
 * producer in production. Current default emits structured logs so handlers
 * still provide explicit retry metadata and backoff intent.
 */
export async function requeueWithBackoff<T>(
  message: QueueEnvelope<T>,
  delaySeconds: number,
  logger: Pick<Console, "warn"> = console
) {
  logger.warn(
    `[Queue Retry Adapter] schedule topic=${message.topic} delay_seconds=${delaySeconds} retry=${JSON.stringify(
      message.metadata.retry
    )}`
  )
}
