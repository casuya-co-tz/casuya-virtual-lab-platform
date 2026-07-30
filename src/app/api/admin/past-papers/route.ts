import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const year = searchParams.get('year')

  let sql = 'SELECT id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, created_at FROM past_papers WHERE 1=1'
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

export async function POST(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, html_content } = body

    const questions = html_content ? JSON.stringify({ _html: html_content }) : '[]'

    const result = await query(
      `INSERT INTO past_papers (subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, questions, created_at`,
      [subject, parseInt(year), parseInt(paper_number), exam_body, title, title_sw, !!is_premium, parseInt(sort_order || '0'), questions]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (e) {
    console.error('Failed to create past paper:', e)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}