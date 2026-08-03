import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const messages = await query(
      `SELECT tm.id, tm.message, tm.is_internal, tm.created_at, p.full_name as sender_name
       FROM ticket_messages tm JOIN profiles p ON p.id = tm.sender_id
       WHERE tm.ticket_id = $1 AND (tm.is_internal = false OR (SELECT role FROM profiles WHERE id = $2) = 'admin')
       ORDER BY tm.created_at ASC`,
      [params.id, userId]
    )

    return NextResponse.json({ ...result.rows[0], messages: messages.rows })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const ticket = await query(
      `SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    )
    if (ticket.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const result = await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES ($1, $2, $3)
       RETURNING id, message, is_internal, created_at`,
      [params.id, userId, message]
    )

    await query(`UPDATE support_tickets SET updated_at = NOW() WHERE id = $1`, [params.id])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
