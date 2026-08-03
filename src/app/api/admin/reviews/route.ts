import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { logAuditEvent } from '@/lib/audit-logger'

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const parsedLimit = parseInt(searchParams.get('limit') || '20')
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1
    const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : 20
    const status = searchParams.get('status') || 'all'
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: unknown[] = []
    if (status === 'public') {
      whereClause = 'WHERE r.is_public = true'
    } else if (status === 'private') {
      whereClause = 'WHERE r.is_public = false'
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM reviews r ${whereClause}`, params
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await query(`
      SELECT r.id, r.rating, r.review_text, r.is_public, r.helpful_count, r.not_helpful_count, r.created_at, r.updated_at,
             p.full_name, p.role AS user_role
      FROM reviews r
      JOIN profiles p ON r.user_id = p.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])

    return NextResponse.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, is_public } = await req.json()
    if (!id || typeof is_public !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const result = await query(
      'UPDATE reviews SET is_public = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_public',
      [is_public, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await logAuditEvent({
      userId: adminId,
      action: 'update',
      entityType: 'review',
      entityId: id,
      newValues: { is_public },
    })

    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
