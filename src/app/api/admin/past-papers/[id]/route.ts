import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      'SELECT id, subject, year, paper_number, exam_body, title, title_sw, questions, is_premium, sort_order, created_at FROM past_papers WHERE id = $1',
      [params.id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await query('SELECT id, questions FROM past_papers WHERE id = $1', [params.id])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

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

    const isPremium = is_premium === true || is_premium === 'true'

    // Preserve existing questions when html_content is absent/empty (partial update).
    const questions = html_content
      ? JSON.stringify({ _html: html_content })
      : existing.rows[0].questions

    const result = await query(
      `UPDATE past_papers 
       SET subject = $1, year = $2, paper_number = $3, exam_body = $4, title = $5, title_sw = $6, is_premium = $7, sort_order = $8, questions = $9
       WHERE id = $10
       RETURNING id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, questions, created_at`,
      [subject, parsedYear, parsedPaper, exam_body, title, title_sw, isPremium, parsedSort, questions, params.id]
    )

    return NextResponse.json(result.rows[0])
  } catch (e) {
    console.error('Failed to update past paper:', e)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query('DELETE FROM past_papers WHERE id = $1 RETURNING id', [params.id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
