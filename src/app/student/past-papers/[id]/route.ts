import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromSession } from '@/lib/auth-guard'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

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
