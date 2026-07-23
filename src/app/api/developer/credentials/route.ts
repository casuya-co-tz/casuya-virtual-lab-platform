import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getDeveloperId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  const role = cookieStore.get('role')?.value
  if (!sid) return null
  if (role === 'admin') return sid
  if (role === 'developer') {
    const result = await query('SELECT id FROM developer_profiles WHERE id = $1', [sid])
    return result.rows.length > 0 ? sid : null
  }
  return null
}

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
