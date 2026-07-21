import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const keyResult = await query(
      `SELECT ac.*, dp.api_tier
       FROM api_credentials ac
       JOIN developer_profiles dp ON dp.id = ac.developer_id
       WHERE ac.public_token = $1 AND ac.is_active = true`,
      [token]
    )

    if (keyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const key = keyResult.rows[0]
    if (key.api_tier !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise tier required' }, { status: 403 })
    }

    const result = await query(
      `UPDATE api_credentials SET is_active = false WHERE id = $1 AND developer_id = $2 RETURNING id, public_token, is_active`,
      [params.id, key.developer_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ revoked: true, credential: result.rows[0] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
