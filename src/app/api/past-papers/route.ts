import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const year = searchParams.get('year')

  let sql = 'SELECT id, subject, year, paper_number, exam_body, title, title_sw, is_premium, created_at FROM past_papers WHERE 1=1'
  const params: unknown[] = []
  let idx = 1

  if (subject) { sql += ` AND subject = $${idx++}`; params.push(subject) }
  if (year) { sql += ` AND year = $${idx++}`; params.push(parseInt(year)) }

  sql += ' ORDER BY year DESC, subject, paper_number'

  try {
    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
