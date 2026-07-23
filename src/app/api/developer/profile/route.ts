import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getDeveloperId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  const role = cookieStore.get('role')?.value
  if (!sid || (role !== 'admin' && role !== 'developer')) return null
  const result = await query('SELECT id FROM developer_profiles WHERE id = $1', [sid])
  return result.rows.length > 0 ? sid : null
}

export async function GET() {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      'SELECT * FROM developer_profiles WHERE id = $1',
      [developerId]
    )
    if (result.rows.length === 0) return NextResponse.json(null)
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
