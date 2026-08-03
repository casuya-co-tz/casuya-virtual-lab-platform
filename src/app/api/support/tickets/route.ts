import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

const ALLOWED_PRIORITIES = new Set(['low', 'normal', 'high', 'urgent'])

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const roleResult = await query('SELECT role FROM profiles WHERE id = $1', [userId])
    const isAdmin = roleResult.rows[0]?.role === 'admin'

    let result
    if (isAdmin) {
      result = await query(
        `SELECT st.id, st.subject, st.description, st.priority, st.status, st.plan_tier,
                st.assigned_to, st.created_at, st.updated_at,
                p.full_name AS user_name, u.email AS user_email
         FROM support_tickets st
         LEFT JOIN profiles p ON p.id = st.user_id
         LEFT JOIN auth.users u ON u.id = st.user_id
         ORDER BY
           CASE st.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
           st.created_at DESC`
      )
    } else {
      result = await query(
        `SELECT id, subject, description, priority, status, plan_tier, assigned_to, created_at, updated_at
         FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      )
    }
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, description, priority } = await req.json()
    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description required' }, { status: 400 })
    }

    const subResult = await query(
      `SELECT tier FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )
    const planTier = subResult.rows[0]?.tier || 'free'

    const rawPriority = priority && ALLOWED_PRIORITIES.has(priority) ? priority : undefined

    let assignedPriority = rawPriority || 'normal'
    if (!rawPriority) {
      if (planTier === 'enterprise') assignedPriority = 'high'
      else if (planTier === 'premium') assignedPriority = 'normal'
      else assignedPriority = 'low'
    }

    const result = await query(
      `INSERT INTO support_tickets (user_id, subject, description, priority, plan_tier)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, subject, description, priority, status, plan_tier, created_at`,
      [userId, subject, description, assignedPriority, planTier]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
