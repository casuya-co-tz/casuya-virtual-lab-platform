import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(`
      SELECT rr.id, rr.review_id, rr.reason, rr.created_at, rr.resolved_at,
             p.full_name AS reporter_name,
             rv.review_text, rv.rating
      FROM review_reports rr
      JOIN profiles p ON rr.reporter_id = p.id
      JOIN reviews rv ON rr.review_id = rv.id
      ORDER BY rr.resolved_at NULLS FIRST, rr.created_at DESC
    `)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    const result = await query(
      'UPDATE review_reports SET resolved_at = NOW(), resolved_by = $1 WHERE id = $2 AND resolved_at IS NULL RETURNING id',
      [adminId, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found or already resolved' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 })
  }
}
