import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const webhook = await query(
      `SELECT id FROM webhook_subscriptions WHERE id = $1 AND developer_id = $2`,
      [params.id, developerId]
    )
    if (webhook.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const result = await query(
      `SELECT id, event, payload, status, attempts, response_code, error_message, created_at, last_attempt_at
       FROM webhook_deliveries WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [params.id]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
