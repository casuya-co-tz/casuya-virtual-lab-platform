import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromSession } from '@/lib/auth-guard'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const { reason } = await req.json()
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json({ error: 'Reason must be at least 5 characters' }, { status: 400 })
    }

    const reviewResult = await query('SELECT id FROM reviews WHERE id = $1', [id])
    if (reviewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const existing = await query(
      'SELECT id FROM review_reports WHERE review_id = $1 AND reporter_id = $2',
      [id, userId]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Already reported this review' }, { status: 409 })
    }

    await query(
      'INSERT INTO review_reports (review_id, reporter_id, reason) VALUES ($1, $2, $3)',
      [id, userId, reason.trim()]
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
