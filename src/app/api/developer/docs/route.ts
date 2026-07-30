import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, slug, title, content, category, updated_at
       FROM documentation
       WHERE published = true
       ORDER BY category, title`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
