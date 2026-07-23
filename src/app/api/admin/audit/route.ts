import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(request: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const offset = (page - 1) * limit

    let sql = `
      SELECT al.id, al.actor_id AS user_id, al.action, al.target_type AS entity_type,
             al.target_id AS entity_id, al.old_value AS old_values, al.new_value AS new_values,
             al.ip_address, al.created_at, p.full_name
      FROM audit_log al
      LEFT JOIN profiles p ON p.id = al.actor_id
    `
    const params: unknown[] = []

    if (action) {
      params.push(action)
      sql += ` WHERE al.action = $${params.length}`
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)
    return NextResponse.json({ logs: result.rows })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
