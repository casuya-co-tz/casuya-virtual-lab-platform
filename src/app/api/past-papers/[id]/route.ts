import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth-guard'
import { canAccessPremiumContent } from '@/lib/subscription-access'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const result = await query(
      'SELECT id, subject, year, paper_number, exam_body, title, title_sw, questions, is_premium, sort_order, created_at FROM past_papers WHERE id = $1',
      [params.id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const paper = result.rows[0]
    if (paper.is_premium && !(await canAccessPremiumContent(session.id, session.role))) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    return NextResponse.json(paper)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
