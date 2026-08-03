import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { logAuditEvent } from '@/lib/audit-logger'
import { getUserIdFromSession } from '@/lib/auth-guard'
import { sanitizePlainText } from '@/lib/sanitize'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const reviewResult = await query('SELECT user_id, created_at FROM reviews WHERE id = $1', [id])
    if (reviewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const review = reviewResult.rows[0]
    if (review.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const editWindow = 30 * 60 * 1000
    const elapsed = Date.now() - new Date(review.created_at).getTime()
    if (elapsed > editWindow) {
      return NextResponse.json({ error: 'Edit window (30 min) has expired' }, { status: 403 })
    }

    const { rating, review_text, is_public } = await req.json()

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (review_text !== undefined) {
      if (typeof review_text !== 'string' || review_text.trim().length < 10) {
        return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 })
      }
      if (review_text.length > 2000) {
        return NextResponse.json({ error: 'Review must be under 2000 characters' }, { status: 400 })
      }
    }

    const sanitized = review_text !== undefined && review_text ? sanitizePlainText(review_text) : undefined

    const result = await query(
      `UPDATE reviews SET
        rating = COALESCE($1, rating),
        review_text = COALESCE($2, review_text),
        is_public = COALESCE($3, is_public),
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [rating || null, sanitized || null, is_public !== undefined ? is_public : null, id]
    )

    logAuditEvent({ userId, action: 'update', entityType: 'review', entityId: id })

    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const reviewResult = await query('SELECT user_id FROM reviews WHERE id = $1', [id])
    if (reviewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (reviewResult.rows[0].user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM reviews WHERE id = $1', [id])

    logAuditEvent({ userId, action: 'delete', entityType: 'review', entityId: id })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
