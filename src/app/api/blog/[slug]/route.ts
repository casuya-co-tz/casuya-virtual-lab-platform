import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(_req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const result = await query(
      `SELECT bp.id, bp.title, bp.title_sw, bp.slug, bp.content, bp.excerpt, bp.featured_image, bp.tags, bp.published_at, bp.updated_at, p.full_name as author_name
       FROM blog_posts bp LEFT JOIN profiles p ON bp.author_id = p.id
       WHERE bp.slug = $1 AND bp.is_published = true`,
      [params.slug]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
