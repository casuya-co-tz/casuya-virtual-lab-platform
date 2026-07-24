import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT id, subject, description, priority, status, plan_tier, assigned_to, created_at, updated_at
       FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
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

    let assignedPriority = priority || 'normal'
    if (!priority || priority === 'normal') {
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
