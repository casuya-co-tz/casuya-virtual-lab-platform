import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { logAuditEvent } from '@/lib/audit-logger'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      'SELECT bp.*, p.full_name as author_name FROM blog_posts bp LEFT JOIN profiles p ON bp.author_id = p.id WHERE bp.id = $1',
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

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await query('SELECT id, title, slug FROM blog_posts WHERE id = $1', [params.id])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, title_sw, slug, content, excerpt, featured_image, is_published, is_featured, tags, published_at } = body

    if (!title || !title_sw || !slug || !content) {
      return NextResponse.json({ error: 'title, title_sw, slug, and content are required' }, { status: 400 })
    }

    const isPublished = is_published === true || is_published === 'true'
    const isFeatured = is_featured === true || is_featured === 'true'

    let resolvedPublishedAt = published_at ? new Date(published_at) : null
    if (isPublished && !resolvedPublishedAt) {
      const existingRow = await query('SELECT published_at FROM blog_posts WHERE id = $1', [params.id])
      resolvedPublishedAt = existingRow.rows[0]?.published_at ? new Date(existingRow.rows[0].published_at) : new Date()
    }

    const result = await query(
      `UPDATE blog_posts SET title = $1, title_sw = $2, slug = $3, content = $4, excerpt = $5, featured_image = $6, is_published = $7, is_featured = $8, tags = $9, published_at = $10, updated_at = NOW()
       WHERE id = $11 RETURNING id, title, slug, is_published, updated_at`,
      [title, title_sw, slug, content, excerpt || null, featured_image || null, isPublished, isFeatured, tags || [], resolvedPublishedAt, params.id]
    )

    await logAuditEvent({ userId, action: 'update', entityType: 'blog_post', entityId: params.id, newValues: { title, slug } })

    return NextResponse.json(result.rows[0])
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update blog post'
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await query('SELECT id, title FROM blog_posts WHERE id = $1', [params.id])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await query('DELETE FROM blog_posts WHERE id = $1', [params.id])
    await logAuditEvent({ userId, action: 'delete', entityType: 'blog_post', entityId: params.id, oldValues: { title: existing.rows[0].title } })

    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
