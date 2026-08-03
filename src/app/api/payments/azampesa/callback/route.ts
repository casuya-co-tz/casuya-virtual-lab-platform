import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { verifyWebhookChecksum } from '@/lib/azampay'
import { activateSubscriptionForTransaction } from '@/lib/subscription-access'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const apiKey = process.env.AZAMPESA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 503 })
    }
    const signature = req.headers.get('x-checksum') || body.checksum
    if (!signature || typeof signature !== 'string') {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    const { checksum: _checksum, ...payloadForVerify } = body
    if (!verifyWebhookChecksum(apiKey, payloadForVerify, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const {
      externalId,
      transactionId: providerTxId,
      status,
      resultCode,
      resultDesc,
      amount,
    } = body

    const refId = externalId || providerTxId
    if (!refId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 })
    }

    const txResult = await query(
      UUID_RE.test(String(refId))
        ? `SELECT id, user_id, plan_id, amount FROM payment_transactions WHERE id = $1 OR provider_transaction_id = $1`
        : `SELECT id, user_id, plan_id, amount FROM payment_transactions WHERE provider_transaction_id = $1`,
      [refId]
    )

    if (txResult.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const tx = txResult.rows[0]

    if (amount !== undefined && amount !== null && Number(amount) !== Number(tx.amount)) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    const success = status === 'Completed' || status === 'completed' || resultCode === 0 || resultCode === '0'

    if (success) {
      let marked = false
      await transaction(async (q) => {
        const upd = await q(
          `UPDATE payment_transactions SET status = 'completed', completed_at = NOW(),
           provider_transaction_id = COALESCE(provider_transaction_id, $1)
           WHERE id = $2 AND status = 'pending'
           RETURNING id`,
          [providerTxId, tx.id]
        )
        if (upd.rows.length === 0) return
        marked = true
        await activateSubscriptionForTransaction(tx.user_id, tx.id, q)
      })

      if (!marked) {
        // Duplicate/late callback for an already-finalized transaction — ack idempotently.
        return NextResponse.json({ success: true, message: 'Payment already processed' })
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' })
    } else {
      await query(
        `UPDATE payment_transactions SET status = 'failed', completed_at = COALESCE(completed_at, NOW()),
         metadata = jsonb_set(COALESCE(metadata, '{}'), '{error}', $1::jsonb)
         WHERE id = $2 AND status = 'pending'`,
        [JSON.stringify(resultDesc || 'Payment failed'), tx.id]
      )
      return NextResponse.json({ success: false, message: resultDesc || 'Payment failed' })
    }
  } catch (err) {
    console.error('Payment callback error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
