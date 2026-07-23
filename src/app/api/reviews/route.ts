import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Fetch top 5 recent reviews, joined with profile data
    const result = await query(`
      SELECT r.*, p.full_name, p.role
      FROM reviews r
      JOIN profiles p ON r.user_id = p.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `)

    const data = result.rows.map(row => ({
      ...row,
      profiles: {
        full_name: row.full_name,
        role: row.role
      }
    }))

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Reviews GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('sid')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rating, review_text } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO reviews (user_id, rating, review_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, rating, review_text]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Reviews POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
