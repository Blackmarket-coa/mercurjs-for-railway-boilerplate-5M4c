import { QUEUE_TOPICS } from "./queue-topics"
import { validatePhase0Contract } from "./phase0-contracts"

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
  inventory_sync: "inventory_ledger_event",
  invoice_issuance: "invoice",
} as const

export function buildQueueEnvelope<T>(
  topicKey: QueueTopicKey,
  payload: T,
  attempt = 0
): QueueEnvelope<T> {
  const topic = QUEUE_TOPICS[topicKey]

  return {
    topic: topic.topic,
    payload,
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
  attempt?: number
  handler: (payload: T) => Promise<void>
  publishToDlq: (message: QueueEnvelope<T>) => Promise<void>
}) {
  const { topicKey, payload, handler, publishToDlq } = params
  const attempt = params.attempt ?? 0
  const contract = QUEUE_TOPICS[topicKey]

  validateTopicPayload(topicKey, payload)

  try {
    await handler(payload)
    return { status: "processed" as const, retries: attempt }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const nextAttempt = attempt + 1

    if (nextAttempt > contract.policy.retries) {
      await publishToDlq({
        ...buildQueueEnvelope(topicKey, payload, nextAttempt),
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

    return {
      status: "retry" as const,
      retries: nextAttempt,
      nextRetryAt: new Date(Date.now() + contract.policy.backoffSeconds * 1000).toISOString(),
      error: message,
    }
  }
}
