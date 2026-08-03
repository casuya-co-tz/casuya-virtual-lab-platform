import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { logAuditEvent } from '@/lib/audit-logger'

export async function GET(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const parsedLimit = parseInt(searchParams.get('limit') || '20')
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1
    const limit = Number.isFinite(parsedLimit) ? Math.min(50, Math.max(1, parsedLimit)) : 20
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''

    let countQuery = 'SELECT COUNT(*) FROM blog_posts bp'
    let dataQuery = 'SELECT bp.id, bp.title, bp.title_sw, bp.slug, bp.excerpt, bp.is_published, bp.is_featured, bp.tags, bp.published_at, bp.created_at, bp.updated_at, p.full_name as author_name FROM blog_posts bp LEFT JOIN profiles p ON bp.author_id = p.id'
    const params: unknown[] = []

    if (search) {
      const where = ' WHERE (bp.title ILIKE $1 OR bp.title_sw ILIKE $1 OR bp.slug ILIKE $1)'
      countQuery += where
      dataQuery += where
      params.push(`%${search}%`)
    }

    dataQuery += ' ORDER BY bp.created_at DESC'

    const countResult = await query(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    dataQuery += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    const dataResult = await query(dataQuery, [...params, limit, offset])

    return NextResponse.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, title_sw, slug, content, excerpt, featured_image, is_published, is_featured, tags, published_at } = body

    if (!title || !title_sw || !slug || !content) {
      return NextResponse.json({ error: 'title, title_sw, slug, and content are required' }, { status: 400 })
    }

    const isPublished = is_published === true || is_published === 'true'
    const isFeatured = is_featured === true || is_featured === 'true'

    const result = await query(
      `INSERT INTO blog_posts (title, title_sw, slug, content, excerpt, featured_image, author_id, is_published, is_featured, tags, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, title, slug, is_published, created_at`,
      [title, title_sw, slug, content, excerpt || null, featured_image || null, userId, isPublished, isFeatured, tags || [], published_at ? new Date(published_at) : (isPublished ? new Date() : null)]
    )

    await logAuditEvent({ userId, action: 'create', entityType: 'blog_post', entityId: result.rows[0].id, newValues: { title, slug } })

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create blog post'
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}
