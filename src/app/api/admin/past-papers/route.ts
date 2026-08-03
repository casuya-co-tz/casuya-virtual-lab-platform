import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { sanitizeSafe, needsSandbox } from '@/lib/sanitize'

function parseYear(raw: string | null): number | null {
  if (!raw) return null
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}

export async function GET(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const year = parseYear(searchParams.get('year'))

  let sql = 'SELECT id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, created_at FROM past_papers WHERE 1=1'
  const params: unknown[] = []
  let idx = 1

  if (subject) { sql += ` AND subject = $${idx++}`; params.push(subject) }
  if (year !== null) { sql += ` AND year = $${idx++}`; params.push(year) }

  sql += ' ORDER BY year DESC, subject, paper_number'

  try {
    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, html_content } = body

    if (!subject || !title || year === undefined || year === null || paper_number === undefined || paper_number === null) {
      return NextResponse.json({ error: 'subject, title, year, and paper_number are required' }, { status: 400 })
    }

    const parsedYear = parseInt(year, 10)
    const parsedPaper = parseInt(paper_number, 10)
    const parsedSort = parseInt(sort_order || '0', 10)
    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedPaper) || !Number.isFinite(parsedSort)) {
      return NextResponse.json({ error: 'year, paper_number, and sort_order must be numbers' }, { status: 400 })
    }

    const rawHtml = html_content ? String(html_content) : ''
    const storedHtml = needsSandbox(rawHtml) ? rawHtml : sanitizeSafe(rawHtml)
    const questions = html_content ? JSON.stringify({ _html: storedHtml }) : '[]'
    const isPremium = is_premium === true || is_premium === 'true'

    const result = await query(
      `INSERT INTO past_papers (subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, questions, created_at`,
      [subject, parsedYear, parsedPaper, exam_body, title, title_sw, isPremium, parsedSort, questions]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (e) {
    console.error('Failed to create past paper:', e)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
