import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { sanitizeSafe } from '@/lib/sanitize'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, slug, title, content, category, updated_at
       FROM documentation
       WHERE published = true
       ORDER BY category, title`
    )
    const docs = result.rows.map((doc: { content: string }) => ({ ...doc, content: sanitizeSafe(doc.content) }))
    return NextResponse.json(docs)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
