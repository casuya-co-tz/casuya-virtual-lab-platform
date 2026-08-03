import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromSession } from '@/lib/auth-guard'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const { helpful } = await req.json()
    if (typeof helpful !== 'boolean') {
      return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
    }

    const reviewResult = await query('SELECT id FROM reviews WHERE id = $1', [id])
    if (reviewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const existing = await query(
      'SELECT helpful FROM review_votes WHERE review_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (existing.rows.length > 0) {
      const oldVote = existing.rows[0].helpful
      if (oldVote === helpful) {
        await query('DELETE FROM review_votes WHERE review_id = $1 AND user_id = $2', [id, userId])
        if (helpful) {
          await query('UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = $1', [id])
        } else {
          await query('UPDATE reviews SET not_helpful_count = GREATEST(not_helpful_count - 1, 0) WHERE id = $1', [id])
        }
      } else {
        await query('UPDATE review_votes SET helpful = $1 WHERE review_id = $2 AND user_id = $3', [helpful, id, userId])
        if (helpful) {
          await query('UPDATE reviews SET helpful_count = helpful_count + 1, not_helpful_count = GREATEST(not_helpful_count - 1, 0) WHERE id = $1', [id])
        } else {
          await query('UPDATE reviews SET not_helpful_count = not_helpful_count + 1, helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = $1', [id])
        }
      }
    } else {
      await query(
        'INSERT INTO review_votes (review_id, user_id, helpful) VALUES ($1, $2, $3)',
        [id, userId, helpful]
      )
      if (helpful) {
        await query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1', [id])
      } else {
        await query('UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = $1', [id])
      }
    }

    const updated = await query(
      'SELECT helpful_count, not_helpful_count FROM reviews WHERE id = $1',
      [id]
    )

    return NextResponse.json(updated.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromSession()

    const reviewResult = await query('SELECT id FROM reviews WHERE id = $1', [params.id])
    if (reviewResult.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    let userVote = null
    if (userId) {
      const voteResult = await query(
        'SELECT helpful FROM review_votes WHERE review_id = $1 AND user_id = $2',
        [params.id, userId]
      )
      if (voteResult.rows.length > 0) {
        userVote = voteResult.rows[0].helpful
      }
    }

    return NextResponse.json({ user_vote: userVote })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
