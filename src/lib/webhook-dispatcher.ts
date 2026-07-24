import crypto from 'crypto'
import { query } from './db'

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 30000]

export async function dispatchWebhookEvent(
  developerId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const result = await query(
    `SELECT id, url, secret, events FROM webhook_subscriptions WHERE developer_id = $1 AND is_active = true`,
    [developerId]
  )

  for (const webhook of result.rows) {
    if (!webhook.events.includes(event)) continue
    deliverWebhook(webhook.id, webhook.url, webhook.secret, event, payload)
  }
}

export async function dispatchEventToAllDevelopers(
  event: string,
  payload: Record<string, unknown>
) {
  const result = await query(
    `SELECT id, url, secret, events FROM webhook_subscriptions WHERE is_active = true`
  )

  for (const webhook of result.rows) {
    if (!webhook.events.includes(event)) continue
    deliverWebhook(webhook.id, webhook.url, webhook.secret, event, payload)
  }
}

async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  event: string,
  payload: Record<string, unknown>
) {
  const deliveryId = crypto.randomUUID()
  const body = JSON.stringify({ event, payload, delivery_id: deliveryId, timestamp: new Date().toISOString() })
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  await query(
    `INSERT INTO webhook_deliveries (id, webhook_id, event, payload, status, attempts) VALUES ($1, $2, $3, $4, 'pending', 0)`,
    [deliveryId, webhookId, event, JSON.stringify(payload)]
  )

  deliverWithRetry(deliveryId, url, body, signature, 0)
}

async function deliverWithRetry(
  deliveryId: string,
  url: string,
  body: string,
  signature: string,
  attempt: number
) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': JSON.parse(body).event,
        'User-Agent': 'CasuyaWebhook/1.0',
      },
      body,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    await query(
      `UPDATE webhook_deliveries SET status = $1, attempts = $2, last_attempt_at = NOW(), response_code = $3 WHERE id = $4`,
      [res.ok ? 'delivered' : 'failed', attempt + 1, res.status, deliveryId]
    )
  } catch (err) {
    const nextAttempt = attempt + 1
    const status = nextAttempt >= MAX_RETRIES ? 'failed' : 'pending'
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'

    await query(
      `UPDATE webhook_deliveries SET status = $1, attempts = $2, last_attempt_at = NOW(), error_message = $3 WHERE id = $4`,
      [status, nextAttempt, errorMsg, deliveryId]
    )

    if (nextAttempt < MAX_RETRIES) {
      setTimeout(() => deliverWithRetry(deliveryId, url, body, signature, nextAttempt), RETRY_DELAYS[attempt] || 5000)
    }
  }
}

export function verifyWebhookSignature(secret: string, body: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(`sha256=${expected}`), Buffer.from(signature))
}
