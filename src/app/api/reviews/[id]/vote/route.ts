import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('sid')?.value
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
        const col = helpful ? 'helpful_count' : 'not_helpful_count'
        await query(`UPDATE reviews SET ${col} = GREATEST(${col} - 1, 0) WHERE id = $1`, [id])
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
      const col = helpful ? 'helpful_count' : 'not_helpful_count'
      await query(`UPDATE reviews SET ${col} = ${col} + 1 WHERE id = $1`, [id])
    }

    const updated = await query(
      'SELECT helpful_count, not_helpful_count FROM reviews WHERE id = $1',
      [id]
    )

    return NextResponse.json(updated.rows[0])
  } catch (error: any) {
    console.error('Vote Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('sid')?.value

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
  } catch (error: any) {
    console.error('Vote GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
