import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT subject, COUNT(*)::int as count FROM labs WHERE is_published = true GROUP BY subject`
    )
    const counts: Record<string, number> = {}
    for (const row of result.rows) {
      counts[row.subject] = row.count
    }
    return NextResponse.json(counts)
  } catch {
    return NextResponse.json({ physics: 0, chemistry: 0, biology: 0 })
  }
}
