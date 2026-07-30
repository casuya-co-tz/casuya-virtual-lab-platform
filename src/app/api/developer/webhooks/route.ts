import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'
import { getDeveloperId } from '@/lib/developer-auth'
import { isAllowedWebhookUrl } from '@/lib/webhook-url'

export async function GET() {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT id, url, events, is_active, created_at FROM webhook_subscriptions WHERE developer_id = $1 ORDER BY created_at DESC`,
      [developerId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const { url, events } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    try { new URL(url) } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }
    if (!isAllowedWebhookUrl(url)) {
      return NextResponse.json({ error: 'Webhook URL must be a public HTTPS endpoint' }, { status: 400 })
    }

    const webhookLimit = await query(
      `SELECT pp.max_api_keys FROM developer_profiles dp JOIN pricing_plans pp ON pp.id = dp.plan_id WHERE dp.id = $1`,
      [developerId]
    )
    const maxWebhooks = webhookLimit.rows[0]?.max_api_keys
    const currentCount = await query(
      `SELECT COUNT(*) as cnt FROM webhook_subscriptions WHERE developer_id = $1`,
      [developerId]
    )
    if (maxWebhooks !== null && parseInt(currentCount.rows[0].cnt) >= maxWebhooks) {
      return NextResponse.json({ error: 'Webhook limit reached. Upgrade your plan.' }, { status: 403 })
    }

    const secret = crypto.randomBytes(32).toString('hex')
    const result = await query(
      `INSERT INTO webhook_subscriptions (developer_id, url, events, secret) VALUES ($1, $2, $3, $4) RETURNING id, url, events, is_active, created_at`,
      [developerId, url, events || ['lab.created', 'lab.updated'], secret]
    )

    return NextResponse.json({ webhook: result.rows[0], secret }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
