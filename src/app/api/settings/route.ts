import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const result = await query('SELECT key, value FROM platform_settings ORDER BY key')
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { key, value } = await req.json()
    const result = await query(
      'INSERT INTO platform_settings (key, value, updated_by) VALUES ($1, $2::jsonb, $3) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_by = $3, updated_at = NOW() RETURNING *',
      [key, JSON.stringify(value), userId]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    await query('DELETE FROM platform_settings WHERE key = $1', [key])
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
