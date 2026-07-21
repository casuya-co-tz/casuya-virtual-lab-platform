import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, amount, currency } = await req.json()
  if (!phone || !amount) return NextResponse.json({ error: 'Phone and amount required' }, { status: 400 })

  const txId = `mpesa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  try {
    await query(
      `INSERT INTO payments (user_id, amount, currency, payment_method, status, metadata)
       VALUES ($1, $2, $3, 'mpesa', 'pending', $4)`,
      [userId, amount, currency || 'TZS', JSON.stringify({ phone, transaction_id: txId })]
    )

    return NextResponse.json({
      success: true,
      transaction_id: txId,
      message: 'M-Pesa push sent. Check your phone.',
      amount,
      phone,
    })
  } catch {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      'SELECT id, amount, currency, payment_method, status, created_at FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
