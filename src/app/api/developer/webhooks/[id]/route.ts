import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT id, url, events, is_active, created_at FROM webhook_subscriptions WHERE id = $1 AND developer_id = $2`,
      [params.id, developerId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const deliveries = await query(
      `SELECT id, event, status, attempts, response_code, error_message, created_at, last_attempt_at
       FROM webhook_deliveries WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [params.id]
    )

    return NextResponse.json({ ...result.rows[0], deliveries: deliveries.rows })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(`DELETE FROM webhook_subscriptions WHERE id = $1 AND developer_id = $2 RETURNING id`, [params.id, developerId])
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
