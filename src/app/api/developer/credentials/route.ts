import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET() {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      'SELECT id, public_token, scopes, is_active, expires_at, request_count, last_used_at, created_at FROM api_credentials WHERE developer_id = $1 ORDER BY created_at DESC',
      [developerId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const planCheck = await query(
      `SELECT pp.max_api_keys
       FROM developer_profiles dp
       LEFT JOIN pricing_plans pp ON pp.id = dp.plan_id
       WHERE dp.id = $1`,
      [developerId]
    )
    const maxKeys = planCheck.rows[0]?.max_api_keys ?? 1
    {
      const countResult = await query(
        `SELECT COUNT(*) as cnt FROM api_credentials WHERE developer_id = $1 AND is_active = true`,
        [developerId]
      )
      if (parseInt(countResult.rows[0].cnt) >= maxKeys) {
        return NextResponse.json(
          { error: 'API key limit reached', upgradeUrl: '/pricing?section=developer', maxKeys, currentKeys: parseInt(countResult.rows[0].cnt) },
          { status: 403 }
        )
      }
    }

    const { scopes } = await req.json()
    const crypto = await import('crypto')
    const bcrypt = await import('bcryptjs')
    const publicToken = 'cvs_' + crypto.randomBytes(24).toString('hex')
    const secret = crypto.randomBytes(32).toString('hex')
    const hashedSecret = bcrypt.hashSync(secret, 10)

    const result = await query(
      `INSERT INTO api_credentials (developer_id, public_token, hashed_secret, scopes, is_active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, public_token, scopes, is_active, created_at`,
      [developerId, publicToken, hashedSecret, scopes || ['labs:read']]
    )

    return NextResponse.json(
      { credential: result.rows[0], token: `${publicToken}:${secret}` },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
