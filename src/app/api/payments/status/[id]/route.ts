import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import { getTransactionStatus } from '@/lib/azampay'
import { activateSubscriptionForTransaction } from '@/lib/subscription-access'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT id, plan_id, amount, currency, status, provider, provider_transaction_id, created_at, completed_at
       FROM payment_transactions WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const tx = result.rows[0]

    if (tx.status === 'pending' && process.env.AZAMPESA_APP_NAME) {
      try {
        const gatewayResult = await getTransactionStatus({
          pgReferenceId: tx.provider_transaction_id !== tx.id ? tx.provider_transaction_id : undefined,
          externalId: tx.id,
        })

        if (gatewayResult.success && gatewayResult.status?.toLowerCase() === 'completed') {
          await transaction(async (q) => {
            const upd = await q(
              `UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1 AND status = 'pending'`,
              [tx.id]
            )
            if (upd.rows.length === 0) return
            await activateSubscriptionForTransaction(userId, tx.id, q)
          })
          tx.status = 'completed'
        } else if (gatewayResult.success && gatewayResult.status?.toLowerCase() === 'failed') {
          await query(
            `UPDATE payment_transactions SET status = 'failed', completed_at = COALESCE(completed_at, NOW()),
             metadata = jsonb_set(COALESCE(metadata, '{}'), '{error}', $1::jsonb)
             WHERE id = $2 AND status = 'pending'`,
            [JSON.stringify(gatewayResult.resultDesc || 'Payment failed'), tx.id]
          )
          tx.status = 'failed'
        }
      } catch {
        // Gateway unreachable — return current DB status
      }
    }

    return NextResponse.json(tx)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
