import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '9')))
    const offset = (page - 1) * limit
    const tag = searchParams.get('tag') || ''

    let countQuery = "SELECT COUNT(*) FROM blog_posts WHERE is_published = true"
    let dataQuery = "SELECT id, title, title_sw, slug, excerpt, featured_image, tags, published_at FROM blog_posts WHERE is_published = true"
    const params: unknown[] = []

    if (tag) {
      const cond = ' AND $1 = ANY(tags)'
      countQuery += cond
      dataQuery += cond
      params.push(tag)
    }

    const countResult = await query(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    dataQuery += ' ORDER BY published_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    const dataResult = await query(dataQuery, [...params, limit, offset])

    return NextResponse.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
