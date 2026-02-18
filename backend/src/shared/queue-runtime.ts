import { QUEUE_TOPICS } from "./queue-topics"
import { validatePhase0Contract } from "./phase0-contracts"
import { checkAndStoreIdempotency } from "./idempotency-store"

export type QueueTopicKey = keyof typeof QUEUE_TOPICS

export type RetryMetadata = {
  attempt: number
  maxRetries: number
  backoffSeconds: number
  nextRetryAt?: string
  failedAt?: string
  lastError?: string
}

export type QueueEnvelope<T> = {
  topic: string
  payload: T
  idempotency_key?: string
  trace_id?: string
  metadata: {
    retry: RetryMetadata
    published_at: string
    dead_letter_topic: string
  }
}

const queueTopicToContract = {
  payments_settlement: "order_sync_event",
  inventory_sync: "inventory_ledger_event",
  invoice_issuance: "invoice",
} as const

export function buildQueueEnvelope<T>(
  topicKey: QueueTopicKey,
  payload: T,
  attempt = 0,
  idempotencyKey?: string
): QueueEnvelope<T> {
  const topic = QUEUE_TOPICS[topicKey]

  return {
    topic: topic.topic,
    payload,
    idempotency_key: idempotencyKey,
    metadata: {
      retry: {
        attempt,
        maxRetries: topic.policy.retries,
        backoffSeconds: topic.policy.backoffSeconds,
      },
      published_at: new Date().toISOString(),
      dead_letter_topic: topic.policy.deadLetterTopic,
    },
  }
}

export function validateTopicPayload(topicKey: QueueTopicKey, payload: unknown) {
  const contractKey = queueTopicToContract[topicKey as keyof typeof queueTopicToContract]
  if (contractKey) {
    validatePhase0Contract(contractKey, payload)
  }
}

export async function runQueueConsumer<T>(params: {
  topicKey: QueueTopicKey
  payload: T
  idempotencyKey?: string
  attempt?: number
  handler: (payload: T) => Promise<void>
  publishToDlq: (message: QueueEnvelope<T>) => Promise<void>
  requeue: (message: QueueEnvelope<T>, delaySeconds: number) => Promise<void>
}) {
  const {
    topicKey,
    payload,
    handler,
    publishToDlq,
    requeue,
    idempotencyKey,
  } = params
  const attempt = params.attempt ?? 0
  const contract = QUEUE_TOPICS[topicKey]

  validateTopicPayload(topicKey, payload)

  const idemCheck = await checkAndStoreIdempotency({
    scope: topicKey,
    idempotencyKey,
    payload,
  })

  if (idemCheck.duplicate && !idemCheck.conflict) {
    return { status: "duplicate" as const, retries: attempt }
  }

  if (idemCheck.duplicate && idemCheck.conflict) {
    return {
      status: "idempotency_conflict" as const,
      retries: attempt,
      error: idemCheck.message,
    }
  }

  try {
    await handler(payload)
    return { status: "processed" as const, retries: attempt }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const nextAttempt = attempt + 1

    if (nextAttempt > contract.policy.retries) {
      await publishToDlq({
        ...buildQueueEnvelope(topicKey, payload, nextAttempt, idempotencyKey),
        metadata: {
          retry: {
            attempt: nextAttempt,
            maxRetries: contract.policy.retries,
            backoffSeconds: contract.policy.backoffSeconds,
            failedAt: new Date().toISOString(),
            lastError: message,
          },
          published_at: new Date().toISOString(),
          dead_letter_topic: contract.policy.deadLetterTopic,
        },
      })

      return { status: "dlq" as const, retries: nextAttempt, error: message }
    }

    const retryEnvelope = buildQueueEnvelope(topicKey, payload, nextAttempt, idempotencyKey)
    await requeue(retryEnvelope, contract.policy.backoffSeconds)

    return {
      status: "retry" as const,
      retries: nextAttempt,
      nextRetryAt: new Date(Date.now() + contract.policy.backoffSeconds * 1000).toISOString(),
      error: message,
    }
  }
}
