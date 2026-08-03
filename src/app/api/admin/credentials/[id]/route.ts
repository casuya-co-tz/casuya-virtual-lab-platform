import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const result = await query(
      'UPDATE api_credentials SET is_active = false WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'API key revoked' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
