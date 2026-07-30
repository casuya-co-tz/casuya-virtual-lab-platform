import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT ac.id, ac.developer_id, ac.public_token, ac.scopes, ac.is_active, ac.expires_at,
              ac.request_count, ac.last_used_at, ac.created_at,
              p.full_name AS developer_name, u.email AS developer_email
       FROM api_credentials ac
       LEFT JOIN profiles p ON p.id = ac.developer_id
       LEFT JOIN auth.users u ON u.id = ac.developer_id
       ORDER BY ac.created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const { developer_id, scopes } = await req.json()

    if (!developer_id) {
      return NextResponse.json({ error: 'developer_id is required' }, { status: 400 })
    }

    const devCheck = await query(
      `SELECT id FROM developer_profiles WHERE id = $1`,
      [developer_id]
    )
    if (devCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    const publicToken = 'cvs_' + crypto.randomBytes(24).toString('hex')
    const secret = crypto.randomBytes(32).toString('hex')
    const hashedSecret = bcrypt.hashSync(secret, 10)

    const result = await query(
      `INSERT INTO api_credentials (developer_id, public_token, hashed_secret, scopes, is_active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, public_token, scopes, is_active, created_at`,
      [developer_id, publicToken, hashedSecret, scopes || ['labs:read']]
    )

    return NextResponse.json(
      { credential: result.rows[0], token: `${publicToken}:${secret}` },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
