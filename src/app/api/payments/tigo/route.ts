import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin()
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { reference, msisdn, amount } = body

    if (!reference || !msisdn || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO payments (user_id, amount, currency, payment_method, status, metadata, created_at)
       VALUES ($1, $2, 'TZS', 'tigo', 'completed', $3::jsonb, NOW())
       RETURNING id, amount, status`,
      [reference, amount, JSON.stringify({ msisdn, provider: 'tigo', raw: body })]
    )

    return NextResponse.json({ received: true, payment: result.rows[0] }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
