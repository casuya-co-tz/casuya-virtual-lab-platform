import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { logAuditEvent } from '@/lib/audit-logger'
import { SimpleRateLimiter } from '@/lib/rate-limiter'
import { getUserIdFromSession } from '@/lib/auth-guard'

const postLimiter = new SimpleRateLimiter(3600000, 5)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage)
    const parsedLimit = parseInt(searchParams.get('limit') || '5')
    const limit = Number.isNaN(parsedLimit) ? 5 : Math.min(50, Math.max(1, parsedLimit))
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const parsedMinRating = parseInt(searchParams.get('min_rating') || '0')
    const minRating = Number.isNaN(parsedMinRating) ? 0 : Math.min(5, Math.max(0, parsedMinRating))

    const allowedSorts: Record<string, string> = { created_at: 'r.created_at', rating: 'r.rating', helpful_count: 'r.helpful_count' }
    const safeSort = allowedSorts[sort] || 'r.created_at'
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC'

    const offset = (page - 1) * limit

    const countResult = await query(
      `SELECT COUNT(*) FROM reviews WHERE is_public = true AND rating >= $1`,
      [minRating]
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await query(`
      SELECT r.id, r.rating, r.review_text, r.is_public, r.helpful_count, r.not_helpful_count, r.created_at, r.updated_at,
             p.full_name, p.role,
             CASE WHEN s.status = 'active' THEN true ELSE false END AS has_active_subscription
      FROM reviews r
      JOIN profiles p ON r.user_id = p.id
      LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
      WHERE r.is_public = true AND r.rating >= $1
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT $2 OFFSET $3
    `, [minRating, limit, offset])

    const data = result.rows.map(row => ({
      id: row.id,
      rating: row.rating,
      review_text: row.review_text,
      is_public: row.is_public,
      helpful_count: row.helpful_count,
      not_helpful_count: row.not_helpful_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      has_active_subscription: row.has_active_subscription,
      profiles: {
        full_name: row.full_name,
        role: row.role,
      },
    }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = postLimiter.check(userId, '/api/reviews')
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many reviews. Try again later.' }, { status: 429 })
    }

    const { rating, review_text, is_public } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!review_text || typeof review_text !== 'string') {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
    }

    const trimmed = review_text.trim()
    if (trimmed.length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 })
    }
    if (trimmed.length > 2000) {
      return NextResponse.json({ error: 'Review must be under 2000 characters' }, { status: 400 })
    }

    const sanitized = trimmed.replace(/<[^>]*>/g, '')

    const existingReview = await query('SELECT id FROM reviews WHERE user_id = $1 LIMIT 1', [userId])
    if (existingReview.rows.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a review' }, { status: 409 })
    }

    const result = await query(
      `INSERT INTO reviews (user_id, rating, review_text, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, rating, sanitized, is_public !== false]
    )

    await logAuditEvent({ userId, action: 'create', entityType: 'review', entityId: result.rows[0].id, ipAddress: ip })

    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
