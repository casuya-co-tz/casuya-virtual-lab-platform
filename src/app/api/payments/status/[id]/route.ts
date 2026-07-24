import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT id, amount, currency, status, provider, provider_transaction_id, created_at, completed_at
       FROM payment_transactions WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const tx = result.rows[0]

    if (tx.status === 'pending' && process.env.AZAMPESA_API_KEY) {
      try {
        const res = await fetch(`https://api.azam.pesa/v1/transactions/${tx.provider_transaction_id}`, {
          headers: { Authorization: `Bearer ${process.env.AZAMPESA_API_KEY}` },
        })
        if (res.ok) {
          const gatewayData = await res.json()
          if (gatewayData.status === 'completed' || gatewayData.ResultCode === 0) {
            await query(`UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`, [tx.id])
            tx.status = 'completed'
          }
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
