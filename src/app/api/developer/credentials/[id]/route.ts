import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getDeveloperId } from '@/lib/developer-auth'

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      'DELETE FROM api_credentials WHERE id = $1 AND developer_id = $2 RETURNING id',
      [params.id, developerId]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
