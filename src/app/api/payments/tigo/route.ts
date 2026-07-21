import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id, msisdn, amount, reference } = body

    if (!transaction_id || !msisdn || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO payments (user_id, amount, currency, provider, transaction_id, status, metadata, created_at)
       VALUES ($1, $2, 'TZS', 'tigo', $3, 'completed', $4::jsonb, NOW())
       RETURNING id, transaction_id, status, amount`,
      [reference || 'unknown', amount, transaction_id, JSON.stringify({ msisdn, raw: body })]
    )

    return NextResponse.json({ received: true, payment: result.rows[0] }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
