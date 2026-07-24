import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

async function getDeveloperId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  const role = cookieStore.get('role')?.value
  if (!sid) return null
  if (role === 'developer' || role === 'admin') {
    const result = await query('SELECT id FROM developer_profiles WHERE id = $1', [sid])
    return result.rows.length > 0 ? sid : null
  }
  return null
}

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
    await query(`DELETE FROM webhook_subscriptions WHERE id = $1 AND developer_id = $2`, [params.id, developerId])
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
