import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  try {
    const userId = await requireAdmin()
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 })
    }

    const result = await query(
      'SELECT * FROM pricing_plans ORDER BY sort_order ASC'
    )

    return NextResponse.json(result.rows, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await requireAdmin()
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 })
    }

    const body = await req.json()
    const { id, name, name_sw, price, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'MISSING_PLAN_IDENTIFIER' }, { status: 400 })
    }

    const result = await query(
      `UPDATE pricing_plans
       SET name = COALESCE($2, name),
           name_sw = COALESCE($3, name_sw),
           price = COALESCE($4, price),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id, name, name_sw, price, is_active]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'PLAN_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ message: 'PLAN_UPDATED' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
